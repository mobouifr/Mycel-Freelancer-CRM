# =============================================================================
# FREELANCER CRM — Makefile
# =============================================================================

DOCKER_COMPOSE := $(shell if docker compose version > /dev/null 2>&1; then echo "docker compose"; else echo "docker-compose"; fi)
BACKEND_EXEC   := $(DOCKER_COMPOSE) exec backend
FRONTEND_EXEC  := $(DOCKER_COMPOSE) exec frontend
DB_EXEC        := $(DOCKER_COMPOSE) exec postgres
TIMESTAMP      := $(shell date +%Y%m%d_%H%M%S)

# Colors
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
CYAN   := \033[0;36m
BOLD   := \033[1m
RESET  := \033[0m

# =============================================================================
# DOCKER
# =============================================================================

## up             : Start all services (build)
up:
	@$(DOCKER_COMPOSE) up -d --build
	@printf "$(GREEN)✔ Services running$(RESET)\n"
	@printf "  Frontend  → http://localhost:3089\n"
	@printf "  Backend   → http://localhost:3001\n"
	@printf "  Adminer   → http://localhost:8080\n"
	@printf "  Grafana   → http://localhost:3002\n"

## down           : Stop all services
down:
	@$(DOCKER_COMPOSE) down
	@printf "$(GREEN)✔ Stopped$(RESET)\n"

## restart        : Rebuild and restart all services
restart:
	@$(DOCKER_COMPOSE) down && $(DOCKER_COMPOSE) up -d --build
	@printf "$(GREEN)✔ Restarted$(RESET)\n"

## logs           : Tail logs (all services)
logs:
	@$(DOCKER_COMPOSE) logs -f

## logs-backend   : Tail backend logs only
logs-backend:
	@$(DOCKER_COMPOSE) logs -f backend

## logs-frontend  : Tail frontend logs only
logs-frontend:
	@$(DOCKER_COMPOSE) logs -f frontend

## logs-db        : Tail postgres logs only
logs-db:
	@$(DOCKER_COMPOSE) logs -f postgres

## status         : Show running containers
status:
	@$(DOCKER_COMPOSE) ps

## clean          : Stop + remove volumes
clean:
	@printf "$(RED)Remove containers and volumes? [y/N] $(RESET)" && read ans && [ $${ans:-N} = y ]
	@$(DOCKER_COMPOSE) down -v --remove-orphans
	@printf "$(GREEN)✔ Cleaned$(RESET)\n"

## fclean         : Full clean (containers + volumes + images)
fclean:
	@printf "$(RED)Remove everything including images? [y/N] $(RESET)" && read ans && [ $${ans:-N} = y ]
	@$(DOCKER_COMPOSE) down -v --rmi local --remove-orphans
	@printf "$(GREEN)✔ Full clean done$(RESET)\n"

# =============================================================================
# SHELLS
# =============================================================================

## shell-backend  : Open shell in backend container
shell-backend:
	@$(BACKEND_EXEC) sh

## shell-frontend : Open shell in frontend container
shell-frontend:
	@$(FRONTEND_EXEC) sh

## shell-db       : Open shell in postgres container
shell-db:
	@$(DB_EXEC) sh

# =============================================================================
# DATABASE
# =============================================================================

## db-shell       : Open psql inside postgres container
db-shell:
	@$(DB_EXEC) psql -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-freelancer_crm}

## db-backup      : Backup database to backups/ with timestamp
db-backup:
	@mkdir -p backups
	@$(DB_EXEC) pg_dump -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-freelancer_crm} --clean --if-exists > backups/backup_$(TIMESTAMP).sql
	@printf "$(GREEN)✔ Saved to backups/backup_$(TIMESTAMP).sql$(RESET)\n"

## db-restore     : Restore DB (usage: make db-restore FILE=backups/xxx.sql)
db-restore:
	@if [ -z "$(FILE)" ]; then printf "$(RED)✘ Usage: make db-restore FILE=backups/file.sql$(RESET)\n"; exit 1; fi
	@if [ ! -f "$(FILE)" ]; then printf "$(RED)✘ Not found: $(FILE)$(RESET)\n"; exit 1; fi
	@printf "$(RED)Overwrite database with $(FILE)? [y/N] $(RESET)" && read ans && [ $${ans:-N} = y ]
	@cat $(FILE) | $(DB_EXEC) psql -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-freelancer_crm}
	@printf "$(GREEN)✔ Restored from $(FILE)$(RESET)\n"

# =============================================================================
# PRISMA
# =============================================================================

## migrate        : Apply existing migrations (deploy)
migrate:
	@$(BACKEND_EXEC) npx prisma migrate deploy

## migrate-dev    : Create + apply new migration (dev)
migrate-dev:
	@$(BACKEND_EXEC) npx prisma migrate dev

## generate       : Regenerate Prisma client
generate:
	@$(BACKEND_EXEC) npx prisma generate

## seed           : Seed the database
seed:
	@$(BACKEND_EXEC) npx prisma db seed

## studio         : Open Prisma Studio on port 5555
studio:
	@printf "$(CYAN)Prisma Studio → http://localhost:5555$(RESET)\n"
	@$(BACKEND_EXEC) npx prisma studio

# =============================================================================
# TESTING
# =============================================================================

## test           : Run all tests (backend + frontend)
test: test-backend test-frontend

## test-backend   : Run backend tests
test-backend:
	@$(BACKEND_EXEC) npm run test -- --runInBand --passWithNoTests

## test-frontend  : Run frontend tests
test-frontend:
	@$(FRONTEND_EXEC) npm run test

## lint           : Lint all code
lint: lint-backend lint-frontend

## lint-backend   : Lint backend
lint-backend:
	@$(BACKEND_EXEC) npm run lint

## lint-frontend  : Lint frontend
lint-frontend:
	@$(FRONTEND_EXEC) npm run lint

# =============================================================================
# LOCAL DEV (no Docker)
# =============================================================================

## backend-install : npm install for backend
backend-install:
	cd backend && npm install

## backend-dev    : Run backend locally with hot reload
backend-dev:
	cd backend && npm run start:dev

## backend-build  : Build backend locally
backend-build:
	cd backend && npm run build

## frontend-install : npm install for frontend
frontend-install:
	cd frontend/my-app && npm install

## frontend-dev   : Run frontend locally
frontend-dev:
	cd frontend/my-app && npm run dev

# =============================================================================
# MONITORING
# =============================================================================

## up-monitoring  : Start Prometheus + Grafana + exporter
up-monitoring:
	@$(DOCKER_COMPOSE) up -d prometheus grafana postgres-exporter
	@printf "$(GREEN)✔ Monitoring started$(RESET)\n"
	@printf "  Prometheus → http://localhost:9090\n"
	@printf "  Grafana    → http://localhost:3002\n"

## down-monitoring : Stop monitoring stack
down-monitoring:
	@$(DOCKER_COMPOSE) stop prometheus grafana postgres-exporter

## prometheus     : Open Prometheus in browser
prometheus:
	xdg-open http://localhost:9090 2>/dev/null || open http://localhost:9090

## grafana        : Open Grafana in browser
grafana:
	xdg-open http://localhost:3002 2>/dev/null || open http://localhost:3002

# =============================================================================
# HELP
# =============================================================================

## help           : Show this help
help:
	@printf "\n$(CYAN)$(BOLD)Freelancer CRM — make targets$(RESET)\n\n"
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/^## //' | \
		awk -F ' : ' '{printf "  $(GREEN)%-22s$(RESET)%s\n", $$1, $$2}'
	@printf "\n$(YELLOW)Examples:$(RESET)\n"
	@printf "  make up\n"
	@printf "  make logs-backend\n"
	@printf "  make migrate-dev\n"
	@printf "  make db-restore FILE=backups/backup_20260329_153730.sql\n\n"

.DEFAULT_GOAL := help

.PHONY: up down restart logs logs-backend logs-frontend logs-db status clean fclean \
        shell-backend shell-frontend shell-db \
        db-shell db-backup db-restore \
        migrate migrate-dev generate seed studio \
        test test-backend test-frontend lint lint-backend lint-frontend \
        backend-install backend-dev backend-build \
        frontend-install frontend-dev \
        up-monitoring down-monitoring prometheus grafana \
        help



# # --- Docker -------------------------------------------------
# up:
# 	docker compose up -d --build

# down:
# 	docker compose down

# logs:
# 	docker compose logs -f

# restart:
# 	docker compose down && docker compose up -d --build

# # --- Prisma (runs inside backend container) ----------------
# migrate:
# 	docker compose exec backend npx prisma migrate deploy

# migrate-dev:
# 	docker compose exec backend npx prisma migrate dev

# generate:
# 	docker compose exec backend npx prisma generate

# seed:
# 	docker compose exec backend npx prisma db seed

# studio:
# 	docker compose exec backend npx prisma studio

# # --- Database ----------------------------------------------
# db-shell:
# 	docker compose exec postgres psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

# db-backup:
# 	bash scripts/backup-db.sh

# db-restore:
# 	bash scripts/restore-db.sh

# # --- Backend dev (local, no Docker) ------------------------
# backend-install:
# 	cd backend/OthmaneEr-Refaly && npm install

# backend-dev:
# 	cd backend/OthmaneEr-Refaly && npm run start:dev

# backend-build:
# 	cd backend/OthmaneEr-Refaly && npm run build

# # --- Frontend dev (local, no Docker) -----------------------
# frontend-install:
# 	cd frontend/my-app && npm install

# frontend-dev:
# 	cd frontend/my-app && npm run dev

# # --- Monitoring --------------------------------------------
# prometheus:
# 	xdg-open http://localhost:9090 || open http://localhost:9090

# grafana:
# 	xdg-open http://localhost:3001 || open http://localhost:3001

# .PHONY: up down logs restart migrate migrate-dev generate seed studio \
#         db-shell db-backup db-restore backend-install backend-dev backend-build \
#         frontend-install frontend-dev prometheus grafana
