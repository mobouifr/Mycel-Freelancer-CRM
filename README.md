*This project has been created as part of the 42 curriculum by mobouifr, oer-refa, soel-mou, csouita, hichokri.*

<div align="center">

# Mycel — Freelancer CRM

**A production-ready CRM platform built as the ft_transcendence Surprise capstone at 42 School**

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com)

</div>

---

## Table of Contents

- [Description](#description)
- [Team Information](#team-information)
- [Project Management](#project-management)
- [Technical Stack](#technical-stack)
- [Database Schema](#database-schema)
- [Features List](#features-list)
- [Modules](#modules)
- [Individual Contributions](#individual-contributions)
- [Instructions](#instructions)
- [Resources](#resources)

---

## Description

**Mycel** is a full-stack web application that gives independent freelancers a single workspace to run their business. Instead of switching between separate tools, everything is in one place: client records, project tracking, a four-mode calendar, revenue analytics, sticky notes, and an AI assistant that reads the user's actual CRM data before responding.

The name references mycelium — the underground fungal network that connects and feeds ecosystems. The goal of the platform mirrors that: connect every part of a freelancer's workflow into one coherent, living system.

| Category | What it does |
|---|---|
| **Authentication** | Email/password login, 42 OAuth SSO, TOTP two-factor authentication, JWT stored in HttpOnly cookies |
| **Client Management** | Full CRUD, server-side search, multi-column sorting, cursor-based pagination |
| **Project Management** | Status lifecycle (Active → Completed / Paused / Cancelled), priority levels, budget and deadline tracking |
| **Dashboard** | Drag-and-drop widget grid with real-time SSE updates — Revenue KPI, Activity Heatmap, Activity Feed, Project Status Bar, Data Graph, Calendar, Notes, Next Deadline |
| **Calendar & Reminders** | Four view modes (Month / Week / Day / Lane), event scheduling with CRM entity tagging, pinnable colour-coded notes |
| **AI Chatbot** | DeepSeek LLM with live CRM context injected into every request, token-streamed to the browser, Markdown and code rendering |
| **Gamification** | XP and level progression triggered by CRM actions; one-time achievements and collectible badges |
| **Notifications** | Real-time bell badge via SSE, read/unread tracking, deep-link navigation to the related entity |
| **Internationalisation** | Full English / French / Spanish UI, browser language auto-detection, runtime language switching |
| **Monitoring** | Prometheus metrics endpoint, Grafana dashboards, PostgreSQL exporter, nightly automated database backups |

---

## Team Information

### mobouifr — Montassir Bouifraden

**Roles:** Product Owner · Tech Lead · DevOps · Backend · Frontend

Owned the product vision and backlog, wrote feature acceptance criteria, and made final scope decisions under deadline pressure. Led evaluation readiness: maintained the module checklist, ran defense rehearsals, and verified all graded criteria worked end-to-end. On the backend, designed the server-side sorting and cursor-based pagination systems, wrote the full test suite (74 tests across 8 suites), identified and fixed 6 critical bugs, performed a dead-code audit removing 23 unused files, and maintained the Docker Compose configuration. On the frontend, built the drag-and-drop dashboard widget grid, the four-mode calendar and reminders system, the chatbot UI, and the core routing and layout infrastructure.

---

### oer-refa — Othmane Er-Refaly

**Roles:** Backend Lead · Project Manager / Scrum Master

Organized team meetings, tracked milestones against the evaluation checklist, and managed daily communication across Discord, WhatsApp, and Linear. Built the complete authentication layer: email/password login with bcrypt, JWT in HttpOnly cookies, 42 OAuth via passport-42, and TOTP two-factor authentication. Designed and implemented the real-time SSE infrastructure using an RxJS Subject in PrismaService as an in-process event bus shared across all modules. Developed all dashboard analytics endpoints: revenue KPI, activity heatmap, activity feed, 6-month project/client graph, and the calendar and reminders backend.

---

### soel-mou — Solayman

**Roles:** DevOps · Backend

Designed and maintained the full Docker Compose stack: Nginx reverse proxy with HTTPS, PostgreSQL, backend, frontend, Prometheus, Grafana, PostgreSQL exporter, and the automated backup service. Owned the Prisma schema and all database migrations. Built the AI chatbot module: DeepSeek API integration, live CRM context assembly (10 most recent clients and active projects injected into the system prompt), SSE token streaming via NestJS Observable, and per-user rate limiting. Set up Prometheus scraping, Grafana dashboard provisioning, and automated nightly database backups. Implemented the full internationalisation pipeline and maintained the Makefile (20+ targets).

---

### csouita — Souita

**Roles:** Backend Developer

Built the Gamification module end-to-end: XP award values per action type, level threshold calculations (`xpForLevel(L) = 500 × L²`), and the GamificationService called after successful CRM writes. Implemented UserAchievement and UserBadge creation with a unique `(userId, type)` constraint ensuring each achievement is earned only once per user. Contributed to the Notifications SSE architecture and resolved a race condition that produced duplicate achievement records under rapid concurrent actions.

---

### hichokri — Hiba Chokri

**Roles:** Frontend Developer

Built all Client and Project pages: list views with search, sort headers, and pagination controls; detail views; create and edit modal forms. Implemented the React Router background-location modal pattern so navigating to a modal keeps the list rendered and blurred behind it, and returning from the modal does not trigger a full list reload. Integrated Zod schemas with React Hook Form for client-side validation on all CRM forms.

---

## Project Management

Each developer owned one or more feature domains end-to-end, covering both frontend and backend. Domain boundaries were kept explicit to avoid merge conflicts during parallel development.

**Branching strategy:** personal branches per developer (`OthmaneBranch`, `Solayman`, `SouitaBack`, `montassir`, `Hiba`) merged into the `backDevops` integration branch, then promoted to `main` after Tech Lead review.

**Cadence:** weekly stand-ups to surface blockers and reprioritise against the evaluation checklist, plus full end-to-end rehearsals before the defense date.

### Tools Used

| Purpose | Tool |
|---|---|
| Version control | Git + GitHub (`solacode-SC/freelancer-crm-final-project`) |
| Task tracking | Linear + GitHub branch-per-feature naming |
| Communication | Discord + WhatsApp + Linear comments |
| API testing | Postman, cURL |
| Database inspection | Prisma Studio (`make studio`) |
| Container management | Docker Desktop / CLI |

---

## Technical Stack

### Frontend

| Technology | Version | Why it was chosen |
|---|---|---|
| React | 19.2.0 | Industry-standard component model; concurrent mode; large ecosystem |
| TypeScript | ~5.9.3 | End-to-end type safety across API boundaries via shared DTOs |
| Vite | 7.3.1 | Sub-second HMR; tree-shaking; manual chunk splitting per page group |
| Tailwind CSS | 4.2.1 | Utility-first styling enables fast iteration without style conflicts between developers |
| React Router | 7.13.1 | Background-location pattern keeps list pages mounted behind modal overlays |
| React Hook Form + Zod | 7.72.0 / 4.3.6 | Uncontrolled forms with schema-level validation; minimal re-renders |
| Axios | 1.13.6 | Interceptors for unified error handling and auth; typed responses |
| i18next + react-i18next | 24.2.2 | Runtime language switching without page reload; browser language detection |
| react-grid-layout | 2.2.2 | Drag-and-drop resizable dashboard widget grid |
| react-markdown + rehype-highlight | 10.1.0 / 7.0.2 | Renders chatbot Markdown responses with syntax-highlighted code blocks |

### Backend

| Technology | Version | Why it was chosen |
|---|---|---|
| NestJS | 10.x | Modular DI architecture maps directly to CRM domains; Guards, Pipes, Interceptors reduce boilerplate |
| TypeScript | 5.0.0 | Shared type surface with the frontend |
| Prisma ORM | 5.21.1 | Type-safe database client generated from schema; migration history; zero SQL injection surface |
| @nestjs/passport | — | Strategy pattern for Local, JWT, and 42 OAuth with a consistent guard interface |
| @nestjs/throttler | 6.5.0 | Declarative rate limiting at route or global level |
| RxJS | 7.8.0 | Subject-based reactive event bus for SSE streams — filter once, fan out to many consumers |
| otplib | 12.0.1 | TOTP secret generation and verification per RFC 6238 |
| @willsoto/nestjs-prometheus | 6.1.0 | Prometheus metrics at `/api/metrics` with NestJS DI integration |

### Infrastructure

| Component | Technology | Notes |
|---|---|---|
| Containerisation | Docker + Docker Compose v2 | Dev and production configurations |
| Reverse proxy | Nginx | HTTPS termination, API proxy, static asset serving |
| Monitoring | Prometheus v2.51.0 + Grafana 10.4.0 | Pre-provisioned dashboards via Docker volume mount |
| Database metrics | postgres-exporter v0.15.0 | DB-level connection and query metrics exported to Prometheus |
| Backups | Alpine cron + pg_dump | Nightly at 02:00 UTC, gzip-compressed to a named Docker volume |
| Dev HTTPS | OpenSSL self-signed cert | Generated via `make ssl-dev-cert` on first run |

### Why we made the key technical choices

**NestJS over plain Express.** The module/service/controller structure enforced clear ownership boundaries — each team member owned their module directory. Dependency injection made unit testing straightforward because mocking `PrismaService` required no global test setup.

**PostgreSQL over MongoDB.** CRM data is inherently relational: User → Client → Project → Notification. Foreign-key constraints and cascade deletes enforce data integrity at the database level instead of in application code.

**SSE over WebSockets.** Dashboard and notification updates are strictly server-to-client. SSE avoids the overhead of a bidirectional WebSocket channel, works through firewalls without special configuration, and integrates natively with the browser `EventSource` API. The RxJS Subject in PrismaService acts as an in-process bus: any write calls `.next()`, and each SSE endpoint subscribes and filters for its relevant models.

**DeepSeek over OpenAI.** The DeepSeek API is OpenAI-compatible, significantly cheaper for streaming completions, and fast enough for real-time token delivery. The chatbot injects the user's live CRM data into the system prompt at request time, enabling business-specific responses rather than generic answers.

---

## Database Schema

Every record in the database is scoped to a `User` by a foreign key with cascade delete. This guarantees complete data isolation between users and ensures that deleting an account removes all associated data automatically.

### User

| Field | Type | Constraints |
|---|---|---|
| id | String (UUID) | Primary key, default: `cuid()` |
| email | String | Unique |
| username | String | default: `"User"` |
| name, phone, businessName, businessAddress, logoUrl | String? | Nullable |
| defaultCurrency | String | default: `"USD"` |
| taxRate | Decimal(5,2) | default: `0` |
| password, passwordHash | String? | Nullable — local auth only |
| intraId | String? | Unique; 42 OAuth identifier |
| isTwoFactorEnabled | Boolean | default: `false` |
| twoFactorSecret | String? | Encrypted TOTP seed |
| xp | Int | default: `0` |
| level | Int | default: `1` |
| createdAt, updatedAt | DateTime | Auto-managed |

### Client

| Field | Type | Constraints |
|---|---|---|
| id | String (UUID) | Primary key |
| name | String | Required |
| email, phone, company, notes | String? | Nullable |
| userId | String | FK → User (cascade delete) |
| createdAt, updatedAt | DateTime | Auto-managed |

### Project

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

### Notification

| Field | Type | Notes |
|---|---|---|
| id | String (UUID) | Primary key |
| message | String | Required |
| title | String? | Optional heading |
| read | Boolean | default: `false` |
| type | String | `"info"` / `"success"` / `"warning"` / `"error"` |
| targetType, targetId | String? | Deep-link to related entity (e.g., `"client"`, `"project"`) |
| userId | String | FK → User (cascade delete) |

### Note

| Field | Type | Notes |
|---|---|---|
| id | String (UUID) | Primary key |
| title, content | String | Required |
| tags | String[] | PostgreSQL array |
| color | String | UI colour key, default: `"default"` |
| pinned | Boolean | default: `false` |
| userId | String | FK → User (cascade delete) |

### Event (Calendar)

| Field | Type | Notes |
|---|---|---|
| id | String (UUID) | Primary key |
| title, date, time | String | Required |
| endDate, endTime | String? | Optional |
| description, eventType, priority, location, externalLink | String? | Optional metadata |
| clientTag, projectTag | String? | Links to CRM entities by name |
| userId | String | FK → User (cascade delete) |

### UserAchievement / UserBadge

| Field | Type | Notes |
|---|---|---|
| id | String (UUID) | Primary key |
| type | String | e.g., `"FIRST_PROJECT"`, `"HIGH_ROLLER"` |
| name | String | Display label |
| earnedAt | DateTime | default: `now()` |
| userId | String | FK → User (cascade delete) |
| — | Unique constraint | `(userId, type)` — each achievement earned only once per user |

---

## Features List

*All features are userId-scoped and require authentication.*

### Authentication & Security

| Feature | Developer(s) | Description |
|---|---|---|
| Email / password auth | oer-refa | Registration and login with bcrypt-hashed passwords (12 salt rounds). JWT returned in an HttpOnly, Secure, SameSite=Lax cookie. |
| 42 OAuth | oer-refa | passport-42 strategy. On callback, creates a new user or links to an existing account by email. Configurable redirect URI. |
| Two-Factor Auth (TOTP) | oer-refa | otplib generates a per-user TOTP secret. qrcode renders a scannable QR code. TOTP code is verified server-side before the JWT is issued. |
| JWT guard | oer-refa, mobouifr | JwtAuthGuard protects all private routes. Token extracted from the `jwt` cookie and validated by JwtStrategy. |
| Global rate limiting | mobouifr | @nestjs/throttler configured globally at 10,000 requests per 5-minute window. |

### Client Management

| Feature | Developer(s) | Description |
|---|---|---|
| CRUD | hichokri, mobouifr | Create, view, edit, and delete client records. Deleting a client cascades to all linked projects. |
| Server-side search | mobouifr | Case-insensitive full-name search via Prisma `contains` filter. |
| Server-side sorting | mobouifr | Any column sortable via `sortBy` and `sortOrder` query params (ASC/DESC). |
| Cursor-based pagination | mobouifr | `take` + optional `cursor` params. Default page size 50, capped at 200. |
| Detail view | hichokri | Full client profile with a linked projects tab. |
| Modal overlay routing | hichokri | Create / edit / detail modals use React Router's background-location pattern. The list stays rendered and blurred behind the modal. |

### Project Management

| Feature | Developer(s) | Description |
|---|---|---|
| CRUD | hichokri, mobouifr | Full lifecycle management. Deleting a project cascades to its notifications. |
| Status management | hichokri | ACTIVE, COMPLETED, PAUSED, CANCELLED — displayed as colour-coded badges. |
| Priority levels | hichokri | HIGH, MEDIUM, LOW with visual indicators. |
| Budget & deadline | hichokri | Decimal budget field and optional DateTime deadline. |
| Server-side sorting + pagination | mobouifr | Same system as clients — consistent API contract across all list endpoints. |

### Dashboard

| Feature | Developer(s) | Description |
|---|---|---|
| Configurable widget grid | mobouifr | react-grid-layout powers drag-to-reorder and resizable widgets. Layout saved per user and persists across sessions. |
| Preset layouts | mobouifr | Compact, Standard, and Analytics presets selectable in one click. |
| Widget picker | mobouifr | Modal to add, remove, or reset widgets from the grid. |
| Real-time SSE refresh | oer-refa, csouita | PrismaService.globalMutation$ Subject emits on every write. Dashboard filters for Project, Client, Note, Event, and UserAchievement model events. |
| Revenue KPI | oer-refa | Monthly revenue bar chart for the full year; current-month vs previous-month comparison; completed project count. |
| Activity heatmap | oer-refa | 52-week GitHub-style contribution calendar. Counts client creation, project creation, and project completion per day. |
| Activity feed | oer-refa | Unified chronological feed of recent clients, projects, and achievements (top 5). |
| Data graph | oer-refa | 6-month bar chart comparing projects vs clients created per month. |
| Project status bar | mobouifr | Grouped count of projects per status with a progress-bar visualisation. |
| Next deadline | mobouifr | Upcoming project with the nearest deadline. |
| Notes widget | mobouifr | Full note CRUD embedded as a dashboard widget. |
| Calendar widget | mobouifr | Mini view of the next scheduled calendar events. |

### Calendar & Reminders

| Feature | Developer(s) | Description |
|---|---|---|
| 4-mode calendar | mobouifr | Month, Week, Day, and Lane (swim-lane by event type) views. Built without any third-party calendar library. |
| Event CRUD | mobouifr, oer-refa | Full create/edit/delete with title, date, time, end time, description, type, priority, location, and external link. |
| CRM entity tagging | mobouifr | Link events directly to existing clients or projects. Displayed as context badges on each event. |
| Sticky notes | mobouifr | Colour-coded, tag-based, pinnable notes with inline editing. Backed by a dedicated Note model. |

### AI Chatbot

| Feature | Developer(s) | Description |
|---|---|---|
| DeepSeek LLM integration | soel-mou | Server-side request to DeepSeek API with the user's live CRM data (10 most recent clients and active projects) injected into the system prompt at request time. |
| SSE token streaming | soel-mou | Response streamed token-by-token from backend to frontend. User sees the reply appearing as it is generated. |
| Markdown rendering | soel-mou | react-markdown + rehype-highlight renders formatted text, tables, and syntax-highlighted code blocks in chatbot replies. |
| Per-user rate limiting | soel-mou, mobouifr | @Throttle limits chatbot requests to 10 per 5 minutes per user. A graceful error message is shown when the limit is reached. |

### Gamification

| Feature | Developer(s) | Description |
|---|---|---|
| XP system | csouita | XP awarded on CRM actions (creating a client, completing a project, etc.). |
| Level progression | csouita | Level calculated from cumulative XP: `xpForLevel(L) = 500 × L²`. |
| Achievements | csouita | One-time milestones (e.g., FIRST_PROJECT, LOYAL_CLIENT_3). Unique per `(userId, type)`. |
| Badges | csouita | Visual collectibles (e.g., HIGH_ROLLER, EARLY_BIRD) displayed on the Growth page. |
| Growth page | csouita, mobouifr | XP progress ring, level stats, and achievement card gallery. |

### Notifications

| Feature | Developer(s) | Description |
|---|---|---|
| Event-driven creation | mobouifr, csouita | Notifications created after successful client and project CRUD operations. |
| Real-time bell badge | mobouifr, csouita | SSE subscription filters globalMutation$ for the Notification model. Unread count badge updates instantly. |
| Bell dropdown | mobouifr | Last 10 notifications with type icons, read status, and relative timestamps. |
| Mark as read | mobouifr | Individual `PATCH /:id/read` or bulk `PATCH /read-all`. |
| Delete | mobouifr | Individual delete or `DELETE /` to clear all notifications. |
| Deep-link navigation | mobouifr | Clicking a notification with targetType + targetId routes to the linked client or project. |

### Settings

| Feature | Developer(s) | Description |
|---|---|---|
| Profile editing | oer-refa | Username, name, email, phone, business name, address, default currency, and tax rate. |
| Password change | oer-refa | Requires current password. Re-hashes the new password with bcrypt before saving. |
| 2FA setup and teardown | oer-refa | QR code generation → TOTP scan → code verification → enable. Reverse path to disable. |
| Theme selection | mobouifr | Multiple visual themes persisted across sessions. |

### Internationalisation

| Feature | Developer(s) | Description |
|---|---|---|
| EN / FR / ES translations | soel-mou | Full UI translated in three locale JSON files (~25 KB each). All user-facing strings use translation keys. |
| Browser language detection | soel-mou | i18next-browser-languagedetector selects the language on first visit based on the browser's Accept-Language header. |
| Manual switcher | soel-mou | LanguageSwitcher component calls `i18n.changeLanguage()` at runtime without a page reload. |

### Monitoring & Infrastructure

| Feature | Developer(s) | Description |
|---|---|---|
| Prometheus metrics | soel-mou | HTTP request count, latency histograms, and custom counters exposed at `/api/metrics`. |
| Grafana dashboards | soel-mou | Pre-provisioned via Docker volume mount. Visualises API latency, request rates, and DB metrics. |
| PostgreSQL exporter | soel-mou | Exports DB-level metrics (connections, query timing) to Prometheus. |
| Health endpoint | mobouifr | `GET /api/health` used by Docker healthcheck. Probes the database connection. |
| Automated DB backups | soel-mou | Alpine cron runs `pg_dump` daily at 02:00 UTC. Output is gzip-compressed to a named Docker volume. |
| Manual restore | soel-mou | `make db-restore FILE=<path>` with an interactive confirmation prompt before restoring. |

### Legal

| Feature | Developer(s) | Description |
|---|---|---|
| Privacy Policy | mobouifr | Accessible from the application footer. Contains data handling information relevant to the CRM context. |
| Terms of Service | mobouifr | Accessible from the application footer. Covers usage terms relevant to the platform. |

---

## Modules

**Scoring:** Major module = 2 pts · Minor module = 1 pt · Minimum required to pass = 14 pts

| # | Module | Category | Type | Pts | How it was implemented | Developer(s) |
|---|---|---|---|---|---|---|
| 1 | Backend Framework (NestJS) | Web | Minor | 1 | NestJS 10.x with one module per CRM domain, dependency injection, Guards, Pipes, and Interceptors. Controllers and services are fully decoupled. | oer-refa |
| 2 | ORM (Prisma) | Web | Minor | 1 | Prisma 5.21.1 schema-first ORM. All queries go through a type-safe generated client. Migration history tracked in `prisma/migrations`. Prisma Studio available via `make studio`. | oer-refa |
| 3 | OAuth 2.0 — 42 Intranet | User Management | Minor | 1 | passport-42 strategy intercepts the 42 callback, exchanges the code for a token, fetches the intra profile, and either finds an existing user by `intraId` or creates a new one. Configurable callback URL via env var. | oer-refa |
| 4 | Two-Factor Authentication | User Management | Minor | 1 | otplib generates a per-user RFC 6238 TOTP secret. qrcode produces a scannable URI. Server verifies the 6-digit code before issuing a JWT stored as an HttpOnly cookie. Routes: `/2fa/generate`, `/2fa/turn-on`, `/2fa/turn-off`, `/2fa/authenticate`. | oer-refa |
| 5 | LLM System Interface | Artificial Intelligence | **Major** | 2 | ChatbotModule calls the DeepSeek API with a system prompt including the user's live CRM data (10 most recent clients + active projects). Responses stream token-by-token via SSE using NestJS Observable. @Throttle enforces 10 req / 5 min per user. react-markdown + rehype-highlight renders the output. | soel-mou |
| 6 | Monitoring System (Prometheus + Grafana) | DevOps | **Major** | 2 | @willsoto/nestjs-prometheus exposes `/api/metrics`. GlobalMetricsMiddleware records HTTP method, route, status code, and response time. postgres-exporter collects DB metrics. Custom Grafana dashboards and alert rules provisioned via Docker volume. | soel-mou |
| 7 | Health Check, Backups & Disaster Recovery | DevOps | Minor | 1 | Alpine cron container runs `pg_dump` nightly at 02:00 UTC. Output is gzip-compressed into a named Docker volume. `make db-restore FILE=<path>` requires interactive confirmation before restoring. | soel-mou |
| 8 | Frontend Framework (React) | Web | Minor | 1 | React 19.2 SPA built with Vite 7. Lazy-loaded routes with React.lazy + Suspense. Background-location modal overlay pattern. React Router v7 handles all client-side navigation. | mobouifr, hichokri |
| 9 | Custom Design System | Web | Minor | 1 | 20+ shared reusable components exported from a single index: Button, Input, Select, Modal, Table, FormWrapper, LoadingSpinner, NotificationBell, WidgetCard, WidgetGrid, CalendarWidget, LanguageSwitcher, and more. Unified Tailwind design tokens for colour, typography, and spacing. | mobouifr, hichokri |
| 10 | Multiple Languages (i18n) | Accessibility & i18n | Minor | 1 | i18next + i18next-browser-languagedetector. Three complete locale JSON files (EN/FR/ES). All user-facing strings use translation keys. LanguageSwitcher calls `i18n.changeLanguage()` at runtime with no page reload. | soel-mou |
| 11 | Advanced Search, Filtering, Sorting & Pagination | Web | Minor | 1 | All list endpoints (`/clients`, `/projects`, `/notifications`) accept `take`, `cursor`, `sortBy`, and `sortOrder` query params. Prisma translates these to `orderBy` + cursor pagination. Frontend table header clicks dispatch sort state. Maximum page size capped at 200. | mobouifr |
| 12 | Additional Browser Support | Accessibility & i18n | Minor | 1 | Tested and verified on Google Chrome (primary), Mozilla Firefox, and Microsoft Edge. No browser-specific layout breaks or console errors observed across all core user flows. | mobouifr, hichokri |
| 13 | Gamification System | Gaming & UX | Minor | 1 | GamificationService awards XP on CRM actions. Level thresholds follow `xpForLevel(L) = 500 × L²`. Achievements and badges stored with a unique `(userId, type)` constraint. XP progress bar and earned achievements displayed on the Growth page. | csouita |
| 14 | Notification System | Web | Minor | 1 | Full CRUD: create, list (cursor-paginated), count unread, mark as read, mark all as read, delete, delete all. SSE bell badge updates in real time. Deep-link navigation to related entities. 28 dedicated tests. | mobouifr, csouita |
| 15 | Customizable Dashboard | Modules of Choice | Minor | 1 | react-grid-layout powers a fully drag-and-drop, resizable widget grid. Users choose from 8 distinct widgets via a Widget Picker modal. Three preset layout templates (Compact / Standard / Analytics). Layout persists across sessions. Mobile fallback replaces drag with reorder buttons. All widgets consume live SSE data. | mobouifr, hichokri |
| 16 | User Activity Analytics & Insights | User Management | Minor | 1 | 52-week GitHub-style activity heatmap tracking CRM actions per day with colour-coded intensity and hover tooltips. Unified activity feed with type badges and relative timestamps. Revenue KPI with month-over-month trend comparison, best-month highlight, and average revenue calculation. All analytics are userId-scoped and update in real time via SSE. | mobouifr, oer-refa, csouita |
| 17 | Calendar & Reminders System | Modules of Choice | Minor | 1 | Fully custom calendar built without any calendar library — no FullCalendar, no React Big Calendar. Four distinct view modes (Month, Week, Day, Lane) with correct date arithmetic across all month and week boundaries. Full CRUD for events with CRM-native client and project tagging. Sticky-notes system backed by a dedicated Note model. Deep-link support from notifications via `?date=YYYY-MM-DD`. | mobouifr, hichokri |

### Scoring summary

| | Count | Points |
|---|---|---|
| Major modules | 2 | 4 pts |
| Minor modules | 15 | 15 pts |
| **Total implemented** | **17** | **19 pts** |
| Minimum required to pass | — | 14 pts |
| Bonus points (beyond 14) | — | 5 pts |

### Modules of Choice — justification

**Module 15 — Customizable Dashboard (Minor)**

A widget that displays fixed charts would not qualify as a module. What makes this substantial is the combination of capabilities built together: persistent Cartesian layout coordinates saved per user in the database, a fully drag-and-drop and resizable interface powered by react-grid-layout, a widget picker modal, three preset layout templates that users can apply in one click, a mobile fallback with up/down reorder controls, and eight distinct live-data widgets each consuming real-time SSE streams. No pre-built dashboard framework was used. The result is a configurable, persistent workspace that adapts to each freelancer's priorities — which is the core value proposition of the CRM itself.

**Module 17 — Calendar & Reminders System (Minor)**

This was built from scratch without any calendar library. Four distinct view modes required separate date-arithmetic implementations: month boundary overflow, ISO week-start normalisation, day-view time-slot rendering, and swim-lane layout grouped by event type. All four modes share one state machine and one data source, which required careful normalisation to UTC midnight before any arithmetic to avoid timezone-driven off-by-one errors. Events link natively to CRM clients and projects via dedicated tag fields, persisted in the backend. The sticky-notes system adds a separate persistence layer with its own Prisma model, full CRUD, colour coding, tagging, and pin state. Deep-link support routes users from notification clicks directly to a specific calendar date. The scope — four distinct views, full event CRUD with CRM integration, a notes system, and deep-linking — justifies the Minor module point.

---

## Individual Contributions

### mobouifr — Montassir Bouifraden

**Backend**

- Designed and implemented server-side sorting (multi-column, configurable ASC/DESC) and cursor-based pagination for `/clients`, `/projects`, and `/notifications` using Prisma `orderBy` + cursor params with `take` and a default page size of 50 capped at 200.
- Built the complete backend test suite: 74 tests across 8 test suites covering all service methods and controller routes. Converted SSE tests from async-with-timer to synchronous to eliminate Jest parallel-worker force-exit warnings caused by dangling setTimeout chains in Observable listeners.
- Fixed six backend bugs found through a systematic audit:
  1. SSE model filter on the dashboard was not scoped — all database mutations (including unrelated models) were reaching dashboard clients.
  2. Achievement type mapping used the string `"note"` instead of `"achievement"`, causing incorrect achievement records.
  3. A notification was created before its associated delete completed, producing phantom notifications if the delete subsequently failed.
  4. Revenue chart was using `createdAt` instead of `updatedAt` for project completion date, causing incorrect month attribution.
  5. `updateNote` returned HTTP 200 on a missing record instead of 404.
  6. A `weeklyRevenue` variable accumulated silently in a loop without being used or returned anywhere.
- Performed a full dead-code audit: removed 23 unused files including test scripts, placeholder pages, empty entity classes, dead components, and an unregistered interceptor. Zero TypeScript errors after removal.
- Built and maintained the notifications module end-to-end: bell dropdown close behaviour, delete-all endpoint, deep-link navigation by targetType and targetId, unread count badge, and 28 dedicated tests.
- Maintained Docker Compose configuration and `.env.example` documentation.

**Frontend**

- Built the dashboard widget grid using react-grid-layout: drag-to-reorder, resizable widgets via handles, three preset layout templates (Compact / Standard / Analytics), a widget picker modal, and per-user layout persistence across sessions.
- Developed the Calendar and Reminders UI: Month, Week, Day, and Lane view modes with correct date arithmetic across all boundaries; event creation and edit modal; mini navigation calendar for date selection; sticky-note panel with colour coding, tagging, and pinning.
- Implemented the chatbot widget: input box, streaming message display with character-by-character SSE rendering, Markdown output rendering via react-markdown, and action-button parsing.
- Built the frontend routing structure and the responsive application layout.

**Challenge (backend).** Jest force-exit warnings only appeared with parallel workers — running with `--runInBand` was silent. The root cause was `setTimeout` timers inside SSE tests that kept worker processes alive past `afterAll` teardown. Since `Subject.next()` emissions are synchronous, replacing the timer with a direct Subject completion in `afterEach` resolved the warning entirely without changing test logic or coverage.

**Challenge (frontend).** The four-mode calendar required one state machine that produced four different renderings. Managing week and day boundaries across month edges required normalising all dates to UTC midnight before arithmetic, because using local Date objects without normalisation caused off-by-one errors on boundaries where DST transitions occurred.

---

### oer-refa — Othmane Er-Refaly

- Implemented the complete authentication layer: local email/password login with bcrypt (12 salt rounds), JWT signed and returned as an HttpOnly cookie, 42 OAuth via passport-42, and TOTP two-factor authentication with QR code generation.
- Designed and built the real-time SSE infrastructure: `globalMutation$` Subject in `PrismaService` as an in-process singleton event bus. Any write operation calls `.next()`. Each SSE endpoint subscribes and filters for its relevant models.
- Developed all dashboard analytics endpoints: revenue KPI (full-year monthly chart with current vs previous month comparison), activity heatmap (365-day contribution grid), unified activity feed, 6-month project/client trend chart, notes CRUD, and events CRUD.
- Built the Calendar and Reminders backend and integrated SSE updates for calendar event mutations.

**Challenge.** The `globalMutation$` Subject needed to be a shared singleton across all modules. NestJS DI defaults can create independent instances per injection context, meaning endpoints would subscribe to different Subject instances and miss events. Setting `PrismaService` to `DEFAULT` scope explicitly ensured all modules shared one stream.

---

### soel-mou — Solayman

- Designed and maintained the full Docker Compose stack: Nginx with HTTPS, PostgreSQL, NestJS backend, Vite frontend, Prometheus, Grafana, PostgreSQL exporter, and the backup cron service — all on an isolated Docker bridge network.
- Owned the Prisma schema and all database migrations. No other developer edited `schema.prisma` directly.
- Built the AI Chatbot module: DeepSeek API integration, live CRM context assembly by querying the user's 10 most recent clients and active projects at request time, SSE token streaming via NestJS Observable, react-markdown rendering on the frontend, and per-user throttling.
- Set up Prometheus scraping configuration, Grafana dashboard provisioning via Docker volume mount, and PostgreSQL alert rules.
- Implemented the internationalisation pipeline: three locale JSON files (EN/FR/ES), i18next configuration, browser language detection, and the LanguageSwitcher component.
- Wrote and maintained the Makefile with 20+ targets covering dev, prod, database operations, SSL certificate generation, and monitoring.

**Challenge.** The initial chatbot implementation sent the user's entire database as context to the LLM on every request. This caused token limit errors for users with many records and added significant latency. Reducing the context to the 10 most recent clients and active projects with only the key fields compressed the average payload by approximately 90% while preserving the quality of business-relevant responses.

---

### csouita — Souita

- Implemented the Gamification module: XP award values per CRM action type, level threshold calculations using `xpForLevel(L) = 500 × L²`, and the GamificationService methods called from other services after successful writes.
- Built UserAchievement and UserBadge creation with a unique `(userId, type)` constraint in the Prisma schema, ensuring each milestone is earned only once per user.
- Contributed to the Notifications SSE architecture and resolved integration conflicts between the gamification service and the shared `globalMutation$` Subject.

**Challenge.** Two rapid sequential CRM actions — for example, creating two clients within milliseconds — could trigger concurrent gamification writes and produce duplicate achievement records before the first write was committed. Replacing the check-then-insert pattern with Prisma `upsert` using the `(userId, type)` unique constraint as the conflict key eliminated the race window entirely.

---

### hichokri — Hiba Chokri

- Built all Client pages: list view with search bar, sort headers, and pagination controls; detail view with full profile and linked projects tab; create form modal; edit form modal.
- Built all Project pages with the same structure; implemented the status badge component and priority indicator.
- Implemented the React Router background-location modal pattern: two `<Routes>` blocks in `AppRoutes` — one for the background list, one for the modal overlay — so the list page stays rendered and blurred behind the modal and is not remounted on return.
- Integrated Zod schemas with React Hook Form on all CRM forms, covering required fields, email format validation, and phone pattern matching.

**Challenge.** The background-location modal pattern required accessing `location.state?.background`, which TypeScript rejects without an explicit type annotation on `location.state`. Using `as any` was the obvious shortcut but was avoided. Instead, a typed `LocationState` interface was defined and passed to `useLocation<LocationState>()`, resolving the type error cleanly without suppressing type checking.

---

## Instructions

### Prerequisites

| Tool | Minimum Version | How to verify | Download |
|---|---|---|---|
| Docker Engine | 24.x | `docker --version` | [docs.docker.com](https://docs.docker.com/engine/install/) |
| Docker Compose | v2.x (plugin) | `docker compose version` | Included with Docker Desktop |
| Git | Any recent | `git --version` | [git-scm.com](https://git-scm.com) |
| make | Any | `make --version` | Pre-installed on Linux/macOS |
| Node.js *(for local tests only)* | 20+ | `node --version` | [nodejs.org](https://nodejs.org) |

---

### 1 — Clone the Repository

```bash
git clone https://github.com/solacode-SC/freelancer-crm-final-project.git
cd freelancer-crm-final-project
```

---

### 2 — Configure the Environment

```bash
cp .env.example .env
```

Open `.env` and fill in the required values:

| Variable | Required | How to obtain |
|---|---|---|
| `JWT_SECRET` | Yes | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `POSTGRES_PASSWORD` | Recommended | Replace the default with any strong string |
| `FORTYTWO_CLIENT_ID` | For 42 OAuth | Register at [profile.intra.42.fr/oauth/applications](https://profile.intra.42.fr/oauth/applications). Callback: `http://localhost:3089/auth/callback` |
| `FORTYTWO_CLIENT_SECRET` | For 42 OAuth | Same registration page |
| `DEEPSEEK_API_KEY` | For AI chatbot | [platform.deepseek.com](https://platform.deepseek.com) |
| `GF_SECURITY_ADMIN_PASSWORD` | Recommended | Grafana admin password |

All other variables have working defaults for local development.

---

### 3 — Start All Services

```bash
make up
```

This single command will:

1. Generate a self-signed HTTPS certificate for `localhost` (first run only — takes ~2 seconds)
2. Build all Docker images
3. Start PostgreSQL, the NestJS backend, the React/Vite frontend, Adminer, Prometheus, Grafana, and the backup service
4. Apply Prisma database migrations automatically on backend startup

Wait until the backend confirms it is running:

```
backend-1  | [Nest] LOG [NestApplication] Nest application successfully started
```

The first build takes 2–4 minutes while Docker pulls base images. Subsequent starts are faster.

---

### 4 — Open the Application

| Service | URL | Notes |
|---|---|---|
| **Application** | https://localhost | Accept the self-signed certificate warning on first visit |
| **Backend API** | http://localhost:3001/api | Health check at `/api/health` |
| **Adminer** | http://localhost:8080 | System: PostgreSQL · Server: postgres |
| **Grafana** | http://localhost:3002 | Login with credentials from `.env` |
| **Prometheus** | http://localhost:9090 | No authentication required |

> The Privacy Policy and Terms of Service are accessible from the application footer on every page.

---

### 5 — Stop All Services

```bash
make down
```

---

### Makefile Reference

| Command | Description |
|---|---|
| `make up` | Build and start all services |
| `make down` | Stop all services |
| `make restart` | Rebuild and restart everything |
| `make logs` | Stream live logs from all containers |
| `make status` | Show container status |
| `make migrate` | Apply pending Prisma migrations |
| `make generate` | Regenerate Prisma client TypeScript types |
| `make seed` | Load sample data into the database |
| `make studio` | Open Prisma Studio in the browser |
| `make db-shell` | Open a psql console inside PostgreSQL |
| `make db-backup` | Trigger a manual database backup |
| `make db-restore FILE=<path>` | Restore from a backup file (interactive confirmation required) |

---

### Running Backend Tests

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

---

### Common Issues

| Symptom | Likely Cause | Fix |
|---|---|---|
| `Can't reach database server at localhost:5432` | PostgreSQL container not running | `make down && make up` |
| `Environment variable not found: DATABASE_URL` | `.env` file missing | `cp .env.example .env` |
| `Table 'public.User' does not exist` | Migrations not applied | `make migrate` |
| `Prisma Client is not generated` | Stale generated types | `cd backend && npm install && make generate` |
| Browser shows certificate warning | Self-signed dev certificate | Click "Advanced → Proceed to localhost" |
| `Port 3001 already in use` | Another process on that port | `make down` then `lsof -i :3001` and `kill -9 <PID>` |
| `Port 443 already in use` | Another HTTPS server running | Stop the conflicting process or change `FRONTEND_PORT` in `.env` |

---

## Resources

### Official Documentation

- [NestJS](https://docs.nestjs.com)
- [Prisma](https://www.prisma.io/docs)
- [React 19](https://react.dev/reference/react)
- [Vite](https://vite.dev/config/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [React Router v7](https://reactrouter.com/start/library/routing)
- [PostgreSQL 16](https://www.postgresql.org/docs/16/)
- [Docker Compose v2](https://docs.docker.com/compose/reference/)
- [Passport.js](https://www.passportjs.org/packages/)
- [otplib — TOTP](https://github.com/yeojz/otplib)
- [i18next](https://react.i18next.com/)
- [RxJS Subjects](https://rxjs.dev/guide/subject)
- [nestjs-prometheus](https://github.com/willsoto/nestjs-prometheus)
- [DeepSeek API](https://api-docs.deepseek.com/)
- [react-grid-layout](https://github.com/react-grid-layout/react-grid-layout)

### Articles & Specifications

- [Server-Sent Events — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [JWT Best Practices — RFC 8725](https://www.rfc-editor.org/rfc/rfc8725)
- [TOTP — RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238)
- [Cursor Pagination with Prisma](https://www.prisma.io/docs/orm/prisma-client/queries/pagination)
- [NestJS Guards & Authentication](https://docs.nestjs.com/guards)
- [42 OAuth Application Setup](https://api.intra.42.fr/apidoc/guides/web_application_flow)
- [Prometheus Data Model](https://prometheus.io/docs/concepts/data_model/)
- [Grafana Provisioning via Docker](https://grafana.com/docs/grafana/latest/administration/provisioning/)

