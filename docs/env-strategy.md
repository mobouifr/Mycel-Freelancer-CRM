# Environment Variable Strategy

> How environment variables work across local, staging, and production.

---

## Variable Reference by Environment

| Variable | Local (Dev) | Staging | Production | Secret? |
|---|---|---|---|---|
| `NODE_ENV` | `development` | `staging` | `production` | No |
| `PORT` | `3001` | `3001` | `3001` | No |
| `FRONTEND_PORT` | `3000` | — (Nginx) | — (Nginx) | No |
| `CORS_ORIGINS` | `http://localhost:3000` | `https://staging.crm.com` | `https://crm.yourdomain.com` | No |
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/freelancer_crm` | `postgresql://user:pass@staging-db:5432/crm` | `postgresql://user:pass@prod-db:5432/crm` | **🔐 YES** |
| `POSTGRES_PASSWORD` | `password` | Random 32-char | Random 64-char | **🔐 YES** |
| `JWT_SECRET` | Any string | Random 64-char | Random 64-char | **🔐 YES** |
| `JWT_ACCESS_EXPIRES_IN` | `7d` (relaxed) | `1h` | `15m` | No |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | `7d` | `7d` | No |
| `BCRYPT_SALT_ROUNDS` | `10` (faster) | `12` | `12` | No |
| `VITE_API_URL` | `http://localhost:3001/api` | `https://staging.crm.com/api` | `https://crm.yourdomain.com/api` | No |
| `VITE_WS_URL` | `http://localhost:3001` | `wss://staging.crm.com` | `wss://crm.yourdomain.com` | No |
| `EMAIL_PASSWORD` | Test password | App password | App password | **🔐 YES** |
| `OPENAI_API_KEY` | Test key / empty | API key | API key | **🔐 YES** |
| `LOG_LEVEL` | `debug` | `info` | `warn` | No |
| `RATE_LIMIT_MAX` | `1000` (relaxed) | `100` | `100` | No |
| `SENTRY_DSN` | Empty | Sentry URL | Sentry URL | **🔐 YES** |

---

## Secrets Handling

### Which Variables Are Secrets?

```
DATABASE_URL          # Contains DB credentials
POSTGRES_PASSWORD     # DB root password
JWT_SECRET            # Token signing key — if leaked, all sessions compromised
EMAIL_PASSWORD        # SMTP credentials
OPENAI_API_KEY        # Billed API key
SENTRY_DSN            # Error tracking endpoint
```

### How to Handle Secrets Safely

| Environment | Method |
|---|---|
| **Local dev** | `.env` file (in `.gitignore`, never committed) |
| **GitHub Actions** | Repository Secrets (`Settings → Secrets → Actions`) |
| **Staging/Prod (Docker)** | Docker Secrets or inject via CI/CD pipeline env vars |
| **Cloud (AWS/GCP)** | Use a secrets manager (AWS Secrets Manager, GCP Secret Manager, Vault) |

### Rules

1. **Never** commit `.env` — only `.env.example` with placeholder values
2. **Never** hardcode secrets in Dockerfiles or `docker-compose.yml`
3. **Never** log secrets — mask them in your logging middleware
4. **Rotate** `JWT_SECRET` and `POSTGRES_PASSWORD` at least quarterly
5. **Use separate API keys** per environment for OpenAI and email

---

## File Flow

```
.env.example          ← Committed to Git (safe placeholder values)
    ↓ cp
.env                  ← Local dev (in .gitignore, never committed)
.env.staging          ← Staging overrides (in .gitignore)
.env.production       ← Production overrides (in .gitignore)
```

### Generate Secrets Quickly

```bash
# JWT Secret (64-char hex)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Database Password (32-char)
openssl rand -base64 32

# Quick random string
openssl rand -hex 32
```
