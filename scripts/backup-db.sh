#!/usr/bin/env sh
# =============================================================================
# DATABASE BACKUP SCRIPT — Freelancer CRM
# =============================================================================
# Runs inside the backup container via cron.
# Dumps the database to /backups/ and removes backups older than 7 days.
# =============================================================================

set -eu

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"

# ---------------------------------------------------------------------------
# Create backup
# ---------------------------------------------------------------------------
mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting backup of ${PGDATABASE}..."

if pg_dump -h "${PGHOST}" -U "${PGUSER}" -d "${PGDATABASE}" --clean --if-exists | gzip > "${BACKUP_FILE}"; then
    if [ -s "${BACKUP_FILE}" ]; then
        echo "[$(date)] SUCCESS: Backup saved to ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"
    else
        echo "[$(date)] FAILURE: Backup file is empty"
        rm -f "${BACKUP_FILE}"
        exit 1
    fi
else
    echo "[$(date)] FAILURE: pg_dump exited with an error"
    rm -f "${BACKUP_FILE}"
    exit 1
fi

# ---------------------------------------------------------------------------
# Remove backups older than 7 days
# ---------------------------------------------------------------------------
find "${BACKUP_DIR}" -name "backup_*.sql.gz" -type f -mtime +7 -delete

echo "[$(date)] Cleanup complete. Current backups:"
ls -lh "${BACKUP_DIR}"/backup_*.sql.gz 2>/dev/null || echo "  (none)"
