# =============================================================================
# FREELANCER CRM — Makefile
# =============================================================================
# Usage: make help
# =============================================================================

# Default target when running just "make"
.DEFAULT_GOAL := help

# =============================================================================
# CONFIGURATION
# =============================================================================

# Auto-detect Docker Compose command (v2 "docker compose" vs legacy "docker-compose")
DOCKER_COMPOSE := $(shell if docker compose version > /dev/null 2>&1; then echo "docker compose"; else echo "docker-compose"; fi)

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------

## docker-check   : 🔌  Verify Docker daemon is running
.PHONY: docker-check
docker-check:
	@docker info > /dev/null 2>&1 || \
		(printf "$(RED)$(BOLD)✘ Docker is not running!$(RESET)\n" && \
		 printf "$(YELLOW)  Start Docker Desktop or run: sudo systemctl start docker$(RESET)\n" && \
		 exit 1)

## env-check      : 🔑  Verify .env file exists and required vars are set
.PHONY: env-check
env-check:
	@if [ ! -f .env ]; then \
		printf "$(RED)$(BOLD)✘ .env file not found!$(RESET)\n"; \
		printf "$(YELLOW)  Run: cp .env.example .env$(RESET)\n"; \
		exit 1; \
	fi
	@missing=""; \
	for var in POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB JWT_SECRET; do \
		if ! grep -q "^$$var=" .env || [ -z "$$(grep "^$$var=" .env | cut -d= -f2-)" ]; then \
			missing="$$missing $$var"; \
		fi; \
	done; \
	if [ -n "$$missing" ]; then \
		printf "$(RED)$(BOLD)✘ Missing or empty env vars:$(RESET)$$missing\n"; \
		printf "$(YELLOW)  Edit .env and set these values$(RESET)\n"; \
		exit 1; \
	fi
	$(call print_success,Environment variables verified)

# Project name for container naming
PROJECT_NAME := freelancer-crm

# Production compose file
PROD_FILE := -f docker-compose.prod.yml

# Prisma runs inside the backend container
BACKEND_EXEC := $(DOCKER_COMPOSE) exec backend
FRONTEND_EXEC := $(DOCKER_COMPOSE) exec frontend
DB_EXEC := $(DOCKER_COMPOSE) exec postgres

# Timestamp for backups
TIMESTAMP := $(shell date +%Y%m%d_%H%M%S)

# =============================================================================
# COLORS (ANSI escape codes for terminal output)
# =============================================================================
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
BLUE   := \033[0;34m
CYAN   := \033[0;36m
BOLD   := \033[1m
RESET  := \033[0m

# Helper function for section headers
define print_header
	@printf "\n$(BLUE)$(BOLD)━━━ $(1) ━━━$(RESET)\n\n"
endef

# Helper to show success
define print_success
	@printf "$(GREEN)✔ $(1)$(RESET)\n"
endef

# Helper to show warning
define print_warn
	@printf "$(YELLOW)⚠ $(1)$(RESET)\n"
endef

# Helper to show URLs after startup
define show_urls
	@printf "\n$(CYAN)$(BOLD)🚀 Services are running:$(RESET)\n"
	@printf "  $(GREEN)Frontend:$(RESET)  http://localhost:3000\n"
	@printf "  $(GREEN)Backend:$(RESET)   http://localhost:3001\n"
	@printf "  $(GREEN)Adminer:$(RESET)   http://localhost:8080\n"
	@printf "  $(GREEN)Postgres:$(RESET)  localhost:5432\n"
	@printf "  $(GREEN)Debugger:$(RESET)  localhost:9229\n\n"
endef

# Confirmation prompt for dangerous commands
define confirm
	@printf "$(RED)$(BOLD)⚠ WARNING: $(1)$(RESET)\n"
	@printf "$(YELLOW)Are you sure? [y/N] $(RESET)" && read ans && [ $${ans:-N} = y ]
endef

# =============================================================================
# SETUP
# =============================================================================

## setup          : 🏗  First-time project setup (env, build, migrate)
setup: docker-check env-check
	$(call print_header,First-Time Setup)
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		printf "$(GREEN)✔ Created .env from .env.example$(RESET)\n"; \
		printf "$(YELLOW)⚠ Edit .env with your values before continuing$(RESET)\n"; \
	else \
		printf "$(YELLOW)⚠ .env already exists, skipping copy$(RESET)\n"; \
	fi
	@$(DOCKER_COMPOSE) build
	$(call print_success,Images built successfully)
	@$(DOCKER_COMPOSE) up -d postgres
	@printf "$(YELLOW)⏳ Waiting for PostgreSQL to be healthy...$(RESET)\n"
	@sleep 5
	@$(DOCKER_COMPOSE) up -d backend
	@sleep 10
	$(call print_success,Setup complete! Run 'make dev' to start developing)

## install        : 📦  Install node_modules in all services
install:
	$(call print_header,Installing Dependencies)
	@$(DOCKER_COMPOSE) run --rm --no-deps backend npm ci
	$(call print_success,Backend dependencies installed)
	@$(DOCKER_COMPOSE) run --rm --no-deps frontend npm ci
	$(call print_success,Frontend dependencies installed)

# =============================================================================
# DEVELOPMENT
# =============================================================================

## dev            : 🚀  Start all services with logs (foreground)
dev: docker-check env-check
	$(call print_header,Starting Development Environment)
	@$(DOCKER_COMPOSE) up --build
	$(call show_urls)

## dev-d          : 🚀  Start all services detached (background)
dev-d: docker-check env-check
	$(call print_header,Starting Development Environment (Detached))
	@$(DOCKER_COMPOSE) up -d --build
	$(call show_urls)

## up             : ▶  Start all services (no rebuild)
up: docker-check
	@$(DOCKER_COMPOSE) up -d
	$(call show_urls)

## down           : ⏹  Stop all services
down:
	$(call print_header,Stopping All Services)
	@$(DOCKER_COMPOSE) down
	$(call print_success,All services stopped)

## restart        : 🔄  Restart all services
restart:
	$(call print_header,Restarting All Services)
	@$(DOCKER_COMPOSE) restart
	$(call show_urls)

# =============================================================================
# INDIVIDUAL SERVICES
# =============================================================================

## up-backend     : ▶  Start backend only
up-backend:
	@$(DOCKER_COMPOSE) up -d backend
	$(call print_success,Backend started on http://localhost:3001)

## down-backend   : ⏹  Stop backend only
down-backend:
	@$(DOCKER_COMPOSE) stop backend
	$(call print_success,Backend stopped)

## restart-backend: 🔄 Restart backend only
restart-backend:
	@$(DOCKER_COMPOSE) restart backend
	$(call print_success,Backend restarted)

## up-frontend    : ▶  Start frontend only
up-frontend:
	@$(DOCKER_COMPOSE) up -d frontend
	$(call print_success,Frontend started on http://localhost:3089)

## down-frontend  : ⏹  Stop frontend only
down-frontend:
	@$(DOCKER_COMPOSE) stop frontend
	$(call print_success,Frontend stopped)

## restart-frontend: 🔄 Restart frontend only
restart-frontend:
	@$(DOCKER_COMPOSE) restart frontend
	$(call print_success,Frontend restarted)

## up-db          : ▶  Start database only
up-db:
	@$(DOCKER_COMPOSE) up -d postgres
	$(call print_success,PostgreSQL started on localhost:5432)

## down-db        : ⏹  Stop database only
down-db:
	@$(DOCKER_COMPOSE) stop postgres
	$(call print_success,PostgreSQL stopped)

## restart-db     : 🔄  Restart database only
restart-db:
	@$(DOCKER_COMPOSE) restart postgres
	$(call print_success,PostgreSQL restarted)

# =============================================================================
# DATABASE
# =============================================================================

## db-migrate     : 🔀  Run Prisma migrate dev (creates migration + applies)
db-migrate:
	$(call print_header,Running Prisma Migration (Dev))
	@$(BACKEND_EXEC) npx prisma migrate dev
	$(call print_success,Migration complete)

## db-migrate-prod: 🔀  Run Prisma migrate deploy (apply existing migrations)
db-migrate-prod:
	$(call print_header,Running Prisma Migration (Production))
	@$(BACKEND_EXEC) npx prisma migrate deploy
	$(call print_success,Production migration deployed)

## db-seed        : 🌱  Seed database with initial data
db-seed:
	$(call print_header,Seeding Database)
	@$(BACKEND_EXEC) npx prisma db seed
	$(call print_success,Database seeded)

## db-reset       : 💣  Reset database (drop all tables + re-migrate + seed)
db-reset:
	$(call confirm,This will DROP ALL DATA and reset the database!)
	$(call print_header,Resetting Database)
	@$(BACKEND_EXEC) npx prisma migrate reset --force
	$(call print_success,Database reset complete)

## db-studio      : 🔍  Open Prisma Studio (visual DB browser on port 5555)
db-studio:
	$(call print_header,Opening Prisma Studio)
	@printf "$(CYAN)Prisma Studio: http://localhost:5555$(RESET)\n"
	@$(BACKEND_EXEC) npx prisma studio

## studio         : 🔍  Alias for db-studio
studio: db-studio

## db-shell       : 🐚  Open PostgreSQL interactive shell (psql)
db-shell:
	@$(DB_EXEC) psql -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-freelancer_crm}

## db-backup      : 💾  Backup database to backups/ with timestamp
db-backup:
	$(call print_header,Backing Up Database)
	@mkdir -p backups
	@$(DB_EXEC) pg_dump -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-freelancer_crm} --clean --if-exists > backups/backup_$(TIMESTAMP).sql
	$(call print_success,Backup saved to backups/backup_$(TIMESTAMP).sql)

## db-restore     : 📥  Restore database from backup (usage: make db-restore FILE=backups/xxx.sql)
db-restore:
	@if [ -z "$(FILE)" ]; then \
		printf "$(RED)✘ Usage: make db-restore FILE=backups/backup_YYYYMMDD_HHMMSS.sql$(RESET)\n"; \
		exit 1; \
	fi
	@if [ ! -f "$(FILE)" ]; then \
		printf "$(RED)✘ File not found: $(FILE)$(RESET)\n"; \
		exit 1; \
	fi
	$(call confirm,This will OVERWRITE the current database with $(FILE)!)
	$(call print_header,Restoring Database from $(FILE))
	@cat $(FILE) | $(DB_EXEC) psql -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-freelancer_crm}
	$(call print_success,Database restored from $(FILE))

# =============================================================================
# LOGS
# =============================================================================

## logs           : 📋  Tail logs from all services
logs:
	@$(DOCKER_COMPOSE) logs -f

## logs-backend   : 📋  Tail backend logs
logs-backend:
	@$(DOCKER_COMPOSE) logs -f backend

## logs-frontend  : 📋  Tail frontend logs
logs-frontend:
	@$(DOCKER_COMPOSE) logs -f frontend

## logs-db        : 📋  Tail database logs
logs-db:
	@$(DOCKER_COMPOSE) logs -f postgres

# =============================================================================
# TESTING & QUALITY
# =============================================================================

## test           : 🧪  Run all tests (backend + frontend)
test: test-backend test-frontend

## test-backend   : 🧪  Run backend tests
test-backend:
	$(call print_header,Running Backend Tests)
	@$(BACKEND_EXEC) npm run test
	$(call print_success,Backend tests passed)

## test-frontend  : 🧪  Run frontend tests
test-frontend:
	$(call print_header,Running Frontend Tests)
	@$(FRONTEND_EXEC) npm run test
	$(call print_success,Frontend tests passed)

## lint           : 🔎  Lint all code (backend + frontend)
lint: lint-backend lint-frontend

## lint-backend   : 🔎  Lint backend code
lint-backend:
	$(call print_header,Linting Backend)
	@$(BACKEND_EXEC) npm run lint
	$(call print_success,Backend lint passed)

## lint-frontend  : 🔎  Lint frontend code
lint-frontend:
	$(call print_header,Linting Frontend)
	@$(FRONTEND_EXEC) npm run lint
	$(call print_success,Frontend lint passed)

# =============================================================================
# SHELLS (exec into running containers)
# =============================================================================

## shell-backend  : 🐚  Open shell in backend container
shell-backend:
	@$(BACKEND_EXEC) sh

## shell-frontend : 🐚  Open shell in frontend container
shell-frontend:
	@$(FRONTEND_EXEC) sh

# =============================================================================
# CLEANUP
# =============================================================================

## stop           : ⏹  Stop all containers (keep volumes)
stop:
	$(call print_header,Stopping All Containers)
	@$(DOCKER_COMPOSE) stop
	$(call print_success,All containers stopped)

## clean          : 🧹  Stop containers + remove volumes
clean:
	$(call print_header,Cleaning Up)
	@$(DOCKER_COMPOSE) down -v --remove-orphans
	$(call print_success,Containers and volumes removed)

## fclean         : 🔥  Full clean (containers + volumes + built images)
fclean:
	$(call confirm,This will remove ALL containers$(,) volumes$(,) and project images!)
	$(call print_header,Full Clean)
	@$(DOCKER_COMPOSE) down -v --rmi local --remove-orphans
	$(call print_success,Everything removed)

## prune          : 🗑  Docker system prune (free disk space)
prune:
	$(call confirm,This will remove ALL unused Docker resources system-wide!)
	@docker system prune -af --volumes
	$(call print_success,Docker system pruned)

# =============================================================================
# STATUS
# =============================================================================

## status         : 📊  Show running containers and service URLs
status:
	@printf "\n$(BLUE)$(BOLD)━━━ Container Status ━━━$(RESET)\n\n"
	@$(DOCKER_COMPOSE) ps
	@printf "\n$(BLUE)$(BOLD)━━━ Resource Usage ━━━$(RESET)\n\n"
	@docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" $(shell $(DOCKER_COMPOSE) ps -q 2>/dev/null) 2>/dev/null || printf "$(YELLOW)No running containers$(RESET)\n"
	$(call show_urls)

# =============================================================================
# MONITORING
# =============================================================================

## up-monitoring   : ▶  Start monitoring stack (Prometheus + Grafana)
up-monitoring: docker-check
	$(call print_header,Starting Monitoring Stack)
	@$(DOCKER_COMPOSE) up -d prometheus grafana postgres-exporter
	$(call print_success,Monitoring started)
	@printf "  $(GREEN)Prometheus:$(RESET) http://localhost:9090\n"
	@printf "  $(GREEN)Grafana:$(RESET)    http://localhost:3002\n"

## down-monitoring : ⏹  Stop monitoring stack
down-monitoring:
	$(call print_header,Stopping Monitoring Stack)
	@$(DOCKER_COMPOSE) stop prometheus grafana postgres-exporter
	$(call print_success,Monitoring stopped)

## restart-monitoring: 🔄 Restart monitoring stack
restart-monitoring:
	$(call print_header,Restarting Monitoring Stack)
	@$(DOCKER_COMPOSE) restart prometheus grafana postgres-exporter
	$(call print_success,Monitoring restarted)

## logs-monitoring : 📋  Tail monitoring logs
logs-monitoring:
	@$(DOCKER_COMPOSE) logs -f prometheus grafana postgres-exporter

# =============================================================================
# PRODUCTION
# =============================================================================

## prod-up        : 🏭  Start production environment
prod-up: docker-check env-check
	$(call print_header,Starting Production Environment)
	@$(DOCKER_COMPOSE) $(PROD_FILE) up -d --build
	$(call print_success,Production environment started)

## prod-down      : 🏭  Stop production environment
prod-down:
	@$(DOCKER_COMPOSE) $(PROD_FILE) down
	$(call print_success,Production environment stopped)

## prod-logs      : 🏭  Tail production logs
prod-logs:
	@$(DOCKER_COMPOSE) $(PROD_FILE) logs -f

# =============================================================================
# HELP
# =============================================================================

## help           : 📖  Show this help message
help:
	@printf "\n$(CYAN)$(BOLD)╔══════════════════════════════════════════════════╗$(RESET)\n"
	@printf "$(CYAN)$(BOLD)║          Freelancer CRM — Makefile Help          ║$(RESET)\n"
	@printf "$(CYAN)$(BOLD)╚══════════════════════════════════════════════════╝$(RESET)\n"
	@printf "\n$(YELLOW)Using: $(DOCKER_COMPOSE)$(RESET)\n\n"
	@grep -E '^## ' $(MAKEFILE_LIST) | \
		sed 's/^## //' | \
		awk -F ' : ' '{ \
			category = ""; \
			if ($$1 ~ /setup|install/) category = "SETUP"; \
			else if ($$1 ~ /^dev|^up$$|^down$$|^restart$$/) category = "DEVELOPMENT"; \
			else if ($$1 ~ /up-|down-|restart-|logs-monitoring/) category = "SERVICES"; \
			else if ($$1 ~ /monitoring/) category = "MONITORING"; \
			else if ($$1 ~ /^db-/) category = "DATABASE"; \
			else if ($$1 ~ /^logs/) category = "LOGS"; \
			else if ($$1 ~ /test|lint/) category = "TESTING"; \
			else if ($$1 ~ /shell/) category = "SHELLS"; \
			else if ($$1 ~ /stop|clean|fclean|prune/) category = "CLEANUP"; \
			else if ($$1 ~ /status/) category = "STATUS"; \
			else if ($$1 ~ /prod/) category = "PRODUCTION"; \
			else if ($$1 ~ /help/) category = "HELP"; \
			printf "  \033[0;32m%-20s\033[0m %s\n", $$1, $$2; \
		}'
	@printf "\n$(YELLOW)Examples:$(RESET)\n"
	@printf "  make setup              # First time setup\n"
	@printf "  make dev                # Start with logs\n"
	@printf "  make dev-d              # Start detached\n"
	@printf "  make db-backup          # Backup database\n"
	@printf "  make db-restore FILE=x  # Restore from file\n"
	@printf "\n"

# =============================================================================
# .PHONY — Declare all targets as not files
# =============================================================================
.PHONY: docker-check env-check setup install \
        dev dev-d up down restart \
        up-backend down-backend restart-backend \
        up-frontend down-frontend restart-frontend \
        up-db down-db restart-db \
        db-migrate db-migrate-prod db-seed db-reset db-studio db-shell db-backup db-restore \
        logs logs-backend logs-frontend logs-db \
        test test-backend test-frontend lint lint-backend lint-frontend \
        shell-backend shell-frontend \
        stop clean fclean prune \
        status help \
        up-monitoring down-monitoring restart-monitoring logs-monitoring \
        prod-up prod-down prod-logs
