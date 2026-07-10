# VibeU Backend Makefile
# ======================
# Migrations use DIRECT_URL (bypasses PgBouncer)
# Other commands use DATABASE_URL (via PgBouncer connection pool)

# Load .env file
include .env
export

# ======================
# Development
# ======================

.PHONY: install
install: ## Install dependencies
	pnpm install

.PHONY: build
build: ## Build the project
	pnpm build

.PHONY: dev
dev: ## Start development server
	pnpm start:dev

.PHONY: start
start: ## Start production server
	pnpm start:prod

.PHONY: test
test: ## Run tests
	pnpm test

.PHONY: lint
lint: ## Run linter
	pnpm lint

.PHONY: format
format: ## Format code
	pnpm format

# ======================
# Prisma / Database
# ======================

.PHONY: generate
generate: ## Generate Prisma Client (with CJS fix)
	pnpm generate

.PHONY: migrate
migrate: ## Run migrations (uses DIRECT_URL)
	set DATABASE_URL=$(DIRECT_URL) && pnpm prisma migrate deploy

.PHONY: migrate-dev
migrate-dev: ## Create and apply migration in dev (uses DIRECT_URL)
	set DATABASE_URL=$(DIRECT_URL) && pnpm prisma migrate dev

.PHONY: migrate-create
migrate-create: ## Create migration without applying (uses DIRECT_URL)
	if "$(name)"=="" echo Usage: make migrate-create name=migration_name && exit 1
	set DATABASE_URL=$(DIRECT_URL) && pnpm prisma migrate dev --name $(name) --create-only

.PHONY: migrate-status
migrate-status: ## Check migration status (uses DIRECT_URL)
	set DATABASE_URL=$(DIRECT_URL) && pnpm prisma migrate status

.PHONY: db-push
db-push: ## Push schema changes directly to DB (uses DIRECT_URL)
	set DATABASE_URL=$(DIRECT_URL) && pnpm prisma db push

.PHONY: db-pull
db-pull: ## Pull schema from database (uses DIRECT_URL)
	set DATABASE_URL=$(DIRECT_URL) && pnpm prisma db pull

.PHONY: db-seed
db-seed: ## Seed the database (uses DIRECT_URL)
	set DATABASE_URL=$(DIRECT_URL) && pnpm prisma db execute --file prisma/sql/seed-account-statuses.sql

.PHONY: studio
studio: ## Open Prisma Studio (uses DATABASE_URL)
	pnpm prisma studio

# ======================
# Supabase
# ======================

.PHONY: enable-prewarm
enable-prewarm: ## Enable pg_prewarm extension (uses DIRECT_URL)
	set DATABASE_URL=$(DIRECT_URL) && pnpm prisma db execute --file prisma/sql/enable-prewarm.sql

.PHONY: prewarm
prewarm: ## Run pg_prewarm on all tables (uses DIRECT_URL)
	set DATABASE_URL=$(DIRECT_URL) && pnpm prisma db execute --file prisma/sql/prewarm.sql

# ======================
# Setup (First time)
# ======================

.PHONY: setup
setup: install generate migrate-dev db-seed enable-prewarm prewarm ## First time setup (install, migrate, seed, prewarm)

# ======================
# Docker (optional)
# ======================

.PHONY: docker-build
docker-build: ## Build Docker image
	docker build -t vibe-u-be .

.PHONY: docker-run
docker-run: ## Run Docker container
	docker run -p 3000:3000 --env-file .env vibe-u-be

# ======================
# Cleanup
# ======================

.PHONY: clean
clean: ## Clean build artifacts
	if exist dist rmdir /s /q dist
	if exist node_modules rmdir /s /q node_modules
	if exist generated\prisma rmdir /s /q generated\prisma

.PHONY: reset
reset: clean install generate ## Reset project (clean, install, generate)

# ======================
# Help
# ======================

.PHONY: help
help: ## Show this help message
	@echo Available commands:
	@echo.
	@echo   install          Install dependencies
	@echo   build            Build the project
	@echo   dev              Start development server
	@echo   start            Start production server
	@echo   test             Run tests
	@echo   lint             Run linter
	@echo   format           Format code
	@echo.
	@echo   generate         Generate Prisma Client
	@echo   migrate          Run migrations (DIRECT_URL)
	@echo   migrate-dev      Create and apply migration (DIRECT_URL)
	@echo   migrate-create   Create migration only (DIRECT_URL)
	@echo   migrate-status   Check migration status (DIRECT_URL)
	@echo   db-push          Push schema changes (DIRECT_URL)
	@echo   db-pull          Pull schema from DB (DIRECT_URL)
	@echo   db-seed          Seed the database (DIRECT_URL)
	@echo   studio           Open Prisma Studio (DATABASE_URL)
	@echo.
	@echo   enable-prewarm   Enable pg_prewarm extension (DIRECT_URL)
	@echo   prewarm          Run pg_prewarm on all tables (DIRECT_URL)
	@echo.
	@echo   setup            First time setup (install, migrate, seed, prewarm)
	@echo   clean            Clean build artifacts
	@echo   reset            Clean + install + generate

.DEFAULT_GOAL := help
