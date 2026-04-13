*This project has been created as part of the 42 curriculum by mobouifr, oer-refa, soel-mou, csouita, hichokri.*

---

# Mycel — Freelancer CRM

> A production-ready Customer Relationship Management platform for independent freelancers, built as the **ft_transcendence Surprise** capstone project at 42 School.

---

## Description

**Mycel** is a full-stack web application that gives freelancers a unified workspace to run their business. Instead of juggling separate tools, everything lives in one place: client records, project tracking, a calendar, notes, revenue analytics, and even an AI assistant that understands your own business data.

### Project Name and Goal

The platform is named **Mycel** — a reference to mycelium, the fungal network that connects and nourishes ecosystems. The goal mirrors that metaphor: connect every aspect of a freelancer's workflow into a single, living system.

### Key Features

| Category | Feature |
|---|---|
| **Authentication** | Email/password login, 42 OAuth single sign-on, Two-Factor Authentication (TOTP), JWT via HttpOnly cookies |
| **Client Management** | Full CRUD with server-side search, multi-field sorting, and cursor-based pagination |
| **Project Management** | Status lifecycle (Active → Completed / Paused / Cancelled), priority levels, budget and deadline tracking |
| **Dashboard** | Configurable widget grid with real-time SSE updates — Revenue KPI, Activity Heatmap, Activity Feed, Project Status Bar, Data Graph, Calendar, Notes, Next Deadline |
| **Calendar & Reminders** | Four-mode calendar (Month / Week / Day / Lane), event scheduling with client/project tags, pinnable colour-coded notes |
| **AI Chatbot** | DeepSeek LLM with live CRM context injection, token-streaming via SSE, Markdown/code rendering, per-user rate limiting |
| **Gamification** | XP and level progression triggered by CRM actions; collectible achievements and badges |
| **Notifications** | Real-time bell badge powered by SSE; read/unread tracking; deep-link navigation to related entities |
| **Internationalisation** | Full English / French / Spanish UI with browser-language auto-detection and runtime switching |
| **Monitoring** | Prometheus metrics, Grafana dashboards, PostgreSQL exporter, daily automated backups |

---

## Team Information

### Members, Roles, and Responsibilities

| 42 Login | Name | Role(s) | Responsibilities |
|---|---|---|---|
| **mobouifr** | Montassir Bouifraden | Tech Lead · DevOps · Backend · Frontend | CI/CD, Docker Compose maintenance, backend architecture, testing infrastructure (74 tests), server-side sorting and pagination, notifications module, security fixes, dead code audit, bug triage; dashboard widget grid, Calendar and Reminders UI (4-mode calendar, event modal, sticky notes), chatbot UI/UX widget, frontend routing and layout |
| **oer-refa** | Othmane Er-Refaly | Backend Lead | JWT/HttpOnly-cookie authentication, 42 OAuth integration, Two-Factor Authentication (TOTP + QR code), real-time SSE infrastructure (`globalMutation$` bus), dashboard analytics (revenue, heatmap, activity feed), Reminders/Calendar backend |
| **soel-mou** | Solayman | DevOps · Backend | Docker Compose stack (Nginx, Postgres, monitoring, backup), Prisma schema ownership and migrations, AI Chatbot module (DeepSeek API, SSE streaming, context injection, rate limiting), Prometheus/Grafana provisioning, i18n pipeline (EN/FR/ES), Makefile automation |
| **csouita** | Souita | Backend Developer | Gamification module (XP awards, level thresholds, achievements, badges), Notifications SSE architecture, integration of gamification events with notification streams |
| **hichokri** | Hiba Chokri | Frontend Developer | Client and Project list/detail/create/edit pages, React Router background-location modal overlay pattern, form validation with Zod + React Hook Form |

---

## Project Management

### Work Organisation

- **Domain ownership:** Each developer owned one or more feature domains end-to-end (frontend + backend). Boundaries were kept explicit so parallel development avoided merge conflicts.
- **Branching strategy:** Personal branches per developer (`OthmaneBranch`, `Solayman`, `SouitaBack`, `montassir`, `Hiba`) merged into the `backDevops` integration branch, then promoted to `main` after review.
- **Code review:** The Tech Lead reviewed integration merges before reaching `main`; team members peer-reviewed in-flight pull requests.
- **Weekly sync:** Stand-up meetings once a week to report progress, surface blockers, and re-prioritise work against the evaluation checklist.
- **Evaluation rehearsals:** Full end-to-end dry-runs with the evaluator checklist before the final defense date.

### Tools Used

| Purpose | Tool |
|---|---|
| Version control & code hosting | Git + GitHub (`solacode-SC/freelancer-crm-final-project`) |
| Issue / task tracking | GitHub branch-per-feature naming + team discussion threads |
| Communication | Discord — daily async updates, voice calls for blockers, screen-sharing for reviews |
| API testing | Postman, cURL |
| Database inspection | Prisma Studio (`make studio`) |
| Container management | Docker Desktop / CLI |

---

## Technical Stack

### Frontend

| Technology | Version | Why it was chosen |
|---|---|---|
| **React** | 19.2.0 | Industry-standard component model; concurrent mode; large ecosystem |
| **TypeScript** | ~5.9.3 | End-to-end type safety across API boundaries via shared DTOs |
| **Vite** | 7.3.1 | Sub-second HMR; tree-shaking; manual chunk splitting per page group |
| **Tailwind CSS** | 4.2.1 | Utility-first approach enables fast UI iteration without style conflicts between developers |
| **React Router** | 7.13.1 | Background-location pattern lets list pages stay rendered behind modal overlays |
| **React Hook Form + Zod** | 7.72.0 / 4.3.6 | Uncontrolled forms with schema-level validation; minimal re-renders |
| **Axios** | 1.13.6 | Interceptors for unified error handling and auth; response typing |
| **i18next + react-i18next** | 24.2.2 | Runtime language switching without page reload; browser language detection |
| **react-grid-layout** | 2.2.2 | Drag-and-drop resizable dashboard widget grid |
| **react-markdown + rehype-highlight** | 10.1.0 / 7.0.2 | Renders chatbot Markdown responses including syntax-highlighted code blocks |

### Backend

| Technology | Version | Why it was chosen |
|---|---|---|
| **NestJS** | 10.x | Modular DI architecture maps directly to CRM domains (one module = one owner); Guards, Pipes, and Interceptors reduce boilerplate |
| **TypeScript** | 5.0.0 | Shared type surface with frontend |
| **Prisma ORM** | 5.21.1 | Type-safe database client generated from schema; migration history; zero SQL injection surface |
| **@nestjs/passport + strategies** | — | Strategy pattern for Local, JWT, and 42 OAuth with consistent guard interface |
| **@nestjs/throttler** | 6.5.0 | Declarative rate limiting at route or global level |
| **RxJS** | 7.8.0 | `Subject`-based reactive mutation bus for SSE streams (filter once, fan out to many consumers) |
| **otplib** | 12.0.1 | TOTP secret generation and verification (RFC 6238) |
| **@willsoto/nestjs-prometheus + prom-client** | 6.1.0 / 15.1.3 | Prometheus metrics exposed at `/api/metrics` with NestJS DI integration |

### Database

| Component | Choice | Justification |
|---|---|---|
| **Database engine** | PostgreSQL 16 | ACID compliance; UUID primary keys; Decimal type for budgets; strong Prisma support |
| **ORM** | Prisma | Type-safe queries; migration-based schema management; `$transaction` support; Studio GUI for inspection |
| **DB management UI** | Adminer 4.8.1 | Lightweight web-based inspector for development use |

### Infrastructure

| Component | Technology |
|---|---|
| Containerisation | Docker + Docker Compose v2 (dev and prod configurations) |
| Reverse proxy | Nginx (HTTPS termination, API proxy, static asset serving) |
| Monitoring | Prometheus v2.51.0 + Grafana 10.4.0 + `postgres-exporter` v0.15.0 |
| Database backups | Alpine cron container running `pg_dump` nightly at 02:00 UTC, gzip-compressed, stored in named Docker volume |
| Dev HTTPS | Self-signed certificate generated via OpenSSL (`make ssl-dev-cert`) |

### Major Technical Choice Justifications

- **NestJS over plain Express:** The module/service/controller structure enforces clear ownership boundaries — each team member owned their module directory. Dependency injection made unit testing (mocking `PrismaService`) straightforward without global test setup.
- **PostgreSQL over MongoDB:** CRM data is inherently relational (User → Client → Project → Notification). Foreign-key constraints and cascade deletes enforced data integrity at the database level rather than in application code.
- **SSE over WebSockets:** Dashboard and notification updates are strictly server-to-client. SSE avoids the overhead of a bidirectional WebSocket channel, is firewall-friendly, and integrates natively with the browser `EventSource` API. The RxJS `Subject` in `PrismaService` acts as an in-process event bus: any write operation calls `.next()`, and each SSE endpoint subscribes and filters for its relevant models.
- **DeepSeek LLM for the AI chatbot:** The DeepSeek API is OpenAI-compatible (drop-in replacement), significantly cheaper for streaming completions, and fast enough for real-time token delivery. The chatbot receives the user's live CRM data (clients, projects, revenue) injected into the system prompt at request time, enabling genuinely useful business-specific responses.

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                            User                                   │
│  id · email · username · name · phone · businessName             │
│  passwordHash · intraId · isTwoFactorEnabled · twoFactorSecret   │
│  defaultCurrency · taxRate · xp · level                          │
└────────────────────────────┬─────────────────────────────────────┘
             1               │
             │ N             │ N             │ N             │ N
     ┌───────┴──────┐ ┌──────┴──────┐ ┌─────┴──────┐ ┌─────┴──────┐
     │   Client     │ │   Project   │ │    Note    │ │   Event    │
     │  id · name   │ │ id · title  │ │ id · title │ │ id · title │
     │  email       │ │ status      │ │ content    │ │ date · time│
     │  phone       │ │ priority    │ │ tags[]     │ │ eventType  │
     │  company     │ │ budget      │ │ color      │ │ priority   │
     │  notes       │ │ deadline    │ │ pinned     │ │ clientTag  │
     │  userId (FK) │ │ userId (FK) │ │ userId(FK) │ │ projectTag │
     └───────┬──────┘ │ clientId(FK)│ └────────────┘ │ userId(FK) │
             │ 1:N    └─────────────┘                └────────────┘
             └──────────────┘

     ┌────────────────┐  ┌─────────────────────┐  ┌────────────────────┐
     │  Notification  │  │  UserAchievement     │  │   UserBadge        │
     │  id · message  │  │  id · type · name    │  │  id · type · name  │
     │  title · read  │  │  earnedAt            │  │  earnedAt          │
     │  type          │  │  userId (FK)         │  │  userId (FK)       │
     │  targetType    │  │  UNIQUE(userId,type) │  │  UNIQUE(userId,type│
     │  targetId      │  └─────────────────────┘  └────────────────────┘
     │  userId (FK)   │
     └────────────────┘
```

### Model Reference

#### User
| Field | Type | Constraints |
|---|---|---|
| id | String (UUID) | Primary key, default: `cuid()` |
| email | String | Unique |
| username | String | default: `"User"` |
| name, phone, businessName, businessAddress, logoUrl | String? | Nullable |
| defaultCurrency | String | default: `"USD"` |
| taxRate | Decimal(5,2) | default: `0` |
| password, passwordHash | String? | Nullable; local auth only |
| intraId | String? | Unique; 42 OAuth identifier |
| isTwoFactorEnabled | Boolean | default: `false` |
| twoFactorSecret | String? | Encrypted TOTP seed |
| xp | Int | default: `0` |
| level | Int | default: `1` |
| createdAt, updatedAt | DateTime | Auto-managed |

#### Client
| Field | Type | Constraints |
|---|---|---|
| id | String (UUID) | Primary key |
| name | String | Required |
| email, phone, company, notes | String? | Nullable |
| userId | String | FK → User (cascade delete) |
| createdAt, updatedAt | DateTime | Auto-managed |

#### Project
| Field | Type | Constraints |
|---|---|---|
| id | String (UUID) | Primary key |
| title | String | Required |
| description | String? | Nullable |
| status | Enum | `ACTIVE` / `COMPLETED` / `PAUSED` / `CANCELLED`, default: `ACTIVE` |
| priority | Enum | `HIGH` / `MEDIUM` / `LOW`, default: `MEDIUM` |
| budget | Decimal(10,2) | default: `0` |
| deadline | DateTime? | Nullable |
| userId | String | FK → User (cascade delete) |
| clientId | String | FK → Client (cascade delete) |
| createdAt, updatedAt | DateTime | Auto-managed |

#### Notification
| Field | Type | Notes |
|---|---|---|
| id | String (UUID) | Primary key |
| message | String | Required |
| title | String? | Optional heading |
| read | Boolean | default: `false` |
| type | String | `"info"` / `"success"` / `"warning"` / `"error"`, default: `"info"` |
| targetType, targetId | String? | Deep-link to related entity (e.g., `"client"`, `"project"`) |
| userId | String | FK → User (cascade delete) |
| createdAt | DateTime | Auto-managed |

#### Note
| Field | Type | Notes |
|---|---|---|
| id | String (UUID) | Primary key |
| title, content | String | Required |
| tags | String[] | PostgreSQL array |
| color | String | UI colour key, default: `"default"` |
| pinned | Boolean | default: `false` |
| userId | String | FK → User (cascade delete) |
| createdAt, updatedAt | DateTime | Auto-managed |

#### Event (Calendar)
| Field | Type | Notes |
|---|---|---|
| id | String (UUID) | Primary key |
| title, date, time | String | Required |
| endDate, endTime | String? | Optional end time |
| description, eventType, priority | String? | |
| location, externalLink | String? | |
| clientTag, projectTag | String? | Links to CRM entities |
| userId | String | FK → User (cascade delete) |
| createdAt, updatedAt | DateTime | Auto-managed |

#### UserAchievement / UserBadge
| Field | Type | Notes |
|---|---|---|
| id | String (UUID) | Primary key |
| type | String | e.g. `"FIRST_PROJECT"`, `"HIGH_ROLLER"` |
| name | String | Display label |
| earnedAt | DateTime | default: `now()` |
| userId | String | FK → User (cascade delete) |
| — | Unique constraint | `(userId, type)` — each achievement earned only once |

---

## Features List

### Authentication & Security

| Feature | Developer(s) | Description |
|---|---|---|
| Email / password auth | oer-refa | Registration and login with bcrypt-hashed passwords (12 salt rounds); returns JWT in HttpOnly, Secure, SameSite=Lax cookie |
| 42 OAuth | oer-refa | `passport-42` strategy; on callback, creates a new user or links to an existing one by email; configurable redirect URI |
| Two-Factor Auth (TOTP) | oer-refa | `otplib` generates a TOTP secret; `qrcode` renders a scannable QR code; TOTP code verified server-side before issuing a JWT |
| JWT guard | oer-refa, mobouifr | `JwtAuthGuard` protects all private routes; token extracted from `jwt` cookie and validated by `JwtStrategy` |
| Rate limiting | mobouifr | `@nestjs/throttler` configured globally at 10,000 requests / 5-minute window |

### Client Management

| Feature | Developer(s) | Description |
|---|---|---|
| CRUD | hichokri, mobouifr | Create, view, edit, and delete client records; deleting a client cascades to all their projects |
| Server-side search | mobouifr | Case-insensitive full-name search via Prisma `contains` filter |
| Server-side sorting | mobouifr | Any column (name, createdAt, etc.) sortable via query params; direction ASC/DESC |
| Cursor-based pagination | mobouifr | `take` + optional `cursor` params; default page size 50, capped at 200 |
| Detail view | hichokri | Full profile with linked projects list |
| Modal overlay routing | hichokri | Create / edit / detail modals keep the list visible and blurred in the background (React Router background-location pattern) |

### Project Management

| Feature | Developer(s) | Description |
|---|---|---|
| CRUD | hichokri, mobouifr | Full lifecycle; deleting a project cascades to its notifications |
| Status management | hichokri | `ACTIVE`, `COMPLETED`, `PAUSED`, `CANCELLED` with badge-style display |
| Priority levels | hichokri | `HIGH`, `MEDIUM`, `LOW` with visual indicators |
| Budget & deadline | hichokri | Decimal budget field; optional DateTime deadline |
| Server-side sorting + pagination | mobouifr | Same system as clients |

### Dashboard

| Feature | Developer(s) | Description |
|---|---|---|
| Configurable widget grid | mobouifr | `react-grid-layout`; drag to reorder, resize handles; layout saved per user |
| Preset layouts | mobouifr | Compact / Standard / Analytics presets selectable in one click |
| Widget picker | mobouifr | Modal to add/remove/reset widgets |
| Real-time SSE refresh | oer-refa, csouita | `PrismaService.globalMutation$` Subject emits `{ model, action }` on every write; dashboard subscribes with filter for `Project`, `Client`, `Note`, `Event`, `UserAchievement` |
| Revenue KPI | oer-refa | Monthly revenue bar chart (full year); current-month vs previous-month comparison; completed project count |
| Activity heatmap | oer-refa | GitHub-style contribution calendar counting client creation, project creation, and project completion per day |
| Activity feed | oer-refa | Unified chronological feed of recent clients, projects, and achievements (top 5) |
| Data graph | oer-refa | 6-month bar chart comparing projects vs clients created per month |
| Project status bar | mobouifr | Grouped count of projects per status with progress-bar visualisation |
| Next deadline | mobouifr | Upcoming project with the nearest deadline |
| Notes capture | mobouifr | Full note CRUD embedded as a dashboard widget |
| Calendar upcoming | mobouifr | Mini view of the next scheduled events |

### Calendar & Reminders

| Feature | Developer(s) | Description |
|---|---|---|
| 4-mode calendar view | mobouifr | Month, Week, Day, and Lane (swim-lane by event type) |
| Event CRUD | mobouifr, oer-refa | Full create/edit/delete with title, date, time, end time, description, type, priority, location, external link |
| Client / project tagging | mobouifr | Link events to existing CRM entities; displayed as context badges |
| Notes | mobouifr | Colour-coded, tag-based, pinnable sticky notes with inline editing |

### AI Chatbot

| Feature | Developer(s) | Description |
|---|---|---|
| DeepSeek LLM integration | soel-mou | Server-side request to DeepSeek API with live CRM data (client list, project statuses, revenue) injected into the system prompt |
| SSE token streaming | soel-mou | Response streamed token-by-token from backend to frontend; user sees the reply typing in real time |
| Markdown rendering | soel-mou | `react-markdown` + `rehype-highlight` renders formatted text, tables, and syntax-highlighted code blocks |
| Rate limiting | soel-mou, mobouifr | Per-user throttle; graceful error message shown when limit is hit |

### Gamification

| Feature | Developer(s) | Description |
|---|---|---|
| XP system | csouita | XP awarded on CRM actions (e.g., creating a client, completing a project) |
| Level progression | csouita | Level derived from cumulative XP against a threshold table |
| Achievements | csouita | One-time unlockable milestones (e.g., `FIRST_PROJECT`, `LOYAL_CLIENT_3`); unique per user+type |
| Badges | csouita | Visual collectibles displayed on the Growth page |
| Growth page | csouita, mobouifr | XP ring, level stats, achievement card gallery |

### Notifications

| Feature | Developer(s) | Description |
|---|---|---|
| Event-driven creation | mobouifr, csouita | Notifications created (fire-and-forget via `.catch(() => {})`) after successful client/project CRUD |
| Real-time bell | mobouifr, csouita | SSE subscription filters `globalMutation$` for `Notification` model; unread count badge updates instantly |
| Bell dropdown | mobouifr | Shows last 10 notifications with type icons, read status, and relative timestamps |
| Mark as read / all | mobouifr | Individual `PATCH /:id/read` or bulk `PATCH /read-all` |
| Delete / delete all | mobouifr | Individual delete or `DELETE /` to clear all notifications |
| Deep-link navigation | mobouifr | Clicking a notification with `targetType` + `targetId` routes to the linked entity |

### Settings

| Feature | Developer(s) | Description |
|---|---|---|
| Profile editing | oer-refa | Username, name, email, phone, business name, address, currency, tax rate |
| Password change | oer-refa | Requires current password; re-hashes with bcrypt before saving |
| 2FA setup / teardown | oer-refa | QR code generation → TOTP scan → code verification → enable; reverse path to disable |
| Theme selection | mobouifr | Multiple visual themes persisted across sessions |

### Internationalisation

| Feature | Developer(s) | Description |
|---|---|---|
| EN / FR / ES translations | soel-mou | Full UI translated; separate JSON locale files (~25 KB each) |
| Browser language detection | soel-mou | `i18next-browser-languagedetector` selects language on first visit |
| Manual switcher | soel-mou | `LanguageSwitcher` component in the app layout |

### Monitoring & Infrastructure

| Feature | Developer(s) | Description |
|---|---|---|
| Prometheus metrics | soel-mou | HTTP request count, latency histograms, and custom counters exposed at `/api/metrics` |
| Grafana dashboards | soel-mou | Pre-provisioned via Docker volume mount; visualises API latency and DB metrics |
| PostgreSQL exporter | soel-mou | Exports DB-level metrics (connections, query timing) to Prometheus |
| Health endpoint | mobouifr | `GET /api/health` used by Docker `healthcheck`; probes DB connection |
| Automated DB backups | soel-mou | Cron job runs `pg_dump` daily at 02:00 UTC; output gzip-compressed to named Docker volume |
| Manual restore | soel-mou | `make db-restore FILE=<path>` with interactive confirmation safeguard |

---

## Modules

Modules follow the ft_transcendence Surprise evaluation grid. **Major = 2 pts, Minor = 1 pt.**

| # | Module | Type | Pts | How it was implemented | Developer(s) |
|---|---|---|---|---|---|
| 1 | **Two-Factor Authentication & JWT** | Major | 2 | `otplib` generates a per-user TOTP secret stored (encrypted) in the DB; `qrcode` produces a scannable URI; server verifies the 6-digit code before signing and returning a JWT stored as an HttpOnly cookie | oer-refa |
| 2 | **OAuth 2.0 — 42 Intranet** | Major | 2 | `passport-42` strategy intercepts the 42 callback, exchanges the code for a token, fetches the intra profile, and either finds an existing user by `intraId` or creates a new one; configurable callback URL via env var | oer-refa |
| 3 | **AI Chatbot with LLM** | Major | 2 | NestJS `ChatbotModule` calls the DeepSeek API with a system prompt that includes the user's live CRM data; the response is streamed token-by-token via a NestJS SSE endpoint using `Observable`; `@nestjs/throttler` enforces per-user request limits | soel-mou |
| 4 | **Server-Sent Events (Real-Time Updates)** | Major | 2 | `PrismaService` exposes a `globalMutation$` RxJS `Subject`; every service write calls `.next({ model, action })`; dashboard and notification controllers each subscribe with a `filter()` for their relevant models and `map()` to `MessageEvent`; clients use `EventSource` to receive updates | oer-refa, csouita |
| 5 | **Gamification (XP, Levels, Achievements, Badges)** | Minor | 1 | `GamificationService` holds XP threshold tables; called from project/client services after successful writes; `UserAchievement` and `UserBadge` records have a unique constraint on `(userId, type)` preventing duplicates | csouita |
| 6 | **Multiple Languages (i18n)** | Minor | 1 | `i18next` initialised in `frontend/src/i18n.ts` with `i18next-browser-languagedetector`; three locale JSON files (EN/FR/ES) loaded via dynamic import; `LanguageSwitcher` component calls `i18n.changeLanguage()` at runtime | soel-mou |
| 7 | **Monitoring & Observability** | Minor | 1 | `@willsoto/nestjs-prometheus` registers a Prometheus registry and exposes `/api/metrics`; `GlobalMetricsMiddleware` records HTTP method, route, status code, and response time; Grafana dashboards and alert rules provisioned via Docker volume mounts | soel-mou |
| 8 | **Server-Side Pagination & Sorting** | Minor | 1 | All list endpoints (`/clients`, `/projects`, `/notifications`) accept `take`, `cursor`, `sortBy`, and `sortOrder` query params; Prisma translates these to `orderBy` + cursor pagination; frontend passes params from table header click handlers | mobouifr |
| 9 | **Automated Database Backups & Restore** | Minor | 1 | A dedicated Alpine container runs `crond`; `backup-db.sh` calls `pg_dump` and writes a gzip file to a named Docker volume; `make db-restore FILE=<path>` runs with an interactive confirmation prompt before overwriting data | soel-mou |

**Total: 4 Major × 2 pts + 5 Minor × 1 pt = 13 pts**

> Module names and point thresholds should be verified against the official ft_transcendence Surprise subject PDF before the defense.

---

## Individual Contributions

### mobouifr (Montassir Bouifraden) — Tech Lead · DevOps · Backend · Frontend

- Set up and maintained the Git workflow: branch naming conventions, integration flow into `backDevops`, and CI configuration.
- Designed and implemented server-side sorting (multi-column, configurable direction) and cursor-based pagination for all list endpoints (clients, projects, notifications).
- Fixed six backend bugs discovered through a deep audit: SSE model filter (dashboard receiving irrelevant events), achievement type mapping (`"note"` → `"achievement"`), notification created before delete (wrong ordering causing phantom notifications on failure), revenue chart using `createdAt` instead of `updatedAt` for completion date, `updateNote` returning 200 on a missing record instead of 404, and a dead `weeklyRevenue` variable accumulating silently.
- Built the complete backend test suite: 74 tests across 8 test suites covering all service methods and controller routes; converted SSE tests from async-with-timer to synchronous to eliminate Jest parallel-worker force-exit warnings.
- Maintained the notifications module end-to-end: bell dropdown close fix, delete-all endpoint, deep-link navigation, unread count badge.
- Performed full dead-code audit: removed 23 unused files (test scripts, placeholder pages, empty entity classes, dead components, unregistered interceptor) with zero TypeScript errors after removal.
- Docker Compose maintenance and `.env.example` documentation.
- Built the Dashboard widget grid using `react-grid-layout`: drag-to-reorder, resizable widgets, preset layout templates (Compact / Standard / Analytics), and a widget picker modal.
- Developed the Calendar and Reminders UI: four view modes (Month, Week, Day, Lane), event creation/edit modal, mini navigation calendar, and the sticky-note panel.
- Implemented the chatbot widget: input box, streaming message display, Markdown rendering, and action-button parsing for filling CRM forms.
- Worked on frontend routing composition and the responsive layout system.

**Challenge faced (backend):** The Jest force-exit warning only appeared with parallel workers (`--runInBand` was silent). Root cause: `setTimeout` timers in SSE tests kept worker processes alive past teardown. Since `Subject.next()` emissions are synchronous, removing the timer and completing the Subject in `afterEach` eliminated the warning entirely.

**Challenge faced (frontend):** The four-mode calendar required a single state that rendered differently per mode. Managing week/day boundaries across month edges required normalising all dates to UTC midnight before any calendar arithmetic.

### oer-refa (Othmane Er-Refaly) — Backend Lead

- Implemented the complete authentication layer: local email/password login with bcrypt, JWT signed and returned as an HttpOnly cookie, 42 OAuth via `passport-42`, and Two-Factor Authentication with TOTP QR code generation.
- Designed and built the real-time SSE infrastructure: `globalMutation$` Subject in `PrismaService` as an in-process event bus; dashboard SSE stream filtering for relevant models; notification SSE stream.
- Developed all dashboard analytics endpoints: revenue KPI (monthly chart + current/previous month comparison), activity heatmap (365-day contribution grid), activity feed (unified timeline), project-clients 6-month trend graph, notes CRUD, events CRUD.
- Implemented the Calendar/Reminders backend and integrated SSE updates.

**Challenge faced:** The `globalMutation$` Subject needed to be a shared singleton — NestJS DI scope had to be set to `DEFAULT` (singleton) on `PrismaService` to ensure all modules subscribed to the same stream rather than independent instances.

### soel-mou (Solayman) — DevOps · Backend

- Designed and maintained the entire Docker Compose stack: Nginx reverse proxy with HTTPS, PostgreSQL, backend, frontend, Prometheus, Grafana, PostgreSQL exporter, and the backup cron service — all networked on an isolated bridge.
- Owned the Prisma schema and all database migrations; enforced the rule that no other developer edits `schema.prisma` directly.
- Built the AI Chatbot module: DeepSeek API integration, live CRM context assembly (querying user's clients and projects at request time), SSE token streaming via NestJS `Observable`, `react-markdown` rendering on the frontend, and per-user throttling.
- Set up Prometheus scraping, Grafana dashboard provisioning, and PostgreSQL alert rules.
- Implemented the internationalisation pipeline: 3 locale JSON files, `i18next` configuration, browser language detection, and the `LanguageSwitcher` component.
- Wrote and maintained the `Makefile` (20+ targets covering dev, prod, DB operations, SSL, monitoring).

**Challenge faced:** The chatbot context injection initially sent the user's entire database to the LLM, causing token limit errors and high latency. Solution: summarised the context to the 10 most recent clients and active projects with only key fields, reducing payload size by ~90%.

### csouita (Souita) — Backend Developer

- Implemented the full Gamification module: defined XP award values per action type, level thresholds and the `calculateLevel()` function, and the `GamificationService` methods called from other services after successful writes.
- Built the `UserAchievement` and `UserBadge` creation logic with the unique `(userId, type)` constraint ensuring no duplicates.
- Contributed to the Notifications SSE architecture and resolved integration conflicts between the gamification service and the SSE streams (the `globalMutation$` Subject was shared across both systems).

**Challenge faced:** A race condition occurred when two quick actions triggered gamification writes simultaneously, producing duplicate achievements. Resolved by relying on Prisma's `upsert` with the unique constraint as a conflict key rather than a check-then-insert pattern.

### hichokri (Hiba Chokri) — Frontend Developer

- Built all Client pages: list (with search bar, sort headers, pagination controls), detail view (full profile + projects tab), create form modal, and edit form modal.
- Built all Project pages: same structure; status badge component; priority indicator.
- Implemented the React Router background-location modal pattern: navigating to `/clients/new` or `/clients/:id` keeps the list page rendered and blurred behind the modal overlay, so returning from the modal does not trigger a full list reload.
- Integrated Zod schemas with React Hook Form for client-side validation on all CRM forms (required fields, email format, phone pattern).

**Challenge faced:** The background-location modal pattern required two `<Routes>` blocks in `AppRoutes`: one for the background list, one for the modal overlay. Getting TypeScript to accept `location.state?.background` required a type assertion; the solution was a typed `state` interface rather than `as any`.

---

## Instructions

### Prerequisites

| Tool | Minimum Version | How to verify | Download |
|---|---|---|---|
| Docker Engine | 24.x | `docker --version` | [docs.docker.com](https://docs.docker.com/engine/install/) |
| Docker Compose | v2.x (plugin) | `docker compose version` | Included with Docker Desktop |
| Git | Any recent | `git --version` | [git-scm.com](https://git-scm.com) |
| `make` | Any | `make --version` | Pre-installed on Linux/macOS; [gnuwin32](https://gnuwin32.sourceforge.net/packages/make.htm) on Windows |
| Node.js *(optional)* | 20+ | `node --version` | Only needed to run backend tests locally without Docker |

### 1. Clone the Repository

```bash
git clone https://github.com/solacode-SC/freelancer-crm-final-project.git
cd freelancer-crm-final-project
```

### 2. Create the Environment File

```bash
cp .env.example .env
```

Open `.env` and fill in the required values:

| Variable | Required | How to generate / get |
|---|---|---|
| `JWT_SECRET` | **Yes** | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `POSTGRES_PASSWORD` | Recommended | Replace the default `password` with a strong random string |
| `FORTYTWO_CLIENT_ID` | For 42 OAuth | Register at [profile.intra.42.fr/oauth/applications](https://profile.intra.42.fr/oauth/applications); callback URL: `http://localhost:3089/auth/callback` |
| `FORTYTWO_CLIENT_SECRET` | For 42 OAuth | Same registration page |
| `DEEPSEEK_API_KEY` | For chatbot | [platform.deepseek.com](https://platform.deepseek.com) |
| `GF_SECURITY_ADMIN_PASSWORD` | Recommended | Grafana admin password |

All other variables have working defaults for local development and do not need to be changed.

### 3. Start All Services

```bash
make up
```

This single command will:
1. Generate a self-signed HTTPS certificate for `localhost` (first run only; takes ~2 s)
2. Build all Docker images
3. Start PostgreSQL, the NestJS backend, the React/Vite frontend, Adminer, Prometheus, Grafana, and the backup service
4. Apply Prisma database migrations automatically on backend startup

Wait for the backend health check to pass. You should see:

```
backend-1  | [Nest] LOG [NestFactory] Starting Nest application...
backend-1  | [Nest] LOG [NestApplication] Nest application successfully started +Xms
```

The first build takes 2–4 minutes while Docker downloads base images. Subsequent starts are faster.

### 4. Open the Application

| Service | URL | Notes |
|---|---|---|
| **Application** | https://localhost | Accept the self-signed certificate warning on first visit (click "Advanced → Proceed") |
| **Backend API** | http://localhost:3001/api | REST endpoints; health check at `/api/health` |
| **Adminer** | http://localhost:8080 | DB browser — System: `PostgreSQL`, Server: `postgres`, User/Password from `.env` |
| **Grafana** | http://localhost:3002 | Login with `GF_SECURITY_ADMIN_USER` / `GF_SECURITY_ADMIN_PASSWORD` from `.env` |
| **Prometheus** | http://localhost:9090 | No authentication |

### 5. Stop All Services

```bash
make down
```

### Makefile Command Reference

| Command | Description |
|---|---|
| `make up` | Build and start all services (generates SSL cert on first run) |
| `make down` | Stop all services |
| `make restart` | Rebuild and restart everything |
| `make logs` | Stream live logs from all containers |
| `make ps` | Show container status |
| `make studio` | Open Prisma Studio database GUI at http://localhost:5555 |
| `make migrate` | Apply pending Prisma migrations |
| `make generate` | Regenerate Prisma client TypeScript types |
| `make seed` | Load sample data into the database |
| `make reset-db` | ⚠️ Wipe all data and re-apply migrations (dev only) |
| `make db-shell` | Open a `psql` console inside the PostgreSQL container |
| `make db-backup` | Trigger a manual database backup |
| `make db-restore FILE=<path>` | Restore from a backup file (interactive confirmation) |

### Running Backend Tests (Without Docker)

```bash
cd backend
npm install
npm test
```

Expected output:

```
Test Suites: 8 passed, 8 total
Tests:       74 passed, 74 total
Time:        ~5s
```

### Common Issues

| Error Message | Likely Cause | Fix |
|---|---|---|
| `Can't reach database server at localhost:5432` | PostgreSQL container not started | `make down && make up` |
| `Environment variable not found: DATABASE_URL` | `.env` file missing | `cp .env.example .env` |
| `The table 'public.User' does not exist` | Migrations not applied | `make migrate` |
| `Prisma Client is not generated` | Stale TypeScript types | `cd backend && npm install && make generate` |
| Browser shows certificate warning | Self-signed dev cert | Click "Advanced → Proceed to localhost (unsafe)" |
| `Port 3001 already in use` | Another process on port 3001 | `make down`, or `lsof -i :3001` then `kill -9 <PID>` |
| `Port 443 already in use` | Another HTTPS server running | Stop the conflicting process or change `FRONTEND_PORT` in `.env` |

---

## Resources

### Official Documentation

- [NestJS — Official Docs](https://docs.nestjs.com)
- [Prisma — Getting Started & Reference](https://www.prisma.io/docs)
- [React 19 — API Reference](https://react.dev/reference/react)
- [Vite — Build Tool Reference](https://vite.dev/config/)
- [Tailwind CSS v4 — Documentation](https://tailwindcss.com/docs)
- [React Router v7 — Reference](https://reactrouter.com/start/library/routing)
- [PostgreSQL 16 — Documentation](https://www.postgresql.org/docs/16/)
- [Docker Compose v2 — Reference](https://docs.docker.com/compose/reference/)
- [Passport.js — Strategy Index](https://www.passportjs.org/packages/)
- [otplib — TOTP Library](https://github.com/yeojz/otplib)
- [i18next — React Integration](https://react.i18next.com/)
- [RxJS — Subjects & Operators](https://rxjs.dev/guide/subject)
- [Prometheus NestJS integration](https://github.com/willsoto/nestjs-prometheus)
- [DeepSeek API — Reference](https://api-docs.deepseek.com/)
- [react-grid-layout — Docs](https://github.com/react-grid-layout/react-grid-layout)

### Articles & Tutorials

- [Server-Sent Events (SSE) — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [JWT Best Practices — IETF RFC 8725](https://www.rfc-editor.org/rfc/rfc8725)
- [TOTP Algorithm — RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238)
- [Cursor Pagination with Prisma](https://www.prisma.io/docs/orm/prisma-client/queries/pagination)
- [NestJS Guards & Authentication](https://docs.nestjs.com/guards)
- [42 OAuth Application Setup Guide](https://api.intra.42.fr/apidoc/guides/web_application_flow)
- [Prometheus Data Model](https://prometheus.io/docs/concepts/data_model/)
- [Grafana Provisioning via Docker](https://grafana.com/docs/grafana/latest/administration/provisioning/)

### AI Usage

This project used AI assistance (Claude by Anthropic) as a development accelerator. All AI-generated suggestions were manually reviewed, tested in the project context, and adapted before merge.

| Task | What AI was used for |
|---|---|
| **Architecture decisions** | Discussing NestJS module boundary design, SSE vs WebSocket trade-offs, cursor pagination vs offset pagination |
| **Bug diagnosis** | Identifying the SSE model-filter bug (all mutations reaching the dashboard), notification-before-delete ordering, revenue `createdAt` vs `updatedAt` correctness, `updateNote` silent 200 on missing record |
| **Test coverage** | Writing comprehensive Jest test suites for all 8 backend modules (74 tests total); diagnosing and fixing the Jest parallel-worker force-exit warning |
| **Dead code audit** | Full audit of 23 unused files across frontend and backend; verifying zero consumers before deletion |
| **Security review** | Identifying localStorage token leak, unused HTTP interceptor, empty entity class files |
| **Documentation** | Drafting this README |
| **In-app chatbot (runtime)** | The DeepSeek LLM powers the in-app CRM assistant at runtime — this is a product feature, not a development tool |

---

*For additional technical documentation see the [`docs/`](docs/) directory: backend setup guide, database schema walkthrough, and design token reference.*
