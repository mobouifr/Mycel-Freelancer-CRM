# ============================================================================
# FRONTEND DOCKERFILE — React + Vite → Nginx Production Multi-Stage Build
# ============================================================================
# Build context: project root (not apps/frontend/)
# Usage: docker build -f docker/frontend.Dockerfile -t crm-frontend .
# ============================================================================

# ---------------------------------------------------------------------------
# Stage 1: DEPS — Install all dependencies for the build
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app/frontend

# Copy only dependency manifests for optimal layer caching
COPY frontend/my-app/package.json frontend/my-app/package-lock.json* ./

# Install all dependencies (devDeps needed for Vite build)
RUN npm install

# ---------------------------------------------------------------------------
# Stage 2: BUILDER — Build the production bundle with Vite
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app/frontend

# Copy node_modules from deps stage
COPY --from=deps /app/frontend/node_modules ./node_modules

# Copy frontend source code
COPY frontend/my-app/. .

# Build argument for API URL — can be overridden at build time
# Usage: docker build --build-arg VITE_API_URL=https://api.example.com ...
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# Build the production bundle (outputs to dist/)
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3: PRODUCTION — Serve static files with Nginx (NON-ROOT)
# ---------------------------------------------------------------------------
# Using nginx:alpine for the smallest possible production image (~40MB)
# Runs entirely as the unprivileged 'nginx' user (uid 101)
FROM nginx:1.27-alpine AS production

# Add metadata labels
LABEL maintainer="DevOps Team"
LABEL description="Freelancer CRM Frontend"
LABEL org.opencontainers.image.source="https://github.com/freelancer-crm"

# Remove default Nginx static assets and config
RUN rm -rf /usr/share/nginx/html/* && \
    rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from the builder stage
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Configure Nginx for non-root operation:
# 1. Set correct ownership of required directories
# 2. Create pid file location writable by nginx user
# 3. Update nginx.conf to use non-privileged port
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid && \
    # Patch the main nginx.conf to not use 'user' directive (not needed as non-root)
    sed -i 's/^user  nginx;/# user  nginx;/' /etc/nginx/nginx.conf

# Switch to non-root user
USER nginx

# Expose non-privileged port (8080 instead of 80)
EXPOSE 8080

# Health check — verify Nginx is serving the app
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Start Nginx in the foreground (required for Docker)
CMD ["nginx", "-g", "daemon off;"]
