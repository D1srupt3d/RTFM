# RTFM Makefile

.PHONY: help install dev build up down restart logs config clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Run in development mode with auto-reload
	npm run dev

build: ## Build Docker image
	docker-compose build

up: ## Start containers
	docker-compose up -d

down: ## Stop containers
	docker-compose down

restart: ## Restart containers
	docker-compose restart

logs: ## Show container logs
	docker-compose logs -f

config: ## Create config.json from example
	@if [ -f config.json ]; then \
		echo "config.json already exists!"; \
	else \
		cp config.example.json config.json; \
		echo "Created config.json - edit it to customize"; \
		echo "Then uncomment the volume mount in docker-compose.yml"; \
	fi

clean: ## Clean up generated files
	rm -rf node_modules docs
	docker-compose down -v
