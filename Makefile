.PHONY: help install dev build up down clean logs restart test lint

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies for both frontend and backend
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Dependencies installed successfully!"

dev: ## Start development environment with Docker Compose
	docker compose up --build

build: ## Build Docker images
	docker compose build

up: ## Start containers in detached mode
	docker compose up -d

down: ## Stop and remove containers
	docker compose down

clean: ## Stop containers and remove volumes
	docker compose down -v
	@echo "Cleaning node_modules..."
	rm -rf backend/node_modules frontend/node_modules
	@echo "Clean complete!"

logs: ## Show logs from all containers
	docker compose logs -f

logs-backend: ## Show logs from backend container
	docker compose logs -f backend

logs-frontend: ## Show logs from frontend container
	docker compose logs -f frontend

logs-mongodb: ## Show logs from MongoDB container
	docker compose logs -f mongodb

restart: ## Restart all containers
	docker compose restart

restart-backend: ## Restart backend container
	docker compose restart backend

restart-frontend: ## Restart frontend container
	docker compose restart frontend

test-backend: ## Run backend tests
	cd backend && npm test

test-frontend: ## Run frontend tests
	cd frontend && npm test

lint-backend: ## Lint backend code
	cd backend && npm run lint

lint-frontend: ## Lint frontend code
	cd frontend && npm run lint

lint: ## Lint both frontend and backend
	@echo "Linting backend..."
	cd backend && npm run lint
	@echo "Linting frontend..."
	cd frontend && npm run lint

dev-backend: ## Run backend in development mode (local)
	cd backend && npm run start:dev

dev-frontend: ## Run frontend in development mode (local)
	cd frontend && npm run dev

shell-backend: ## Open shell in backend container
	docker compose exec backend sh

shell-frontend: ## Open shell in frontend container
	docker compose exec frontend sh

shell-mongodb: ## Open MongoDB shell
	docker compose exec mongodb mongosh rotativa-myra
