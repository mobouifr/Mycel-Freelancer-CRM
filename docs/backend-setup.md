# Backend Developer Setup Guide

Welcome to Freelancer CRM! This guide walks you through setting up your development environment and connecting to the database. You'll be ready to start coding in about 5 minutes.

---

## Prerequisites

Before you start, make sure you have:

- **Docker Desktop** (running) — [Download here](https://www.docker.com/products/docker-desktop)
- **Node.js 20+** — [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git**

Verify with:
```bash
docker --version
docker compose --version
node --version
npm --version
```

---

## Quick Start (5 Steps)

### Step 1: Get the Code
```bash
git clone <repo-url>
cd freelancer-crm
git checkout OthmansBranch  # or your assigned branch
```

### Step 2: Create Environment File
```bash
cp .env.example .env
```

This creates your local environment config. **Never commit `.env` to git** — it contains secrets. A `.gitignore` entry protects it.

### Step 3: Start All Services
```bash
make dev
```

This starts PostgreSQL, the backend with hot-reload, frontend, and monitoring services. Docker will download images on first run (takes 1-2 minutes). You'll see output like:

```
backend-1  | [Nest] 12:34:56     LOG [NestFactory] Starting Nest application...
backend-1  | [Nest] 12:34:57     LOG [InstanceLoader] AppModule dependencies initialized +45ms
```

✅ **Backend is running at http://localhost:3001**

Keep this terminal open. Use `Ctrl+C` to stop all services.

### Step 4: Apply Database Migrations

In a **new terminal** (keep the first one running):

```bash
make migrate
```

This creates all database tables from the Prisma schema. You'll see:

```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "freelancer_crm", schema "public"

✅ Migrations applied
✨ Your database is now in sync with your Prisma schema.
```

### Step 5: Load Test Data (Optional)

```bash
make seed
```

This populates the database with sample users and projects for testing.

---

## 🎉 You're Ready!

Your backend is live at **http://localhost:3001**

Test it:
```bash
curl http://localhost:3001/health
```

---

## DATABASE_URL — The Two Versions

The database connection URL comes in two flavors. Understanding when to use each prevents headaches.

### Version 1: Local Development (Outside Docker)

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/freelancer_crm"
```

**When to use:** Running NestJS directly on your machine with `npm run start:dev` (not inside Docker)

**Why `localhost`?** Your machine resolves `localhost` to its own network interface. PostgreSQL is on port 5432 on your host.

### Version 2: Inside Docker (Automatically Set)

```
DATABASE_URL="postgresql://postgres:password@postgres:5432/freelancer_crm"
```

**When to use:** Running inside a Docker container (what `make dev` does)

**Why `postgres`?** Docker's internal DNS resolves the service name `postgres` to the database container's IP. You never hardcode IPs.

### The Good News

**You don't need to change anything.** The `docker-compose.yml` is already configured to use the Docker version (`postgres:5432`) automatically. Your `.env` file is for reference — the environment passed to containers overrides it.

**Bottom line:** Focus on writing code. The database connection is already wired up correctly.

---

## Prisma — Your Database ORM

Prisma is the bridge between your TypeScript code and PostgreSQL. It generates type-safe client code.

### Important Files

| File | Owner | Do You Edit It? |
|------|-------|-----------------|
| `prisma/schema.prisma` | Solayman (DevOps) | ❌ No |
| `prisma/migrations/` | Solayman | ❌ No |
| `prisma/seed.ts` | Solayman | ✅ Yes (test data) |

### The Database Models You Have

Your schema already defines these models:

- **User** — freelancer account (email, password, name)
- **Client** — a client of the freelancer (name, email, company)
- **Project** — work for a client (title, status, budget, deadline)
- **Proposal** — bid on a project (title, amount, status)
- **Invoice** — billing record (amount, status, dueDate)
- **Payment** — payment received (amount, method, paidAt)

All relationships are already set up. A User owns many Clients and Projects. A Project has many Invoices and Proposals. Etc.

### Using Prisma in Your Code

Inject `PrismaService` into any NestJS service:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  // Get all clients for a user
  async getClients(userId: string) {
    return this.prisma.client.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Create a new client
  async createClient(userId: string, data: { name: string; email: string }) {
    return this.prisma.client.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  // Get a project with its client and invoices
  async getProject(projectId: string) {
    return this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        invoices: true,
        proposals: true,
      },
    });
  }

  // Update invoice status
  async markInvoiceAsPaid(invoiceId: string) {
    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'PAID' },
    });
  }
}
```

### When the Schema Changes

If Solayman updates `prisma/schema.prisma` (like adding a new field), regenerate the Prisma client:

```bash
make generate
```

This updates TypeScript types instantly. No need to rebuild anything.

### Exploring Your Database Visually

Open Prisma Studio — a GUI for browsing and editing data:

```bash
make studio
```

Opens at **http://localhost:5555**. Perfect for debug-viewing data without writing SQL.

---

## Available Commands

Run any of these from the project root directory. They all use the `Makefile` (Solayman set it up).

| Command | What It Does | When to Use |
|---------|------------|-----------|
| `make dev` | Start all services (postgres, backend, frontend, monitoring) | Every morning / fresh start |
| `make down` | Stop all containers | End of day / cleanup |
| `make logs` | Stream live logs from all services | When debugging |
| `make ps` | Show running container status | Health check |
| `make restart` | Restart just the backend | After code changes, if stuck |
| `make migrate` | Create & apply new Prisma migration after schema change | When schema.prisma changes |
| `make migrate-prod` | Apply migrations without prompts | CI/production only |
| `make seed` | Load test data into database | Reset test data |
| `make studio` | Open Prisma Studio GUI | Visual DB browsing |
| `make generate` | Regenerate Prisma client | After schema.prisma changes |
| `make reset-db` | ⚠️ **Delete all data & re-run migrations** | Dev only — destroys everything |
| `make db-shell` | Open `psql` interactive console | Write raw SQL queries |
| `make backup` | Trigger manual DB backup | Rare — backups run nightly |

---

## Database Models — Quick Reference

### Schema Overview

```
User
├── id (uuid)
├── email (unique)
├── password (hashed)
├── name
├── createdAt
└── updatedAt

Client
├── id (uuid)
├── name
├── email
├── phone
├── company
├── notes
├── userId (FK → User)
└── updatedAt

Project
├── id (uuid)
├── title
├── description
├── status (enum)
├── budget (decimal)
├── deadline
├── userId (FK → User)
├── clientId (FK → Client)
└── updatedAt

Proposal
├── id (uuid)
├── title
├── amount (decimal)
├── status (enum)
├── notes
├── validUntil
├── userId (FK → User)
├── projectId (FK → Project)
└── updatedAt

Invoice
├── id (uuid)
├── amount (decimal)
├── status (enum)
├── dueDate
├── notes
├── userId (FK → User)
├── projectId (FK → Project)
└── updatedAt

Payment
├── id (uuid)
├── amount (decimal)
├── method
├── notes
├── paidAt
├── invoiceId (FK → Invoice)
└── updatedAt
```

### Enums

```
ProjectStatus   → ACTIVE | COMPLETED | PAUSED | CANCELLED
InvoiceStatus   → PENDING | PAID | OVERDUE | CANCELLED
ProposalStatus  → DRAFT | SENT | ACCEPTED | REJECTED
```

### Key Relationships

```
1 User → Many Clients
1 User → Many Projects
1 User → Many Invoices
1 User → Many Proposals

1 Client → Many Projects

1 Project → Many Invoices
1 Project → Many Proposals

1 Invoice → Many Payments
```

Use `.include()` in Prisma queries to fetch related data:

```typescript
// Get a project with its client and all invoices
const project = await prisma.project.findUnique({
  where: { id: projectId },
  include: {
    client: true,      // Fetch the Client object
    invoices: true,    // Fetch all related Invoices
    proposals: true,   // Fetch all related Proposals
  },
});
```

---

## Monitoring Endpoints

Solayman configured monitoring services (Prometheus & Grafana). You need to implement two endpoints so they can collect metrics.

### 1. GET `/metrics` — Prometheus Metrics

**What it is:** Your backend exposes internal metrics (requests/sec, memory usage, DB query count, etc.)

**How to implement:** Use the `@willsoto/nestjs-prometheus` library (likely already in `package.json`):

```typescript
import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register(),
    // ... other modules
  ],
})
export class AppModule {}
```

This automatically creates `/metrics` endpoint. Prometheus scrapes it every 15 seconds.

### 2. GET `/health` — Health Check

**What it is:** Docker uses this to verify your backend is alive and the DB is reachable.

**Implementation:**

```typescript
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  async health() {
    try {
      // Verify DB connection
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', db: 'connected' };
    } catch (error) {
      return { status: 'error', db: 'disconnected' };
    }
  }
}
```

Docker pings this every 30 seconds. Returns:
- **200 + `{ status: "ok" }`** → healthy ✅
- **503 + `{ status: "error" }`** → unhealthy ❌

### Monitoring UIs

Once running, view metrics at:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Grafana** | http://localhost:3002 | `admin` / `admin` |
| **Prometheus** | http://localhost:9090 | (no auth) |

You don't need to do anything else. Solayman pre-configured dashboards.

---

## Ownership Boundaries

### ✅ You Own — Safe to Edit

```
backend/src/**
├── controllers/
├── services/
├── modules/
├── dto/
├── guards/
├── middleware/
├── filters/
├── interceptors/
└── decorators/

backend/package.json        (add npm packages as needed)
backend/nest-cli.json
backend/tsconfig.json
```

Write all your NestJS code here. Add packages with `npm install`. Commit everything here.

### ❌ Do Not Touch — Infrastructure Only

```
docker-compose.yml          (Solayman set this up)
docker/
├── backend.Dockerfile
├── frontend.Dockerfile
├── postgres/
├── grafana/
├── nginx.conf
└── prometheus.yml

prisma/schema.prisma        (Solayman owns the schema)
prisma/migrations/          (auto-generated, don't edit)
prisma/seed.ts              (you can edit for test data, but Solayman controls)

scripts/
├── backup-db.sh
└── (other infrastructure scripts)

.env.example                (Solayman updates this)
Makefile                    (Solayman maintains)
.github/workflows/          (CI/CD pipelines)
```

### Need a Schema Change?

If you need a new table or field in the database:

1. **Message Solayman.** Describe what you need.
2. Solayman updates `prisma/schema.prisma`
3. You run `make migrate` to apply it locally
4. You run `make generate` to get updated TypeScript types
5. You start coding

### Need a New Environment Variable?

Ask Solayman to add it to `.env.example`, then request it in your `.env` file.

---

## Common Errors & Fixes

### ❌ Error: "Can't reach database server at localhost:5432"

**Cause:** PostgreSQL container not running

**Fix:**
```bash
make down
make dev
make migrate
```

### ❌ Error: "Environment variable not found: DATABASE_URL"

**Cause:** `.env` file missing

**Fix:**
```bash
cp .env.example .env
```

### ❌ Error: "The table 'public.User' does not exist"

**Cause:** Database migrations not applied

**Fix:**
```bash
make migrate
```

### ❌ Error: "Prisma Client is not generated"

**Cause:** `npm install` not run or types outdated

**Fix:**
```bash
cd backend
npm install
make generate
```

### ❌ Error: "Port 5432 already in use"

**Cause:** Another PostgreSQL instance running on your machine

**Fix:** Stop your local PostgreSQL service, or ask Solayman to change the port in `docker-compose.yml`

### ❌ Error: "Cannot find module '@prisma/client'"

**Cause:** Dependencies not installed

**Fix:**
```bash
cd backend
npm install
```

### ❌ Error: "Backend won't reload after code changes"

**Cause:** File watcher limit or hot-reload misconfigured

**Fix:**
```bash
make restart
# Or full restart:
make down
make dev
```

### ❌ Error: "Port 3001 already in use"

**Cause:** Another backend instance running

**Fix:**
```bash
make down
make dev
```

Or find and kill the process:
```bash
lsof -i :3001
kill -9 <PID>
```

---

## Tips & Tricks

### 🔍 Inspect Data Without SQL

```bash
make studio
```

Opens a GUI at http://localhost:5555. Click through your data instead of writing `SELECT` queries.

### 📋 View Live Logs

```bash
make logs
```

Tail output from postgres, backend, frontend, monitoring — all in one stream. Prefix shows which service. Press `Ctrl+C` to stop.

### 🗄️ Direct Database Access

```bash
make db-shell
```

Opens `psql` inside the postgres container. Now you can write raw SQL:

```sql
SELECT * FROM "User";
SELECT COUNT(*) FROM "Client" WHERE "userId" = '...';
```

Exit with `\q`

### 🔄 Hard Reset (Dev Only)

Wipe everything and start fresh:

```bash
make reset-db
make seed
```

Destroys all data. Only use during development.

### 🐛 Debug Prisma Queries

Add to your `.env`:

```
LOG_LEVEL=debug
```

Then restart the backend. You'll see every SQL query Prisma generates—useful for debugging slow queries.

### 📚 Learn More

- **Prisma docs:** https://www.prisma.io/docs/
- **NestJS docs:** https://docs.nestjs.com
- **PostgreSQL docs:** https://www.postgresql.org/docs/16/
- **Docker Compose:** https://docs.docker.com/compose/

---

## Checklist for Your First Day

- [ ] `make dev` — backend running at http://localhost:3001
- [ ] `make migrate` — database tables created
- [ ] `make seed` — test data loaded
- [ ] `curl http://localhost:3001/health` — returns 200
- [ ] `make studio` — can see data in Prisma Studio
- [ ] `make db-shell` — can query database directly
- [ ] Create your first service in `backend/src/services/`
- [ ] Create your first controller in `backend/src/controllers/`
- [ ] Write a test API endpoint
- [ ] Commit to your branch

---

## Questions?

- Infrastructure issues → Ask **Solayman**
- Code review / architecture → Ask **Solayman** or team
- Stuck? → Check `make logs` first, then message the team

**Happy coding!** 🚀
