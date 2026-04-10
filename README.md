# Freelancer CRM — ft_transcendence

## DevOps — Healthcheck & Disaster Recovery

### 1. Health Monitoring

The backend exposes a health endpoint that verifies database connectivity:

```
GET http://localhost:3001/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-04-10T15:00:00.000Z",
  "services": {
    "database": "connected"
  }
}
```

Prometheus scrapes this endpoint every 15 seconds to track service availability.

---

### 2. Alerting

Prometheus alert rules are defined in `docker/rules/alerts.yml`.

| Alert | Condition | Duration | Severity |
|-------|-----------|----------|----------|
| **BackendDown** | `up{job="backend"} == 0` | 1 min | critical |
| **ServiceDown** | `up == 0` | 1 min | critical |
| **HighErrorRate** | HTTP 5xx > 5% | 2 min | warning |
| **HighResponseLatency** | p95 > 1s | 5 min | warning |
| **PostgresConnectionSaturation** | > 80% connections | 5 min | warning |
| **HighNodeMemory** | RSS > 512MB | 5 min | warning |

Access Prometheus at: `http://localhost:9090`

---

### 3. Automatic Container Restart

All critical services have `restart: unless-stopped` in `docker-compose.yml`:

- **postgres** — database
- **backend** — NestJS API
- **frontend** — React/Vite
- **prometheus** — metrics
- **grafana** — dashboards
- **backup** — scheduled DB backups

If a container crashes, Docker restarts it automatically.

---

### 4. Database Backup Strategy

Backups run automatically via the `backup` container using cron:

| Schedule | Retention | Format |
|----------|-----------|--------|
| Daily at 02:00 UTC | 7 days | `crm_YYYYMMDD_HHMMSS.sql.gz` |

To run a manual backup:
```bash
make db-backup
```

Cron entry (for reference):
```
0 2 * * * sh /backup.sh >> /var/log/backup.log 2>&1
```

---

### 5. Disaster Recovery Steps

#### Scenario A — Backend Crash

1. **Detection**: Prometheus triggers `BackendDown` alert within 1 minute
2. **Recovery**: Docker automatically restarts the container (`restart: unless-stopped`)
3. **Verification**: Check `http://localhost:3001/api/health` returns `status: ok`

#### Scenario B — Database Failure

1. **Stop services**:
   ```bash
   docker compose down
   ```

2. **Start only the database**:
   ```bash
   docker compose up -d postgres
   ```

3. **Restore from backup**:
   ```bash
   ./scripts/restore-db.sh backups/<backup_file>.sql.gz
   ```

4. **Restart all services**:
   ```bash
   docker compose up -d
   ```

5. **Verify**: Check health endpoint and Prometheus targets

#### Scenario C — Full System Recovery

1. Clone repository
2. Copy `.env` file
3. Run `docker compose up -d`
4. Restore database: `./scripts/restore-db.sh backups/<latest_backup>.sql.gz`
5. Verify all services at their respective ports

---

### 6. Service Ports

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3089 |
| Backend API | http://localhost:3001 |
| Adminer | http://localhost:8080 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3002 |

---

### 7. Useful Commands

```bash
make up              # Start all services
make down            # Stop all services
make db-backup       # Manual database backup
make db-restore FILE=<path>  # Restore from backup
docker compose logs -f backend   # Tail backend logs
```
