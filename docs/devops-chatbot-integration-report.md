# Freelancer CRM - Role and Implementation Report

Date: 2026-04-12
Role focus: Senior DevOps and Backend owner for chatbot, observability, and runtime reliability.
Scope: What was implemented, why it was implemented, and file-by-file ownership details.

---

## 1. Executive Summary

You completed a full architecture hardening pass across backend, frontend, DevOps, and monitoring.

Major outcomes:
- Chatbot moved from browser-side LLM calls to server-side protected endpoint.
- Frontend now calls backend chatbot API using existing cookie-based auth flow.
- Prometheus duplicate backend scraping removed.
- HTTP metrics instrumentation wired globally using Nest interceptor.
- Backup naming consistency improved across automated and manual restore paths.

Result: better security posture, cleaner observability, and more predictable operations.

---

## 2. Your Role and Ownership

You acted as:
- Architecture owner for chatbot integration boundaries.
- Backend owner for Nest module/controller wiring and auth-protected API design.
- DevOps owner for monitoring config correctness and backup process consistency.
- Reliability owner for startup/build/runtime verification.

You explicitly kept these constraints intact:
- No auth flow breakage (JWT HttpOnly cookie + /api/auth/me behavior kept).
- No Prisma schema changes.
- No compose service name or port changes.
- Frontend axios withCredentials pattern preserved.

---

## 3. Implemented Changes by Priority

### 3.1 Priority 1 - Backend chatbot service wired

Delivered:
- New authenticated endpoint: POST /api/chatbot/chat.
- New chatbot module with PrismaModule import.
- Module imported into AppModule.
- DeepSeek key moved from Vite-exposed variable to backend-only environment variable.

Behavior now:
- Unauthenticated chatbot requests return 401.
- Backend owns LLM key usage and data-context generation.

### 3.2 Priority 2 - Frontend chatbot migrated to backend endpoint

Delivered:
- Removed browser direct calls to DeepSeek.
- Removed frontend prompt assembly and CRM snapshot injection for AI generation.
- Chatbot now calls backend endpoint with { message } via existing axios instance.
- Reply rendering and action-trigger flow preserved.
- CRUD form flows left unchanged.

Behavior now:
- Frontend remains UI and action-orchestration layer.
- Backend is single source for LLM orchestration.

### 3.3 Priority 3 - Prometheus duplicate job removed

Delivered:
- Removed duplicate backend scrape job.
- Kept single job nestjs-backend with /api/metrics on backend:3001.

### 3.4 Priority 4 - HTTP metrics instrumentation wired

Delivered:
- Added global Nest interceptor for request count and latency tracking.
- Added explicit error counter metric for 4xx/5xx responses.
- Registered interceptor globally via APP_INTERCEPTOR.

Behavior now:
- /api/metrics includes request/latency/error metric families.

### 3.5 Priority 5 - Backup naming consistency improved

Delivered:
- Automated backup naming switched to backup_TIMESTAMP.sql.gz.
- Cleanup/list patterns updated to backup_*.sql.gz.
- Restore tooling accepts both backup_* and legacy crm_* for compatibility.
- Makefile restore help/usage updated and .gz restore support added.

---

## 4. File-by-File Ownership Map

### 4.1 Backend - Chatbot wiring

File: backend/src/chatbot/chatbot.controller.ts
- Added new controller.
- Added JWT-protected POST /chatbot/chat endpoint.
- Accepts message from body.
- Calls ChatbotService.
- Returns reply and optional parsed action object.

File: backend/src/chatbot/chatbot.module.ts
- Added new module.
- Declares ChatbotController and ChatbotService.
- Imports PrismaModule.

File: backend/src/app.module.ts
- Imported ChatbotModule.
- Registered global APP_INTERCEPTOR provider for metrics.

### 4.2 Backend - Observability instrumentation

File: backend/src/metrics/metrics.interceptor.ts
- Added global HTTP metrics interceptor.
- Captures method, route, status code.
- Increments request counter.
- Observes request latency histogram.
- Increments error counter for status >= 400.

File: backend/src/metrics/metrics.service.ts
- Added http_errors_total counter definition.
- Kept existing request total and duration metrics.

### 4.3 Frontend - Chatbot API migration

File: frontend/src/components/ChatbotAI/ChatbotAI.tsx
- Added axios API client usage for chatbot calls.
- Removed direct fetch to api.deepseek.com.
- Removed VITE_DEEPSEEK_API_KEY usage.
- Removed frontend AI prompt construction and CRM context fetch used for prompt building.
- Added backend response model handling for reply and action.
- Kept CRUD modal and mutation logic unchanged.

### 4.4 DevOps - Monitoring and backup consistency

File: docker/prometheus.yml
- Removed duplicate backend scrape job.
- Retained single job nestjs-backend with valid target/path.

File: scripts/backup-db.sh
- Changed automated backup filename prefix from crm_ to backup_.
- Updated retention cleanup pattern.
- Updated listing pattern accordingly.

File: scripts/restore-db.sh
- Extended backup discovery to include both backup_* and crm_* patterns.
- Preserves backward compatibility with older backup naming.

File: Makefile
- Updated db-restore help text to include .sql and .sql.gz.
- Added gzip restore support in db-restore target.
- Updated usage example in help output.

### 4.5 Secrets and environment hygiene

File: .env.example
- Replaced frontend-exposed VITE_DEEPSEEK_API_KEY with backend-side DEEPSEEK_API_KEY template.

File: .env
- Replaced VITE_DEEPSEEK_API_KEY with DEEPSEEK_API_KEY for backend use.

---

## 5. Current Architecture After Your Changes

### 5.1 Chatbot flow (current)

1. User sends message from frontend chatbot.
2. Frontend calls backend POST /api/chatbot/chat (authenticated cookie session).
3. Backend chatbot service fetches CRM context from Prisma.
4. Backend calls DeepSeek with server-side key.
5. Backend returns reply and optional action payload.
6. Frontend renders response and triggers existing CRUD modal flows when action exists.

### 5.2 Auth and session model

- JWT in HttpOnly cookie remains the auth primitive.
- Axios withCredentials remains enabled and unchanged.
- JwtAuthGuard now protects chatbot endpoint.

### 5.3 Monitoring model

- Prometheus scrapes one backend metrics job (nestjs-backend).
- Backend now emits request totals, duration histogram, and error totals through global instrumentation.

---

## 6. Verification Summary

Completed checks:
- Frontend production build successful.
- Backend build successful in running backend container.
- make up completed with rebuilt images and healthy service state.
- Chatbot endpoint returns 401 when called without auth cookie (expected behavior).
- Metrics endpoint exposes:
	- http_requests_total
	- http_request_duration_seconds
	- http_errors_total

Note:
- Local host-side backend npm run build can fail if Nest CLI is not installed on host.
- Containerized build path works and was validated.

---

## 7. Operational Runbook (Updated)

Daily commands:
- make up
- make status
- make logs

Chatbot checks:
- Login in browser.
- Use chatbot UI and confirm replies are served.
- Verify CRUD action prompts still open forms and execute API mutations.

Monitoring checks:
- curl http://localhost:3001/api/metrics
- confirm request/latency/error metric families exist.

Backup/restore checks:
- Automated backups write backup_*.sql.gz in backup volume.
- Manual restore supports .sql and .sql.gz.
- Restore script can still list legacy crm_* files.

---

## 8. What This Gives You

Security improvements:
- LLM key no longer exposed through Vite client variable.
- Server-side chatbot endpoint now auth-protected.

Reliability improvements:
- Single backend scrape source avoids duplicate series noise.
- Global HTTP instrumentation provides real request telemetry.
- Backup/restore path is clearer and less error-prone.

Maintainability improvements:
- Chatbot responsibility boundaries are clean (frontend UI vs backend AI orchestration).
- File ownership map makes future handover and audits easier.

---

## 9. Final Status

The implementation goals were achieved end-to-end.

Your contribution delivered a production-safer chatbot architecture, better observability wiring, and cleaner operational backup behavior while preserving existing auth and service contracts.
