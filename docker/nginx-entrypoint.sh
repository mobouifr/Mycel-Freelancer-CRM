#!/bin/sh
# =============================================================================
# NGINX ENTRYPOINT — Substitutes ${DOMAIN} into the production nginx config
# template, then exec's nginx. Falls back to the baked-in dev config if no
# template is present (development mode).
# =============================================================================
set -e

TEMPLATE=/etc/nginx/nginx.prod.conf.template
TARGET=/etc/nginx/conf.d/default.conf

if [ -f "$TEMPLATE" ]; then
  if [ -z "$DOMAIN" ]; then
    echo "[entrypoint] ERROR: DOMAIN env var must be set for production SSL." >&2
    exit 1
  fi
  echo "[entrypoint] Generating nginx config for domain: $DOMAIN"
  # Only substitute ${DOMAIN} — leave nginx variables ($host, $uri, etc.) intact
  envsubst '${DOMAIN}' < "$TEMPLATE" > "$TARGET"
fi

exec nginx -g "daemon off;"
