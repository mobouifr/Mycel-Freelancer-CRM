# =============================================================================
# FREELANCER CRM — Makefile (Evaluation-focused)
# =============================================================================

SUDO           := $(shell docker info > /dev/null 2>&1 || echo "sudo ")
DOCKER_COMPOSE := $(shell if $(SUDO)docker compose version > /dev/null 2>&1; then echo "$(SUDO)docker compose"; else echo "$(SUDO)docker-compose"; fi)
COMPOSE_PROD   := $(DOCKER_COMPOSE) -f docker-compose.prod.yml
BACKEND_EXEC   := $(DOCKER_COMPOSE) exec backend
DB_EXEC        := $(DOCKER_COMPOSE) exec postgres
TIMESTAMP      := $(shell date +%Y%m%d_%H%M%S)
DOMAIN         ?= $(shell grep '^DOMAIN=' .env 2>/dev/null | cut -d= -f2)

# Colors
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
CYAN   := \033[0;36m
BOLD   := \033[1m
RESET  := \033[0m

# =============================================================================
# DOCKER / PROJECT CONTROL
# =============================================================================

## ssl-dev-cert   : Generate self-signed cert for localhost HTTPS dev server
ssl-dev-cert:
	@mkdir -p docker/ssl/dev
	@if [ ! -f docker/ssl/dev/localhost.crt ]; then \
		printf "$(CYAN)Generating self-signed cert for localhost...$(RESET)\n"; \
		openssl req -x509 -nodes -newkey rsa:2048 \
			-keyout docker/ssl/dev/localhost.key \
			-out docker/ssl/dev/localhost.crt \
			-days 3650 \
			-subj "/CN=localhost" \
			-addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1" 2>/dev/null; \
		printf "$(GREEN)Cert generated at docker/ssl/dev/$(RESET)\n"; \
	else \
		printf "$(GREEN)Cert already exists, skipping$(RESET)\n"; \
	fi

## up             : Start all services (build)
up: ssl-dev-cert
	@$(DOCKER_COMPOSE) up -d --build
	@printf "$(GREEN)Services running$(RESET)\n"
	@printf "  Frontend  -> $(CYAN)https://localhost$(RESET)  (accept self-signed cert on first visit)\n"
	@printf "  Backend   -> http://localhost:3001\n"
	@printf "  Adminer   -> http://localhost:8080\n"
	@printf "  Grafana   -> http://localhost:3002\n"

## down           : Stop all services
down:
	@$(DOCKER_COMPOSE) down
	@printf "$(GREEN)Stopped$(RESET)\n"

## restart        : Rebuild and restart all services
restart:
	@$(DOCKER_COMPOSE) down && $(DOCKER_COMPOSE) up -d --build
	@printf "$(GREEN)Restarted$(RESET)\n"

## logs           : Tail logs (all services)
logs:
	@$(DOCKER_COMPOSE) logs -f

## status         : Show running containers
status:
	@$(DOCKER_COMPOSE) ps

## clean          : Stop + remove volumes
clean:
	@printf "$(RED)Remove containers and volumes? [y/N] $(RESET)" && read ans && [ $${ans:-N} = y ]
	@$(DOCKER_COMPOSE) down -v --remove-orphans
	@printf "$(GREEN)Cleaned$(RESET)\n"

# =============================================================================
# PRODUCTION
# =============================================================================

## prod-up        : Build and start production stack (requires .env with DOMAIN)
prod-up:
	@if [ -z "$(DOMAIN)" ]; then printf "$(RED)Set DOMAIN in .env first$(RESET)\n"; exit 1; fi
	@DOMAIN=$(DOMAIN) $(COMPOSE_PROD) up -d --build
	@printf "$(GREEN)Production stack running$(RESET)\n"
	@printf "  HTTPS -> https://$(DOMAIN)\n"

## prod-down      : Stop production stack
prod-down:
	@$(COMPOSE_PROD) down
	@printf "$(GREEN)Production stopped$(RESET)\n"

## prod-restart   : Rebuild and restart production stack
prod-restart:
	@DOMAIN=$(DOMAIN) $(COMPOSE_PROD) down && DOMAIN=$(DOMAIN) $(COMPOSE_PROD) up -d --build
	@printf "$(GREEN)Production restarted$(RESET)\n"

## prod-logs      : Tail production logs
prod-logs:
	@$(COMPOSE_PROD) logs -f

## prod-status    : Show production container status
prod-status:
	@$(COMPOSE_PROD) ps

# =============================================================================
# SSL / HTTPS
# =============================================================================

## ssl-init       : Bootstrap HTTPS — first-time Let's Encrypt certificate
##                  Usage: make ssl-init DOMAIN=example.com EMAIL=admin@example.com
##                         make ssl-init DOMAIN=example.com EMAIL=admin@example.com STAGING=staging
ssl-init:
	@if [ -z "$(DOMAIN)" ] || [ -z "$(EMAIL)" ]; then \
		printf "$(RED)Usage: make ssl-init DOMAIN=example.com EMAIL=admin@example.com$(RESET)\n"; \
		exit 1; \
	fi
	@chmod +x scripts/init-letsencrypt.sh
	@./scripts/init-letsencrypt.sh "$(DOMAIN)" "$(EMAIL)" "$(STAGING)"

## ssl-renew      : Force certificate renewal + reload nginx
ssl-renew:
	@printf "$(CYAN)Renewing certificates for $(DOMAIN)...$(RESET)\n"
	@$(COMPOSE_PROD) exec certbot certbot renew --force-renewal \
		--webroot -w /var/www/certbot --quiet
	@docker exec freelancer-crm-nginx nginx -s reload
	@printf "$(GREEN)Certificate renewed and nginx reloaded$(RESET)\n"

## ssl-status     : Show certificate expiry information
ssl-status:
	@$(COMPOSE_PROD) exec certbot certbot certificates

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
	@printf "$(GREEN)Saved to backups/backup_$(TIMESTAMP).sql$(RESET)\n"

## db-restore     : Restore DB (usage: make db-restore FILE=backups/xxx.sql)
db-restore:
	@if [ -z "$(FILE)" ]; then printf "$(RED)Usage: make db-restore FILE=backups/file.sql$(RESET)\n"; exit 1; fi
	@if [ ! -f "$(FILE)" ]; then printf "$(RED)Not found: $(FILE)$(RESET)\n"; exit 1; fi
	@printf "$(RED)Overwrite database with $(FILE)? [y/N] $(RESET)" && read ans && [ $${ans:-N} = y ]
	@cat $(FILE) | $(DB_EXEC) psql -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-freelancer_crm}
	@printf "$(GREEN)Restored from $(FILE)$(RESET)\n"

# =============================================================================
# MONITORING
# =============================================================================

## up-monitoring  : Start Prometheus + Grafana + exporter
up-monitoring:
	@$(DOCKER_COMPOSE) up -d prometheus grafana postgres-exporter
	@printf "$(GREEN)Monitoring started$(RESET)\n"
	@printf "  Prometheus -> http://localhost:9090\n"
	@printf "  Grafana    -> http://localhost:3002\n"

## down-monitoring : Stop monitoring stack
down-monitoring:
	@$(DOCKER_COMPOSE) stop prometheus grafana postgres-exporter

# =============================================================================
# OPTIONAL DEBUG
# =============================================================================

## shell-backend  : Open shell in backend container
shell-backend:
	@$(BACKEND_EXEC) sh

# =============================================================================
# HELP
# =============================================================================

## help           : Show this help
help:
	@printf "\n$(CYAN)$(BOLD)Freelancer CRM - make targets$(RESET)\n\n"
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/^## //' | \
		awk -F ' : ' '{printf "  $(GREEN)%-22s$(RESET)%s\n", $$1, $$2}'
	@printf "\n$(YELLOW)Examples:$(RESET)\n"
	@printf "  make up\n"
	@printf "  make logs\n"
	@printf "  make db-backup\n"
	@printf "  make db-restore FILE=backups/backup_YYYYMMDD_HHMMSS.sql\n"
	@printf "  make up-monitoring\n\n"

.DEFAULT_GOAL := help

.PHONY: up down restart logs status clean \
		prod-up prod-down prod-restart prod-logs prod-status \
		ssl-dev-cert ssl-init ssl-renew ssl-status \
		db-shell db-backup db-restore \
		up-monitoring down-monitoring \
		shell-backend help
