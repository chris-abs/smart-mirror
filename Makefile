.PHONY: build build-api build-client up down restart logs

# Smart build that auto-detects dependency changes
build:
	@./scripts/docker-build.sh

# Build specific services
build-api:
	@API_DEPS_HASH=$$(./scripts/calculate-deps-hash.sh api) docker compose build api

build-client:
	@CLIENT_DEPS_HASH=$$(./scripts/calculate-deps-hash.sh client) docker compose build client

# Standard docker-compose commands
up:
	@API_DEPS_HASH=$$(./scripts/calculate-deps-hash.sh api) \
	 CLIENT_DEPS_HASH=$$(./scripts/calculate-deps-hash.sh client) \
	 docker compose up -d

down:
	docker compose down

restart:
	@make down && make up

logs:
	docker compose logs -f

# Rebuild everything from scratch (no cache)
rebuild:
	@./scripts/docker-build.sh --no-cache
