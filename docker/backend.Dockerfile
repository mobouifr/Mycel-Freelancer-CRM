# ============================================================================
# BACKEND DOCKERFILE — NestJS Production Multi-Stage Build
# ============================================================================
# Build context: project root
# Usage: docker build -f docker/backend.Dockerfile -t crm-backend .
# ============================================================================

# ---------------------------------------------------------------------------
# Stage 1: DEPS — Install production dependencies only
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
RUN echo '{"name":"workspace-root"}' > package.json

# Copy to backend/OthmaneEr-Refaly instead of root
COPY backend/OthmaneEr-Refaly/package.json backend/OthmaneEr-Refaly/package-lock.json* ./backend/OthmaneEr-Refaly/

# Switch to the correct actual backend directory
WORKDIR /app/backend/OthmaneEr-Refaly

RUN npm install --omit=dev --legacy-peer-deps && \
    cp -R node_modules /prod_node_modules

RUN npm install --legacy-peer-deps

# ---------------------------------------------------------------------------
# Stage 2: BUILDER — Compile TypeScript & generate Prisma client
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/backend/OthmaneEr-Refaly/node_modules ./backend/OthmaneEr-Refaly/node_modules
RUN echo '{"name":"workspace-root"}' > package.json

# Copy backend source code including schema
COPY backend/OthmaneEr-Refaly/. ./backend/OthmaneEr-Refaly/

WORKDIR /app/backend/OthmaneEr-Refaly

# Generate Prisma Client (schema is now inside the backend folder natively)
RUN npx prisma generate

RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3: PRODUCTION — Minimal runtime image
# ---------------------------------------------------------------------------
FROM node:20-alpine AS production
ENV NODE_ENV=production
RUN apk add --no-cache openssl
WORKDIR /app
RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 --ingroup nestjs nestjs

COPY --from=deps /prod_node_modules ./backend/OthmaneEr-Refaly/node_modules
COPY --from=builder /app/backend/OthmaneEr-Refaly/dist ./backend/OthmaneEr-Refaly/dist

# Generated prisma client is now inside the backend node_modules
COPY --from=builder /app/backend/OthmaneEr-Refaly/node_modules/.prisma ./backend/OthmaneEr-Refaly/node_modules/.prisma
COPY --from=builder /app/backend/OthmaneEr-Refaly/node_modules/@prisma ./backend/OthmaneEr-Refaly/node_modules/@prisma

RUN echo '{"name":"workspace-root"}' > package.json
COPY backend/OthmaneEr-Refaly/package.json ./backend/OthmaneEr-Refaly/

WORKDIR /app/backend/OthmaneEr-Refaly
USER nestjs
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

CMD ["node", "dist/main.js"]
