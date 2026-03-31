# Freelancer CRM — Mycel

*This project has been created as part of the 42 curriculum by montassir (mobouifr), Othmane Er-Refaly (oer-refa), solacode-SC, Admin.*

---

## Description

Mycel is a web-based Customer Relationship Management (CRM) system designed for freelancers and small businesses. It provides a unified dashboard for managing clients, tracking projects, creating proposals, generating invoices, setting reminders, and monitoring business performance through real-time analytics.

The goal is to deliver a full-stack application with authentication, persistent data storage, responsive UI, and a clean developer experience — all containerized with Docker for one-command deployment.

---

## Features

| Feature | Description |
|---------|-------------|
| Authentication | Local registration with hashed passwords (bcrypt), JWT sessions via HTTP-only cookies, 42 OAuth integration |
| Dashboard | Customizable drag-and-drop widget grid (revenue KPIs, calendar, invoices due, activity feed, growth tracker) |
| Clients | CRUD management of client contacts and associated projects |
| Projects | Track project status, deadlines, and linked clients |
| Proposals | Create and manage business proposals |
| Invoices | Generate and track invoices with amounts and due dates |
| Reminders & Planner | Full calendar (month/week/day views) with event lanes, sticky notes board with color-coding and pin/unpin, standalone todos with flags (important/follow-up) and due dates, event CRUD via modal (type, priority, recurrence, linked project/client), note-to-event conversion, in-app notifications with deep-linking on every action, localStorage persistence with API-ready data shapes |
| Ecosystem | Gamified growth tracker — visualizes user activity as levels and hours |
| Settings | Profile, business details, security (password change), UI preferences (9 theme presets, sidebar behavior) |
| Theming | 9 curated color themes (dark, light, violet, paper, terminal, graphite, sand, arctic, monochrome) with instant switching |
| Privacy & Terms | Dedicated legal pages accessible from the app footer and auth screens |

---

## Tech Stack

### Frontend
| Technology | Version | Justification |
|-----------|---------|---------------|
| React | 19 | Component-based UI with hooks, fast rendering via virtual DOM |
| TypeScript | 5.x | Type safety across the entire frontend codebase |
| Vite | 7 | Extremely fast HMR and build times, native ESM support |
| Tailwind CSS | 4 | Utility-first CSS framework for rapid styling and consistency |
| React Router | 7 | Declarative client-side routing with nested layouts |
| Axios | 1.x | HTTP client for API communication with interceptors |
| react-grid-layout | 2.x | Drag-and-drop dashboard widget grid |

### Backend
| Technology | Version | Justification |
|-----------|---------|---------------|
| NestJS | 11 | Enterprise-grade Node.js framework with modular architecture |
| TypeScript | 5.x | Shared type safety with the frontend |
| bcrypt | — | Industry-standard password hashing with salt rounds |
| JWT (jsonwebtoken) | — | Stateless authentication with HTTP-only cookie transport |
| class-validator | — | Decorator-based DTO validation on all endpoints |
| cookie-parser | — | Parse and manage HTTP-only authentication cookies |
| Passport.js | — | Pluggable auth strategies (Local, JWT, 42 OAuth) |

### Database
| Technology | Justification |
|-----------|---------------|
| PostgreSQL | Relational DB with strong data integrity, perfect for structured CRM data |

### DevOps
| Technology | Justification |
|-----------|---------------|
| Docker & Docker Compose | One-command deployment, isolated environments, reproducible builds |
| Git & GitHub | Version control with feature branches and collaborative PRs |

---

## Database Schema

```
┌─────────────┐       ┌──────────────┐
│   users      │       │   clients    │
├─────────────┤       ├──────────────┤
│ id (PK)     │──┐    │ id (PK)      │
│ username     │  │    │ user_id (FK) │──┐
│ email        │  │    │ name         │  │
│ passwordHash │  │    │ email        │  │
│ intraId      │  │    │ company      │  │
│ createdAt    │  │    │ phone        │  │
└─────────────┘  │    │ createdAt    │  │
                 │    └──────────────┘  │
                 │                      │
                 │    ┌──────────────┐  │
                 │    │  projects    │  │
                 │    ├──────────────┤  │
                 ├───>│ id (PK)      │  │
                 │    │ user_id (FK) │  │
                 │    │ client_id(FK)│<─┘
                 │    │ name         │
                 │    │ status       │
                 │    │ deadline     │
                 │    └──────────────┘
                 │
                 │    ┌──────────────┐     ┌──────────────┐
                 │    │  proposals   │     │  invoices    │
                 │    ├──────────────┤     ├──────────────┤
                 ├───>│ id (PK)      │     │ id (PK)      │
                 │    │ user_id (FK) │     │ user_id (FK) │<── users
                 │    │ client_id(FK)│     │ client_id(FK)│
                 │    │ title        │     │ amount       │
                 │    │ amount       │     │ status       │
                 │    │ status       │     │ dueDate      │
                 │    └──────────────┘     └──────────────┘
                 │
                 │    ┌──────────────┐
                 ├───>│  reminders   │
                      ├──────────────┤
                      │ id (PK)      │
                      │ user_id (FK) │
                      │ title        │
                      │ content      │
                      │ color        │
                      │ pinned       │
                      │ createdAt    │
                      └──────────────┘
```

**Key relations:**
- Each `user` owns many `clients`, `projects`, `proposals`, `invoices`, and `reminders`
- Each `client` belongs to one `user` and can have many `projects`, `proposals`, and `invoices`
- Each `project` is linked to one `client` and one `user`
- All tables have `id` as primary key and use foreign keys for referential integrity

---

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git
- A modern browser (Chrome recommended — tested for compatibility)

---

## Quick Start

**1. Clone the repository**
```bash
git clone <repository-url>
cd freelancer-crm-final-project
```

**2. Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your values (database credentials, JWT secret, etc.)
```

**3. Run with Docker**
```bash
docker-compose up --build
```

**4. Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

**5. Manual development (without Docker)**
```bash
# Backend
cd backend/OthmaneEr-Refaly
npm install
npm run start:dev

# Frontend (separate terminal)
cd frontend/my-app
npm install
npm run dev
```

---

## Project Structure

```
freelancer-crm-final-project/
├── frontend/my-app/          # React + Vite frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components (Input, Button, Modal, StatCard, etc.)
│   │   ├── components/dashboard/  # Dashboard widgets (RevenueKPI, InvoicesDue, etc.)
│   │   ├── hooks/            # Custom React hooks (useAuth, useTheme, useStore, useIsMobile)
│   │   ├── layouts/          # AppLayout, Sidebar, Topbar
│   │   ├── pages/            # Route pages (Dashboard, Login, Signup, Settings, etc.)
│   │   ├── services/         # API service layer (auth, axios client)
│   │   └── styles/           # Global CSS (index.css with theme variables)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/OthmaneEr-Refaly/ # NestJS backend
│   ├── src/
│   │   ├── auth/             # Auth module (strategies, guards, DTOs)
│   │   ├── users/            # Users module (service, entity)
│   │   └── main.ts           # App entry point
│   ├── package.json
│   └── tsconfig.json
├── docs/                     # Documentation
├── .env.example              # Environment variable template
├── .gitignore                # Git ignore rules (includes .env)
├── docker-compose.yml        # Docker Compose configuration
└── README.md                 # This file
```

---

## Modules

| Module | Points | Justification |
|--------|--------|---------------|
| **Frontend Framework (React)** | Major | Full SPA with component architecture, hooks, context API, and client-side routing |
| **Backend Framework (NestJS)** | Major | Modular backend with decorators, dependency injection, guards, and validation pipes |
| **CSS Framework (Tailwind CSS)** | Minor | Utility-first styling integrated via Vite plugin, used alongside CSS custom properties for theming |
| **Database (PostgreSQL)** | Minor | Relational storage with proper schema, foreign keys, and data integrity |
| **User Management** | Major | Registration, login, password hashing (bcrypt), JWT auth, 42 OAuth, profile management |
| **Dashboard** | Major | Configurable drag-and-drop widget grid with presets, real-time KPIs, and editing mode |

---

## Modules of Choice (Minor) — 1 Point Candidate

### Adaptive Dashboard Layout System (Frontend)

**Claim:** `Modules of choice` → **Minor (1 point)**

**Why this is a valid custom module**
- It is not a standard CRUD page feature.
- It introduces a reusable, stateful layout engine with user-controlled composition.
- It includes persistence, import/export, presets, and undo behavior.

**Implemented scope (evidence in code)**
- `frontend/my-app/src/hooks/useDashboardLayout.ts`
     - Presets (`default`, `compact`, `focus`, `finance`)
     - Layout persistence in `localStorage`
     - Undo stack
     - JSON export/import for layout state
- `frontend/my-app/src/components/dashboard/WidgetGrid.tsx`
     - Drag-and-drop + resize integration with `react-grid-layout`
- `frontend/my-app/src/components/dashboard/WidgetPicker.tsx`
     - Widget toggle panel
     - Preset application
     - Clear layout / undo controls
     - Layout import/export actions
- `frontend/my-app/src/pages/Dashboard.tsx`
     - End-to-end integration of editing mode + picker + grid

### Evaluation Demo Steps (2–3 minutes)

1. Open the dashboard (`/`).
2. Click **Edit Layout**.
3. Drag at least one widget and resize another.
4. Click **Customize** and apply a different preset (e.g., `Finance`).
5. Toggle one widget off, then use **Undo** to restore it.
6. Use layout **Export** and **Import** actions from the picker.
7. Refresh the page to show layout persistence from `localStorage`.

**Expected result:** evaluator can observe user-driven dashboard customization with persistent state and reversible actions, which supports a **custom Minor module (+1)** claim.

---

## Team & Individual Contributions

### montassir (mobouifr) — Frontend Lead / Design System
- Designed and implemented the entire frontend UI (all pages, components, layouts)
- Built the 9-preset theming system with CSS custom properties and React context
- Created the drag-and-drop dashboard with configurable widget grid
- Implemented responsive layout with mobile hamburger menu
- Added Privacy Policy and Terms of Service pages
- Implemented frontend form validation on Login and Signup
- Typography system: DM Mono unification with Syne brand font exception
- Integrated authentication UI with backend API

### Othmane Er-Refaly (oer-refa) — Backend Lead / Auth
- Built the NestJS backend application from scratch
- Implemented authentication system: local strategy, JWT strategy, 42 OAuth strategy
- Set up HTTP-only cookie-based session management
- Created user registration with bcrypt password hashing
- Implemented DTO validation with class-validator decorators
- Set up Passport.js guards and strategies

### solacode-SC — Contributor
- Backend collaboration and feature development

### Admin — DevOps / Project Setup
- Initial project structure and repository setup
- Docker Compose configuration
- Documentation scaffolding

---

## Project Management

- **Version Control**: Git with feature branches (`feat/`, `fix/`, `refactor/` prefixes)
- **Branching Strategy**: Feature branches merged into `montassir` integration branch
- **Communication**: Direct team coordination for PR reviews and task assignment
- **Task Tracking**: GitHub-based issue tracking and commit-driven progress
- **Code Quality**: TypeScript strict mode, ESLint, Prettier, no console.log statements in production code

---

## Resources & Documentation

- `/docs/design-tokens.md` — Complete CSS custom property reference
- `.env.example` — Environment variable documentation
- React: https://react.dev
- NestJS: https://docs.nestjs.com
- Tailwind CSS: https://tailwindcss.com/docs
- Vite: https://vitejs.dev
- PostgreSQL: https://www.postgresql.org/docs

### AI Tool Usage
- Cursor IDE with AI assistance was used for code generation, debugging, and refactoring
- All AI-generated code was reviewed, tested, and adapted by team members

---

## Browser Compatibility

Tested and optimized for **Google Chrome** (latest). The application uses standard web APIs and should work in all modern browsers (Firefox, Safari, Edge).

---

## License

This project was created for educational purposes as part of the 42 school curriculum.
