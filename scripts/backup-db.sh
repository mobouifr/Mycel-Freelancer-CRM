#!/usr/bin/env bash
# =============================================================================
# DATABASE BACKUP SCRIPT — Freelancer CRM
# =============================================================================
# Usage: ./scripts/backup-db.sh
# Creates a compressed backup in backups/ and rotates old backups.
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
CONTAINER_NAME="freelancer-crm-postgres"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-freelancer_crm}"
BACKUP_DIR="backups"
MAX_BACKUPS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"

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
# Create backup
# ---------------------------------------------------------------------------
mkdir -p "${BACKUP_DIR}"

# Verify the backup directory is writable
if [ ! -w "${BACKUP_DIR}" ]; then
    error "Backup directory '${BACKUP_DIR}' is not writable!"
    printf "  Fix with: ${CYAN}chmod u+w ${BACKUP_DIR}${RESET}\n"
    exit 1
fi

info "Backing up ${DB_NAME} from ${CONTAINER_NAME}..."

docker exec "${CONTAINER_NAME}" \
    pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists \
    | gzip > "${BACKUP_FILE}"

if [ ! -s "${BACKUP_FILE}" ]; then
    error "Backup file is empty — something went wrong!"
    rm -f "${BACKUP_FILE}"
    exit 1
fi

FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
success "Backup saved: ${BACKUP_FILE} (${FILE_SIZE})"

# ---------------------------------------------------------------------------
# Rotate old backups (keep only last N)
# ---------------------------------------------------------------------------
BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}"/backup_*.sql.gz 2>/dev/null | wc -l)

if [ "${BACKUP_COUNT}" -gt "${MAX_BACKUPS}" ]; then
    REMOVE_COUNT=$((BACKUP_COUNT - MAX_BACKUPS))
    info "Rotating backups: removing ${REMOVE_COUNT} old backup(s) (keeping last ${MAX_BACKUPS})..."
    ls -1t "${BACKUP_DIR}"/backup_*.sql.gz | tail -n "${REMOVE_COUNT}" | xargs rm -f
    success "Old backups removed"
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
printf "\n${CYAN}${BOLD}━━━ Backup Summary ━━━${RESET}\n"
printf "  Database:  ${DB_NAME}\n"
printf "  File:      ${BACKUP_FILE}\n"
printf "  Size:      ${FILE_SIZE}\n"
printf "  Backups:   $(ls -1 "${BACKUP_DIR}"/backup_*.sql.gz 2>/dev/null | wc -l) total (max ${MAX_BACKUPS})\n\n"
