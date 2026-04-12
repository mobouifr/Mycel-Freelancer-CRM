#!/bin/bash
# =============================================================================
# INIT-LETSENCRYPT — Bootstrap HTTPS for production
# =============================================================================
# Run this ONCE on a fresh server before starting the production stack.
# It solves the chicken-and-egg problem: nginx needs certs to start HTTPS,
# but Certbot needs nginx running to complete the ACME HTTP-01 challenge.
#
# Solution:
#   1. Create a dummy self-signed cert so nginx can start on port 443.
#   2. Start nginx (only the HTTP/redirect server needs to be reachable).
#   3. Run certbot in webroot mode to get real Let's Encrypt certs.
#   4. Reload nginx so it picks up the real certs.
#
# Usage:
#   chmod +x scripts/init-letsencrypt.sh
#   ./scripts/init-letsencrypt.sh example.com admin@example.com [staging]
#
#   Pass "staging" as the third argument to use Let's Encrypt staging
#   (unlimited rate, but browsers will show untrusted cert). Useful for
#   testing the whole flow before using production LE limits.
# =============================================================================
set -euo pipefail

# ---------------------------------------------------------------------------
# Args / config
# ---------------------------------------------------------------------------
DOMAIN="${1:-}"
EMAIL="${2:-}"
STAGING="${3:-}"   # pass "staging" to use LE staging environment

if [[ -z "$DOMAIN" || -z "$EMAIL" ]]; then
  echo "Usage: $0 <domain> <email> [staging]"
  echo "Example: $0 example.com admin@example.com"
  echo "         $0 example.com admin@example.com staging"
  exit 1
fi

COMPOSE="docker compose -f docker-compose.prod.yml"
CERTBOT_VOL="certbot_letsencrypt"
WEBROOT_VOL="certbot_webroot"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; RESET='\033[0m'
info()  { echo -e "${GREEN}[init-ssl]${RESET} $*"; }
warn()  { echo -e "${YELLOW}[init-ssl]${RESET} $*"; }
error() { echo -e "${RED}[init-ssl]${RESET} $*" >&2; exit 1; }

# ---------------------------------------------------------------------------
# Export DOMAIN so docker-compose can read it (used in nginx environment block)
# ---------------------------------------------------------------------------
export DOMAIN

# ---------------------------------------------------------------------------
# 1. Create Docker volumes if they don't exist yet
# ---------------------------------------------------------------------------
info "Creating Docker volumes..."
docker volume create "$CERTBOT_VOL" 2>/dev/null || true
docker volume create "$WEBROOT_VOL" 2>/dev/null || true

# ---------------------------------------------------------------------------
# 2. Place a dummy self-signed certificate into the letsencrypt volume so
#    nginx can start (it requires a valid ssl_certificate path at startup).
# ---------------------------------------------------------------------------
DUMMY_LIVE="/etc/letsencrypt/live/${DOMAIN}"

info "Generating dummy self-signed certificate for initial nginx startup..."
docker run --rm \
  -v "${CERTBOT_VOL}:/etc/letsencrypt" \
  --entrypoint /bin/sh \
  certbot/certbot:latest -c "
    mkdir -p '${DUMMY_LIVE}' && \
    openssl req -x509 -nodes -newkey rsa:2048 \
      -keyout '${DUMMY_LIVE}/privkey.pem' \
      -out '${DUMMY_LIVE}/fullchain.pem' \
      -days 1 \
      -subj '/CN=${DOMAIN}' 2>/dev/null && \
    cp '${DUMMY_LIVE}/fullchain.pem' '${DUMMY_LIVE}/chain.pem'
  "

# ---------------------------------------------------------------------------
# 3. Start nginx (and its dependencies: postgres, migrate, backend)
# ---------------------------------------------------------------------------
info "Starting production stack with dummy certificate..."
$COMPOSE up -d --build --no-deps nginx

info "Waiting for nginx to be healthy..."
for i in $(seq 1 30); do
  if $COMPOSE ps nginx | grep -q "healthy"; then break; fi
  sleep 2
done

# ---------------------------------------------------------------------------
# 4. Request the real Let's Encrypt certificate via Certbot webroot mode.
#    nginx is already serving /.well-known/acme-challenge/ from the shared
#    certbot_webroot volume on port 80.
# ---------------------------------------------------------------------------
STAGING_FLAG=""
if [[ "$STAGING" == "staging" ]]; then
  warn "Using Let's Encrypt STAGING environment (cert will NOT be browser-trusted)"
  STAGING_FLAG="--staging"
fi

info "Requesting Let's Encrypt certificate for ${DOMAIN} (email: ${EMAIL})..."
docker run --rm \
  -v "${CERTBOT_VOL}:/etc/letsencrypt" \
  -v "${WEBROOT_VOL}:/var/www/certbot" \
  certbot/certbot:latest certonly \
    --webroot \
    --webroot-path /var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    $STAGING_FLAG \
    -d "$DOMAIN" \
    -d "www.${DOMAIN}"

# ---------------------------------------------------------------------------
# 5. Reload nginx to pick up the real certificate
# ---------------------------------------------------------------------------
info "Reloading nginx with the real certificate..."
docker exec freelancer-crm-nginx nginx -s reload

# ---------------------------------------------------------------------------
# 6. Start the Certbot renewal daemon
# ---------------------------------------------------------------------------
info "Starting Certbot renewal service..."
$COMPOSE up -d certbot

info ""
info "✓ HTTPS is live at https://${DOMAIN}"
info "  Certbot will auto-renew the certificate every 12 h."
info "  To force a manual renewal: make ssl-renew"
info ""
