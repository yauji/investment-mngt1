

IMAGE_NAME=amplify-dev
CONTAINER_NAME=amplify-container
APP_DIR=..

build:
	docker build -t $(IMAGE_NAME) -f Dockerfile .

run:
	docker run -it --rm \
	  -v $(abspath $(APP_DIR)):/app \
	  -p 8080:8080 \
	  $(IMAGE_NAME)

dev: build run

down:
	docker rm -f $(CONTAINER_NAME)

rebuild: down build run

sh:
	docker exec -it $(CONTAINER_NAME) /bin/bash

