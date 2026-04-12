# ============================================================================
# FRONTEND DOCKERFILE — React + Vite → Nginx Production Multi-Stage Build
# ============================================================================
# Build context: ./frontend
# Usage: docker build -f ../docker/frontend.Dockerfile -t crm-frontend .
# ============================================================================

# ---------------------------------------------------------------------------
# Stage 1: DEPS — Install all dependencies for the build
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only dependency manifests for optimal layer caching
COPY package.json package-lock.json* ./

# Install all dependencies (devDeps needed for Vite build)
RUN npm install

# ---------------------------------------------------------------------------
# Stage 2: BUILDER — Build the production bundle with Vite
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy frontend source code
COPY . .

# Build argument for API URL — can be overridden at build time
# Usage: docker build --build-arg VITE_API_URL=https://api.example.com ...
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# Build the production bundle (outputs to dist/)
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3: PRODUCTION — Serve static files with Nginx
# ---------------------------------------------------------------------------
# nginx master process runs as root so it can bind to port 443 (privileged).
# Worker processes drop to the 'nginx' user via the 'user nginx;' directive
# that is kept in /etc/nginx/nginx.conf (standard nginx:alpine behaviour).
FROM nginx:1.27-alpine AS production

LABEL maintainer="DevOps Team"
LABEL description="Freelancer CRM Frontend"
LABEL org.opencontainers.image.source="https://github.com/freelancer-crm"

# Remove default Nginx static assets and config
RUN rm -rf /usr/share/nginx/html/* && \
    rm /etc/nginx/conf.d/default.conf

# Bake-in the dev config (overridden by volume mount in production compose)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the entrypoint script (handles envsubst for production domain injection)
COPY docker/nginx-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose HTTP (8080) and HTTPS (443) ports
EXPOSE 8080 443

# Health check — verify Nginx is serving the app
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Use the entrypoint — applies envsubst in prod, or just starts nginx in dev
CMD ["/docker-entrypoint.sh"]
