# Backend — Full Explanation

## Overview

The backend lives inside `backend/OthmaneEr-Refaly/` and is built with **NestJS** (a framework on top of Node.js/Express). It currently implements a complete **authentication system** with three strategies: local (email + password), JWT (session persistence via cookies), and **42 Intra OAuth** (for 42 school students).

> ⚠️ The user store is currently **in-memory** (a plain array) — there is no real database connected yet.

---

## Folder Structure

```
backend/
└── OthmaneEr-Refaly/
    ├── .env.example          # Template for environment variables (currently empty)
    ├── nest-cli.json         # NestJS CLI configuration
    ├── package.json          # Dependencies and npm scripts
    ├── tsconfig.json         # TypeScript configuration
    └── src/
        ├── main.ts           # Entry point — bootstraps the app
        ├── app.module.ts     # Root module — wires everything together
        ├── auth/             # Everything authentication-related
        │   ├── auth.module.ts
        │   ├── auth.controller.ts
        │   ├── auth.service.ts
        │   ├── local.strategy.ts
        │   ├── jwt.strategy.ts
        │   ├── fortytwo.strategy.ts
        │   ├── local-auth.guard.ts
        │   ├── jwt-auth.guard.ts
        │   └── DTO/
        │       └── register.dto.ts
        └── users/            # User data model and storage
            ├── user.entity.ts
            ├── users.module.ts
            └── users.service.ts
```

---

## Entry Point — `main.ts`

This is the first file that runs. It does three things:
1. Creates the NestJS application from `AppModule`.
2. Enables **global validation** with `ValidationPipe` — every incoming request body is automatically validated against its DTO rules.
3. Enables **cookie parsing** with `cookie-parser` so the app can read the `jwt` cookie from requests.
4. Listens on **port 3000**.

---

## Root Module — `app.module.ts`

The root module is minimal — it just imports `AuthModule`. As the project grows, more modules (ClientsModule, ProjectsModule, etc.) would be added here.

---

## Auth System

### `auth.module.ts`
Wires together all authentication pieces:
- Imports `UsersModule` (to look up users).
- Imports `JwtModule` configured with a secret key and a **7-day expiry**.
- Registers `AuthController`, `AuthService`, `LocalStrategy`, `JwtStrategy`, and `FortyTwoStrategy` as providers.

---

### `auth.controller.ts` — HTTP Routes

| Method | Route | Guard | Description |
|--------|-------|-------|-------------|
| `POST` | `/auth/register` | None | Create a new account |
| `POST` | `/auth/login` | `LocalAuthGuard` | Log in with email + password |
| `GET` | `/auth/me` | `JwtAuthGuard` | Get currently logged-in user |
| `GET` | `/auth/42` | `AuthGuard('42')` | Redirect to 42 Intra login page |
| `GET` | `/auth/42/callback` | `AuthGuard('42')` | Handle redirect back from 42 |

On successful login (both local and OAuth), the JWT is stored in an **HttpOnly cookie** named `jwt` (7-day expiry). This prevents JavaScript from reading it, protecting against XSS attacks.

---

### `auth.service.ts` — Business Logic

| Method | What it does |
|--------|-------------|
| `register(dto)` | Checks for duplicate email, hashes the password with bcrypt (10 rounds), creates the user, returns user without the password hash |
| `login(user)` | Signs a JWT with `{ email, sub: id }` as the payload and returns the token |
| `validateUser(email, pass)` | Used by `LocalStrategy` — finds the user and compares the provided password against the stored bcrypt hash |
| `validateOAuthUser(provider, profile)` | Used by `FortyTwoStrategy` — looks up the user by their 42 intra ID; if they don't exist, creates a new account for them automatically |

---

### Authentication Strategies

#### `local.strategy.ts`
Implements **username/password login**. Overrides the default `usernameField` to use `email` instead. When Passport runs this strategy, it calls `authService.validateUser()`. If the credentials are wrong, it throws a `401 Unauthorized`.

#### `jwt.strategy.ts`
Reads the JWT from the **`jwt` HttpOnly cookie** on every request (not from the `Authorization` header). If the token is valid and not expired, it decodes the payload and attaches `{ id, email }` to `req.user`, making the logged-in user available in any protected route.

#### `fortytwo.strategy.ts`
Implements **OAuth 2.0 login via 42 Intra**. Uses the `passport-42` library. When the OAuth flow completes, it extracts the user's `id`, `username`, and `email` from the 42 profile and calls `authService.validateOAuthUser()` to find or create the user.

> ⚠️ The `clientID` and `clientSecret` are currently hardcoded as fallbacks. In production these must be set via environment variables.

---

### Guards

| Guard | File | Passport Strategy |
|-------|------|-------------------|
| `LocalAuthGuard` | `local-auth.guard.ts` | `local` (username + password) |
| `JwtAuthGuard` | `jwt-auth.guard.ts` | `jwt` (cookie-based token) |

Both are thin wrappers around `AuthGuard` from `@nestjs/passport`. They are applied to controller routes with `@UseGuards(...)`.

---

### `DTO/register.dto.ts` — Input Validation

Defines what a valid registration request looks like. Uses `class-validator` decorators:

| Field | Rules |
|-------|-------|
| `username` | Required, must be a string |
| `email` | Required, must be a valid email format |
| `password` | Required, minimum 6 characters |

Because `ValidationPipe` is enabled globally in `main.ts`, NestJS automatically rejects any request that doesn't match these rules with a `400 Bad Request`.

---

## Users System

### `user.entity.ts`
Defines the shape of a User object (not a database table yet — just a TypeScript class):

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Set to `Date.now()` on creation |
| `username` | `string` | |
| `email` | `string` | |
| `passwordHash` | `string?` | Optional — OAuth users have no password |
| `createdAt` | `Date` | |
| `intraId` | `string?` | Optional — only set for 42 OAuth users |

### `users.service.ts`
Manages the in-memory user store (a plain array `userbase: User[]`):

| Method | What it does |
|--------|-------------|
| `findByEmail(email)` | Searches the array for a user with a matching email |
| `findByIntraId(intraId)` | Searches for a user by their 42 Intra ID |
| `createUser(username, email, passwordHash?, intraId?)` | Creates a new User object and pushes it to the array |

### `users.module.ts`
Declares `UsersService` as a provider and **exports** it so `AuthModule` can inject it.

---

## Dependencies (`package.json`)

| Package | Purpose |
|---------|---------|
| `@nestjs/common`, `@nestjs/core` | Core NestJS framework |
| `@nestjs/jwt` | JWT signing and verification |
| `@nestjs/passport` | NestJS wrapper for Passport.js |
| `@nestjs/config` | Environment variable management |
| `passport` | Core authentication middleware |
| `passport-local` | Email/password strategy |
| `passport-jwt` | JWT strategy |
| `passport-42` | 42 Intra OAuth strategy |
| `bcrypt` | Password hashing |
| `cookie-parser` | Parse incoming cookies |
| `rxjs` | Required by NestJS internally |

---

## How to Run

```bash
cd backend/OthmaneEr-Refaly

# Install dependencies
npm install

# Development (with auto-reload on file changes)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

The server starts at `http://localhost:3000`.

---

## What's Missing / Next Steps

- **Database**: Replace the in-memory array with a real PostgreSQL database (e.g. using Prisma or TypeORM).
- **Environment variables**: Fill in `.env.example` and load variables properly with `@nestjs/config`.
- **Other modules**: Clients, Projects, Proposals, Invoices, Reminders, Notifications (described in the architecture docs).
- **Logout route**: No `/auth/logout` endpoint exists yet to clear the cookie.
- **Password reset**: No forgot-password flow yet.
- **Token refresh**: No refresh token mechanism yet.
