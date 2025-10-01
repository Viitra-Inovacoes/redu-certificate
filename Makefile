DOCKERFILE = Dockerfile
BASE_IMAGE = viitrainovacoes/redu-certificate

MAKEFLAGS += --no-print-directory

.SILENT:
.ONESHELL:
.PHONY: build prompt prod test

GREEN := \033[0;32m
RED   := \033[0;31m
BLUE  := \033[0;34m
NC    := \033[0m


build:
	if [ -z "$(environment)" ] || [ -z "$(version)" ]; then
		$(MAKE) prompt
		exit 0
	fi

	if [ "$(environment)" != "prod" ] && [ "$(environment)" != "test" ]; then
		printf "$(RED)ERROR: environment must be 'prod' or 'test' (got '$(environment)')$(NC)\n"
		exit 1
	fi

	if [ "$(environment)" = "prod" ]; then
		IMAGE_NAME="$(BASE_IMAGE)"
	else
		IMAGE_NAME="$(BASE_IMAGE)-test"
	fi

	printf "$(BLUE)Building image: $$IMAGE_NAME:$(version)$(NC)\n"
	printf "Using Dockerfile: $(DOCKERFILE)\n\n"

	if docker build -t $$IMAGE_NAME:$(version) -f $(DOCKERFILE) .; then
		printf "$(GREEN)Build succeeded. Tagging & pushing...$(NC)\n"
		docker tag $$IMAGE_NAME:$(version) $$IMAGE_NAME:latest
		docker push $$IMAGE_NAME:$(version)
		docker push $$IMAGE_NAME:latest
		printf "$(GREEN)Image pushed successfully!$(NC)\n"
	else
		printf "$(RED)Docker build failed. Push aborted.$(NC)\n"
		exit 1
	fi

prompt:
	printf "$(BLUE)Enter environment (prod/test): $(NC)"
	read environment

	printf "$(BLUE)Enter version: $(NC)"
	read version

	$(MAKE) build environment="$$environment" version="$$version"

prod:
	$(MAKE) build environment="prod"

test:
	$(MAKE) build environment="test"
