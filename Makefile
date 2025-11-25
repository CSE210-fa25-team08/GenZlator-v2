.PHONY: help build up down logs restart clean runDev runProd stop ps shell backend-logs install-backend install-slack install-web install-all setup health rebuild

.DEFAULT_GOAL := help

help:
	@echo "Available commands:"
	@echo "  make runDev      - Start services in development mode (with logs)"
	@echo "  make runProd     - Start services in production mode (detached)"
	@echo "  make build       - Build Docker images"
	@echo "  make up          - Start services (detached)"
	@echo "  make down        - Stop services"
	@echo "  make stop        - Stop services"
	@echo "  make restart     - Restart services"
	@echo "  make logs        - View logs"
	@echo "  make clean       - Remove containers and volumes"
	@echo "  make rebuild     - Clean, rebuild, and start"
	@echo "  make ps          - Show running containers"
	@echo "  make health      - Check backend health"
	@echo "  make shell       - Open shell in backend container"
	@echo "  make backend-logs - View backend logs only"

# ============================================================================
# Main Commands
# ============================================================================

runDev: build
	docker compose up

runProd: build
	docker compose up -d
	@echo "Services started in production mode"
	@echo "Backend: http://localhost:8000"
	@echo "Docs: http://localhost:8000/docs"

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

stop: down

restart:
	docker compose restart

logs:
	docker compose logs -f

ps:
	docker compose ps

# ============================================================================
# Individual Service Commands
# ============================================================================

backend-logs:
	docker compose logs -f backend

shell:
	docker compose exec backend /bin/bash

# ============================================================================
# Maintenance
# ============================================================================

clean:
	docker compose down -v
	docker system prune -f

rebuild: clean build up

health:
	@curl -s http://localhost:8000/healthz || echo "Backend is not running"

# ============================================================================
# Local Development (Non-Docker)
# ============================================================================

install-backend:
	cd src/backend && pip install -r requirements.txt

install-slack:
	cd src/frontend/slack-bot && npm install

install-web:
	cd src/frontend/web-app && npm install

install-all: install-backend install-slack install-web

setup:
	@if [ ! -f .env ]; then \
		echo "Creating .env file..."; \
		echo "OPENROUTER_API_KEY=your-api-key-here" > .env; \
		echo "FEEDBACK_LOG_PATH=feedback_log.jsonl" >> .env; \
		echo ".env file created! Please update with your values."; \
	fi
