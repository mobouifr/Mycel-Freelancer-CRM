# ============================================================================
# BACKEND DOCKERFILE — NestJS Production Multi-Stage Build
# ============================================================================
# Build context: project root (not backend/)
# Usage: docker build -f docker/backend.Dockerfile -t crm-backend .
# ============================================================================

# ---------------------------------------------------------------------------
# Stage 1: DEPS — Install production dependencies only
# ---------------------------------------------------------------------------
# Isolated dependency layer so it's cached unless package.json changes.
FROM node:20-alpine AS deps

WORKDIR /app

# OpenSSL is needed by Prisma to detect the query engine
RUN apk add --no-cache openssl

# Copy only the files needed for dependency resolution
# Generate dummy root package.json so Prisma detects project root at /app
RUN echo '{"name":"workspace-root"}' > package.json
# PRESERVE MONOREPO STRUCTURE: Copy to backend/ instead of root
COPY backend/package.json backend/package-lock.json* ./backend/

WORKDIR /app/backend

# Install production dependencies only
RUN npm install --omit=dev && \
    cp -R node_modules /prod_node_modules

# Now install ALL dependencies (including devDependencies for the build step)
RUN npm install

# ---------------------------------------------------------------------------
# Stage 2: BUILDER — Compile TypeScript & generate Prisma client
# ---------------------------------------------------------------------------
# This stage builds the NestJS app. Output goes to dist/.
FROM node:20-alpine AS builder

WORKDIR /app

# OpenSSL is needed for prisma generate
RUN apk add --no-cache openssl

# Copy installed node_modules (with devDependencies) from deps stage
COPY --from=deps /app/backend/node_modules ./backend/node_modules

# Copy root package.json (so Prisma finds project root at /app)
# Generate dummy root package.json (so Prisma finds project root at /app)
RUN echo '{"name":"workspace-root"}' > package.json

# Copy Prisma schema (at /app/prisma)
COPY prisma ./prisma

# Switch to backend dir
WORKDIR /app/backend

# Generate Prisma Client (explicit path to schema at /app/prisma/schema.prisma)
RUN npx prisma generate --schema=/app/prisma/schema.prisma

# Copy backend source code (to /app/backend)
COPY backend/. .

# Build the NestJS application
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3: PRODUCTION — Minimal runtime image
# ---------------------------------------------------------------------------
FROM node:20-alpine AS production

# Add metadata labels
LABEL maintainer="DevOps Team"
LABEL description="Freelancer CRM Backend API"
LABEL org.opencontainers.image.source="https://github.com/freelancer-crm"

# Set Node to production mode
ENV NODE_ENV=production

# OpenSSL is needed for Prisma Client at runtime
RUN apk add --no-cache openssl

WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 --ingroup nestjs nestjs

# Copy production-only node_modules
COPY --from=deps /prod_node_modules ./backend/node_modules

# Copy compiled application
COPY --from=builder /app/backend/dist ./backend/dist

# Copy Prisma schema + generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/backend/node_modules/.prisma ./backend/node_modules/.prisma
COPY --from=builder /app/backend/node_modules/@prisma ./backend/node_modules/@prisma

# Copy root package.json
# Generate dummy root package.json
RUN echo '{"name":"workspace-root"}' > package.json

# Copy package.json
COPY backend/package.json ./backend/

# Set working directory to backend app
WORKDIR /app/backend

# Switch to non-root user
USER nestjs

# Expose the backend API port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the production server
CMD ["node", "dist/main.js"]
