#!/usr/bin/env bash
# =============================================================================
# DATABASE RESTORE SCRIPT — Freelancer CRM
# =============================================================================
# Usage:
#   ./scripts/restore-db.sh                    → List available backups
#   ./scripts/restore-db.sh backups/backup.sql.gz  → Restore from file
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
CONTAINER_NAME="freelancer-crm-postgres"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-freelancer_crm}"
BACKUP_DIR="backups"
FILE="${1:-}"

# ---------------------------------------------------------------------------
# Colors
# ---------------------------------------------------------------------------
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

info()    { printf "${YELLOW}ℹ ${1}${RESET}\n"; }
success() { printf "${GREEN}✔ ${1}${RESET}\n"; }
error()   { printf "${RED}✘ ${1}${RESET}\n"; }

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------
if ! docker info > /dev/null 2>&1; then
    error "Docker is not running!"
    printf "  Start Docker Desktop or run: ${CYAN}sudo systemctl start docker${RESET}\n"
    exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    error "Container '${CONTAINER_NAME}' is not running!"
    printf "  Start with: ${CYAN}make up-db${RESET} or ${CYAN}docker compose up -d postgres${RESET}\n"
    exit 1
fi

# ---------------------------------------------------------------------------
# No argument → list available backups
# ---------------------------------------------------------------------------
if [ -z "${FILE}" ]; then
    printf "\n${CYAN}${BOLD}━━━ Available Backups ━━━${RESET}\n\n"

    if ! ls "${BACKUP_DIR}"/backup_*.sql* 1>/dev/null 2>&1; then
        info "No backups found in ${BACKUP_DIR}/"
        printf "  Create one with: ${CYAN}make db-backup${RESET}\n\n"
        exit 0
    fi

    ls -lhtr "${BACKUP_DIR}"/backup_*.sql* | awk '{printf "  %s  %s  %s\n", $5, $6" "$7, $NF}'
    printf "\n${YELLOW}Usage: make db-restore FILE=<backup_file>${RESET}\n\n"
    exit 0
fi

# ---------------------------------------------------------------------------
# Validate file
# ---------------------------------------------------------------------------
if [ ! -f "${FILE}" ]; then
    error "File not found: ${FILE}"
    exit 1
fi

# ---------------------------------------------------------------------------
# Confirmation
# ---------------------------------------------------------------------------
printf "\n${RED}${BOLD}⚠ WARNING: This will OVERWRITE the '${DB_NAME}' database!${RESET}\n"
printf "  Restoring from: ${FILE}\n\n"
printf "${YELLOW}Are you sure? [y/N] ${RESET}"
read -r CONFIRM
if [ "${CONFIRM}" != "y" ] && [ "${CONFIRM}" != "Y" ]; then
    info "Restore cancelled."
    exit 0
fi

# ---------------------------------------------------------------------------
# Safety backup before restore
# ---------------------------------------------------------------------------
SAFETY_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SAFETY_FILE="${BACKUP_DIR}/safety_before_restore_${SAFETY_TIMESTAMP}.sql.gz"
mkdir -p "${BACKUP_DIR}"

info "Creating safety backup before restore..."
docker exec "${CONTAINER_NAME}" \
    pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists \
    | gzip > "${SAFETY_FILE}"
success "Safety backup saved: ${SAFETY_FILE}"

# ---------------------------------------------------------------------------
# Restore
# ---------------------------------------------------------------------------
info "Restoring database from ${FILE}..."

if [[ "${FILE}" == *.gz ]]; then
    # Compressed backup
    gunzip -c "${FILE}" | docker exec -i "${CONTAINER_NAME}" \
        psql -U "${DB_USER}" -d "${DB_NAME}" --quiet
else
    # Plain SQL backup
    cat "${FILE}" | docker exec -i "${CONTAINER_NAME}" \
        psql -U "${DB_USER}" -d "${DB_NAME}" --quiet
fi

# ---------------------------------------------------------------------------
# Post-restore verification
# ---------------------------------------------------------------------------
TABLE_COUNT=$(docker exec "${CONTAINER_NAME}" \
    psql -U "${DB_USER}" -d "${DB_NAME}" -t -A -c \
    "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")

if [ "${TABLE_COUNT}" -gt 0 ] 2>/dev/null; then
    success "Restored successfully — ${TABLE_COUNT} tables found"
else
    printf "\n${YELLOW}${BOLD}⚠ WARNING: 0 tables found after restore — restore may have failed.${RESET}\n"
    printf "  Check with: ${CYAN}make db-shell${RESET} → then run ${CYAN}\\dt${RESET}\n"
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
printf "\n${GREEN}${BOLD}━━━ Restore Complete ━━━${RESET}\n\n"
success "Database '${DB_NAME}' restored from: ${FILE}"
printf "\n  ${YELLOW}Safety backup:${RESET} ${SAFETY_FILE}\n"
printf "  ${YELLOW}If something is wrong, restore the safety backup:${RESET}\n"
printf "    ${CYAN}make db-restore FILE=${SAFETY_FILE}${RESET}\n"
printf "\n  ${YELLOW}Next steps:${RESET}\n"
printf "    ${CYAN}make db-studio${RESET}   → Open Prisma Studio (visual browser)\n"
printf "    ${CYAN}make db-shell${RESET}    → Open psql shell\n\n"
