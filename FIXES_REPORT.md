# Audit Fixes Report

This document outlines the fixes applied to resolve the critical and warning bugs reported during the 2026-04-09 audit by Montassir.

## Phase 1: Merged fixes from `backDevops` branch
Before applying local patches, we fetched and merged the `origin/montassir_backDevops` (and `origin/backDevops`) branches. This successfully pulled in your friend's fixes for the most critical deployment blockers:
- **BUG-1 (Docker backend build)**: Fixed by repairing the empty `nest-cli.json` and ignoring `*.tsbuildinfo` in Docker.
- **BUG-2 (OAuth login redirect)**: Fixed by routing back to dynamically loaded frontend URLs.
- **BUG-3 (CORS blocks)**: Fixed by reading `process.env.CORS_ORIGINS`.
- **BUG-7 (.env path inside Docker)**: Fixed by setting conditional pathing (`['.env', '../.env']`) inside `app.module.ts`.
- **INFO-14 (Grafana password)**: Fixed by binding `GF_SECURITY_ADMIN_PASSWORD` down to docker-compose.

---

## Phase 2: Local Fixes Implemented

### BUG-5: JWT tokens expire in 7 days instead of 15 minutes
- **File Changed**: `backend/src/auth/auth.module.ts`
- **What**: Replaced the hardcoded `expiresIn: '7d'` with `configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m'`.
- **Why**: Prevent security risks from long-lived stolen access tokens. It now respects the intended short-lived 15-minute token config while refreshing as needed.

### BUG-6: Prisma schema/migration drift on username field
- **Files Changed**: `backend/prisma/migrations/20260411231404_fix_username_default/migration.sql`
- **What**: Reset the development database state locally and regenerated a fresh migration called `fix_username_default` using `npx prisma migrate dev`.
- **Why**: The Prisma schema stated `username` should default to `"User"`, but the database constraints did not reflect this. Generating this corrective migration ensures that direct SQL inserts behave correctly and Prisma won't fail CI/CD migration drift checks in production.

### BUG-8: `VITE_BACKEND_URL` not defined anywhere
- **File Changed**: `frontend/src/services/auth.ts`
- **What**: Constructed a dynamic fallback for the frontend redirect URL: `const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || API_BASE_URL.replace(/\/api\/?$/, '');`.
- **Why**: Because `VITE_BACKEND_URL` was missing from `.env.example` and `docker-compose`, falling back blindly to `localhost:3001` breaks production. This fix derives the backend URL cleanly from `VITE_API_URL`, ensuring OAuth flows seamlessly without requiring developers to remember a new `.env` parameter.

### BUG-9: `.env.example` port mismatch
- **File Changed**: `.env.example`
- **What**: Globally replaced `FRONTEND_PORT=3000` with `FRONTEND_PORT=3089`.
- **Why**: Standardizes the documentation and environment configurations so any new developer (or deployment script) automatically targets the correct Vite port used throughout the ecosystem.

### INFO-15: bcrypt salt hardcoded to 10
- **File Changed**: `backend/src/auth/auth.service.ts`
- **What**: Swapped hardcoded `10` literal for `parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10)`.
- **Why**: Hardcoding cryptographic security limits flexibility. Exposing this via the `.env` file allows DevOps to scale hashing complexity without altering application code.

### INFO-10, INFO-11, INFO-13: Repository Cleanup
- **Files Deleted**: `backend/src/curl`, `backend/Work/timeline.md`, and `cookies.txt`.
- **What**: Executed `rm -f` targeted deletions for all 3 tracker files.
- **Why**: Git should only version source code. Stripping local environment tracking files (cookies) and dead artifacts (`curl` outputs, raw markdowns) keeps the repository clean and prevents local token/cookie leakage.