# 🚀 Merge Day: Integration Checklist & Contracts

This document outlines the integration points between my work (Authentication & Database Setup) and the rest of the team.

## 1. 🛡️ What I Provide (To the Team)

### For Backend 2 (CRUD Developer)
* **Database Connection:** TypeORM is already configured in `app.module.ts`. It will automatically connect to Postgres using the `.env` variables.
* **Auto-Loading Entities:** I have set `autoLoadEntities: true`. As long as you generate your entities properly (`@Entity()`), TypeORM will automatically pick them up.
* **Authentication Guards:** 
  * I provide the `@UseGuards(JwtAuthGuard)` decorator. You must put this on almost all your CRUD controllers to ensure only logged-in users can fetch or modify data.
  * *How to get the user ID:* Once the user passes the `JwtAuthGuard`, you can access `req.user.id` or `req.user.email` in your controller endpoints to make sure they only edit *their own* Tasks/Clients.

### For Frontends (UI/UX)
* **Auth Endpoints:**
  * `POST /api/auth/login` (or register)
  * `GET /api/auth/42` (for 42 OAuth login)
  * `POST /api/auth/logout`
* **Session Management:** The JWT token is being sent and read via **HttpOnly Cookies** (not LocalStorage). Make sure your frontend HTTP client (Axios/Fetch) is configured with `withCredentials: true` so the browser sends the cookie on every request!

### For DevOps (Docker/Infrastructure)
* **Environment Variables:** I have defined all necessary variables in `.env.example`. I need these injected into the backend container.
* **Node Version:** Ensure the Dockerfile builds using Node.js v18 (due to the NestJS/TypeORM versioning we settled on).
* **Startup Command:** The backend should run `npm run start:prod` in the Dockerfile, or `npm run start:dev` for the dev-compose file.

---

## 2. 📥 What I Need From You

### From Backend 2 (CRUD Developer)
* **Entity Relationships:** I need to make sure the one-to-many/many-to-many relationships link back correctly to my `User` entity. (e.g., A `Task` belongs to a `User`). Let's quickly review how you imported the User entity into your relations.
* **Folder Structure Sync:** We need to agree on exactly where to put our modules before we push, so we don't end up with two `src/` folders or duplicated `app.module.ts` files. 

### From DevOps
* **Database Network Alias:** Right now, my `.env` uses `localhost:5432`. Inside Docker, `localhost` points to the container itself, not the database container. I need you to provide the internal Docker network name for the database (e.g., `postgres:5432` or `db:5432`) so I can update the `DATABASE_URL`.
* **Database Initialization:** Ensure the PostgreSQL container is configured to create the default database (`freelancer_crm`) on its very first run using `POSTGRES_DB`.

### From Frontends
* **OAuth Callback URL:** I need to know the exact URL of the frontend dashboard/loading page so I can redirect the user there after a successful 42 OAuth login. (Currently, it's set to a raw placeholder callback).

---

## 3. 🛠️ Step-by-Step Merge Plan
1. **DevOps First:** DevOps merges the `docker-compose.yml` and empty Dockerfiles so everyone has the environment.
2. **Backend Unification:** I and the CRUD developer combine our NestJS `src/` folders locally. We resolve any import conflicts in `app.module.ts` and test that both Auth and CRUD modules load without failing. Then we push.
3. **Frontend Connects:** Frontends pull the unified backend, run it (in Docker or locally), and verify the endpoints using Postman or front-end forms.
