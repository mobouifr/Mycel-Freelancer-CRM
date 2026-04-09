# Freelancer CRM - Bug Report

**Date:** 2026-04-09
**Branch audited:** `montassir_backDevops` / `backDevops` (same commit `ab8e118`)
**Reported by:** Montassir

---

## CRITICAL - Will break in production

These bugs work fine on localhost but will silently fail when deployed.

---

### BUG-1: Docker backend build fails (`/app/dist: not found`)

**Status:** FIXED on `montassir_backDevops`
**Assigned to:** Montassir (DevOps) + Othmane (root cause)

**What happened:**
- `backend/nest-cli.json` has been an empty 0-byte file since it was created. Othmane copied it from `.github/ISSUE_TEMPLATE/.gitkeep` (a placeholder) instead of letting `nest new` generate it.
- `backend/.dockerignore` excludes `dist/` (correct) but not `*.tsbuildinfo`. The stale `tsconfig.tsbuildinfo` tricks TypeScript's incremental compiler into thinking everything is already compiled, so it produces no output.
- The build appeared to work before because there was no `.dockerignore` — the host's `dist/` folder leaked into Docker.

**Fix applied:**
- Added proper content to `backend/nest-cli.json`
- Added `*.tsbuildinfo` to `backend/.dockerignore`

---

### BUG-2: OAuth login redirects to `localhost` in production

**Assigned to:** Othmane
**File:** `backend/src/auth/auth.controller.ts` line 114

```ts
// CURRENT (broken in production)
return res.redirect('http://localhost:3089/auth/callback');

// SHOULD BE
const frontendUrl = this.configService.get('FRONTEND_URL');
return res.redirect(`${frontendUrl}/auth/callback`);
```

**Why it matters:** After 42 OAuth login, every user gets redirected to `localhost:3089` instead of the actual domain. Login is completely broken outside local dev.

---

### BUG-3: CORS blocks all requests in production

**Assigned to:** Solayman (owns `main.ts`)
**File:** `backend/src/main.ts` lines 10-13

```ts
// CURRENT (hardcoded)
app.enableCors({
  origin: ['http://localhost:3089', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
});

// SHOULD BE
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3089'],
  credentials: true,
});
```

**Why it matters:** The `.env.example` already defines `CORS_ORIGINS` but the code never reads it. In production, all frontend requests will be blocked by CORS.

---

### BUG-4: Monitoring stack (Prometheus + Grafana) does nothing

**Assigned to:** Solayman (owns Docker/infra)
**File:** `docker/prometheus.yml` lines 18-22

Prometheus is configured to scrape `backend:3001/metrics`, but:
- There is no `/metrics` endpoint in the backend
- `prom-client` or `@nestjs/prometheus` are not in `package.json`
- No code exports any metrics

The entire Grafana + Prometheus setup is decoration. Either implement metrics or remove the monitoring stack.

---

## WARNING - Will cause problems

---

### BUG-5: JWT tokens expire in 7 days instead of 15 minutes

**Assigned to:** Othmane
**File:** `backend/src/auth/auth.module.ts` line 19

```ts
// CURRENT
signOptions: { expiresIn: '7d' }

// .env.example says
JWT_ACCESS_EXPIRES_IN=15m
```

The env var is never read. A 7-day access token means if a token is stolen, the attacker has a full week. The `.env.example` suggests 15 minutes was intended but never wired up.

---

### BUG-6: Prisma schema/migration drift on `username` field

**Assigned to:** SOUITA + Montassir (own prisma/)
**File:** `backend/prisma/schema.prisma` line 19 vs migration `20260403094145`

Schema has `@default("User")` but the migration has no `DEFAULT` constraint. This means:
- Direct SQL inserts will get `NULL` instead of `"User"`
- `prisma migrate dev` on a fresh DB will detect drift and try to fix it

**Fix:** Run `npx prisma migrate dev --name fix_username_default` to generate a corrective migration.

---

### BUG-7: `.env` path wrong inside Docker container

**Assigned to:** Solayman
**File:** `backend/src/app.module.ts` line 15

```ts
envFilePath: '../../.env'  // resolves to /../../.env in container (WORKDIR is /app)
```

Only works currently because `docker-compose.yml` injects env vars separately. Will break if someone runs the backend outside of docker-compose.

---

### BUG-8: `VITE_BACKEND_URL` not defined anywhere

**Assigned to:** Frontend owner (Othmane / Hiba / Montassir)
**File:** `frontend/src/services/auth.ts` line 11

Code uses `import.meta.env.VITE_BACKEND_URL` but this variable is not in `.env.example` or docker-compose. Falls back to `http://localhost:3001`. Will break in production.

---

### BUG-9: `.env.example` port mismatch

**Assigned to:** Solayman
**File:** `.env.example`

`FRONTEND_PORT=3000` but the actual port is `3089` everywhere (docker-compose, vite config). This will confuse anyone setting up the project for the first time.

---

## INFO - Cleanup needed

| # | What | File | Assigned to |
|---|------|------|-------------|
| 10 | Empty junk file in source | `backend/src/curl` | Othmane |
| 11 | Personal notes tracked in git | `backend/Work/timeline.md` | Whoever created it |
| 12 | No frontend `.dockerignore` | Missing file | Solayman (infra) |
| 13 | `cookies.txt` committed to repo | `cookies.txt` (project root) | Whoever committed it |
| 14 | Grafana default password is `admin` | `docker-compose.yml` line 241 | Solayman |
| 15 | bcrypt salt hardcoded to 10 | `backend/src/auth/auth.service.ts` line 28 | Othmane |

---

## Priority order

1. **BUG-2, BUG-3** - Fix before any deployment attempt (auth + CORS = app unusable)
2. **BUG-5** - Security risk, quick fix
3. **BUG-4** - Decide: implement metrics or remove monitoring stack
4. **BUG-6, BUG-7, BUG-8, BUG-9** - Fix before deployment
5. **INFO items** - Fix when convenient
