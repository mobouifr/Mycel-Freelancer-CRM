*This project has been created as part of the 42 curriculum by solacode-SC, montassir, souita, mobouifr, hiba-chokri.*

# Mycel CRM — ft_transcendence

## Description
Mycel is a freelancer-focused CRM web application that helps users manage clients, projects, reminders, and growth analytics in one place. The platform combines a React frontend, NestJS backend, and PostgreSQL database, with JWT-secured authentication, notifications, i18n, monitoring, backup/restore flows, and an AI assistant integrated with live business context.

## Team

| Member | Role | Responsibilities |
|--------|------|-----------------|
| Solayman | Tech Lead + DevOps Lead | Docker Compose infrastructure, Prometheus/Grafana, alerting rules, backup/restore scripts, Makefile automation, DeepSeek chatbot integration |
| Othman | Backend Lead | NestJS API architecture, Prisma schema/migrations, auth/security flows, REST endpoints |
| Montassir | Frontend Lead | React pages/components, dashboard UX, chatbot widget integration, route composition |
| Mobouifr | Product Owner + Developer | Product scope, feature prioritization, user flow validation, module alignment |
| Hiba | Developer | Clients/projects UX flows, forms, validation behavior, testing support |

## Project Management
- Task tracking: Git branches + pull/merge workflow and issue-style tracking in team discussions.
- Branch strategy: feature branches merged into `backDevops`.
- Communication: Discord for daily sync, blockers, and review feedback.
- Review process: peer code checks before major merges and evaluator rehearsal sessions.

## Technical Stack

### Frontend
- React + TypeScript + Vite
- Tailwind CSS and custom CSS tokens
- ReactMarkdown + Mermaid + syntax highlighting in chatbot responses
- i18next for localization (EN/FR/ES)

### Backend
- NestJS + TypeScript
- Prisma ORM + PostgreSQL
- JWT authentication with HttpOnly cookies and guards
- DeepSeek LLM API for chatbot responses

### Infrastructure
- Docker Compose (app + observability + backup services)
- Prometheus + Grafana for metrics, dashboards, and alerting
- HTTPS development setup (self-signed cert) and production TLS support
- Automated daily backup + interactive restore flow

## Database Schema
The schema is defined in `backend/prisma/schema.prisma` and includes strongly-related entities for users and business data:

| Model | Purpose | Key Relationships |
|------|---------|-------------------|
| User | Account, profile, auth, preferences | 1:N with Client, Project, Notification, Reminder |
| Client | Customer records | N:1 User, 1:N Project |
| Project | Work delivery lifecycle | N:1 User, N:1 Client |
| Notification | User activity notifications | N:1 User |
| Reminder | Time-based tasks/reminders | N:1 User |
| UserAchievement | Earned gamification achievements | N:1 User |
| UserBadge | Earned gamification badges | N:1 User |

## Modules

| Module | Type | Points | Owner | Status |
|--------|------|--------|-------|--------|
| Framework (React + NestJS) | Major | 2 | Team | Done |
| Monitoring (Prometheus + Grafana) | Major | 2 | Solayman | Done |
| LLM Interface (DeepSeek + streaming + action parsing) | Major | 2 | Solayman + Montassir | Done |
| ORM (Prisma) | Minor | 1 | Othman | Done |
| Notification System | Minor | 1 | Team | Done |
| Multi-language (EN/FR/ES) | Minor | 1 | Team | Done |
| OAuth 42 | Minor | 1 | Othman | Done |
| 2FA (TOTP) | Minor | 1 | Othman | Done |
| Gamification (XP/levels/achievements/badges) | Minor | 1 | Team | Done |
| Health checks + automated backups + restore procedures | Minor | 1 | Solayman | Done |
| **Current validated total (target >= 14)** |  | **13** |  | In progress |

Note: module validation is strict during defense; only fully demonstrated modules are counted.

## Features List

| Feature | Description | Owner(s) |
|--------|-------------|----------|
| Secure auth | Signup/login, JWT guard, protected routes, 42 OAuth, 2FA | Othman |
| CRM core | Clients/projects CRUD flows with search, filters, and pagination | Team |
| Dashboard | Revenue/activity/project insights and widgets | Montassir + Team |
| Notifications | Event notifications across create/update/delete actions | Team |
| Chatbot AI | Live CRM context prompt injection, action parsing, SSE streaming | Solayman + Montassir |
| Monitoring | Prometheus metrics endpoint, scraping, Grafana dashboards, alerts | Solayman |
| Backup/restore | Daily cron backups + manual restore with safeguards | Solayman |
| Localization | English/French/Spanish UI translations | Team |
| Legal pages | Privacy Policy and Terms of Service pages/routes | Team |

## Individual Contributions

### Solayman (Tech Lead / DevOps)
- Designed and implemented Docker Compose infrastructure for database, API, frontend, monitoring, and backups.
- Configured Prometheus scrape jobs and alert rules; integrated Grafana provisioning.
- Built and maintained backup and restore scripts, including retention and safety backup practices.
- Implemented/updated Makefile automation for app lifecycle, SSL, database, and monitoring operations.
- Integrated DeepSeek chatbot backend with live DB context and SSE streaming endpoint.
- Added chatbot rate limiting with NestJS throttling.

### Othman (Backend Lead)
- Structured NestJS modules/controllers/services and core API behavior.
- Implemented Prisma schema, migrations, and backend validation architecture.
- Built authentication layer (JWT, OAuth, 2FA) and route protection.

### Montassir (Frontend Lead)
- Developed React page routing and dashboard/client/project interfaces.
- Implemented chatbot UI/UX behavior, markdown rendering, and action-driven forms.
- Integrated frontend chatbot flow with backend endpoints.

### Mobouifr (PO + Developer)
- Coordinated project direction, requirement scoping, and validation priorities.
- Participated in feature review and module planning.

### Hiba (Developer)
- Worked on client/project UX pages and form flows.
- Supported testing, polish, and integration validation.

## Instructions

### Prerequisites
- Docker Engine + Docker Compose v2
- `make`
- `.env` file generated from `.env.example`

### Start (development)
```bash
cp .env.example .env
# Fill required variables in .env
make up
```

### Access
- Frontend: https://localhost
- Backend API: http://localhost:3001
- Grafana: http://localhost:3002
- Prometheus: http://localhost:9090
- Adminer: http://localhost:8080

### Useful commands
```bash
make up
make down
make logs
make status
make db-backup
make db-restore FILE=backups/backup_YYYYMMDD_HHMMSS.sql.gz
```

## Resources
- NestJS: https://docs.nestjs.com
- Prisma: https://www.prisma.io/docs
- Prometheus: https://prometheus.io/docs
- Grafana: https://grafana.com/docs
- DeepSeek API: https://api-docs.deepseek.com

### AI Usage
AI assistants were used to speed up repetitive tasks such as prompt structure drafting, alert syntax review, and implementation brainstorming. Every AI-assisted change was manually reviewed, tested in the project context, and adjusted to match project requirements before merge.
