# ===== Settings =====
COMPOSE ?= docker compose
SERVICE ?= amplify

# amplify コンテナ内の作業ディレクトリ
WORKDIR ?= /workspace

# ===== Basic lifecycle =====
.PHONY: build up down restart ps logs sh clean nuke

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) down
	$(COMPOSE) up -d

ps:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs -f $(SERVICE)

sh:
	$(COMPOSE) run --rm $(SERVICE) bash

clean:
	$(COMPOSE) down -v

# 使い終わったらボリュームも完全削除（npm-cache含む）
nuke:
	$(COMPOSE) down -v --remove-orphans

# ===== Amplify helpers =====
# 例: make amplify cmd="status"
#     make amplify cmd="push --yes"
#     make amplify cmd="pull --appId APPID --envName dev"
.PHONY: amplify
amplify:
	$(COMPOSE) run --rm $(SERVICE) bash -lc "cd $(WORKDIR) && amplify $(cmd)"

# よく使う定番をショートカット化
.PHONY: amplify-init amplify-push amplify-pull amplify-mock amplify-func-build amplify-status
amplify-init:
	$(COMPOSE) run --rm $(SERVICE) bash -lc "cd $(WORKDIR) && amplify init"

amplify-push:
	$(COMPOSE) run --rm $(SERVICE) bash -lc "cd $(WORKDIR) && amplify push --yes"

# 例: make amplify-pull appId=xxx env=dev
appId ?=
env ?=
amplify-pull:
	@test -n \"$(appId)\" || (echo 'ERROR: specify appId, e.g. make amplify-pull appId=xxx env=dev' && exit 1)
	@test -n \"$(env)\"   || (echo 'ERROR: specify env,   e.g. make amplify-pull appId=xxx env=dev' && exit 1)
	$(COMPOSE) run --rm $(SERVICE) bash -lc "cd $(WORKDIR) && amplify pull --appId $(appId) --envName $(env)"

# GraphQL / API のローカルモック
amplify-mock:
	$(COMPOSE) run --rm --service-ports $(SERVICE) bash -lc "cd $(WORKDIR) && amplify mock"

# Lambda 関数のビルド
amplify-func-build:
	$(COMPOSE) run --rm $(SERVICE) bash -lc "cd $(WORKDIR) && amplify function build"

amplify-status:
	$(COMPOSE) run --rm $(SERVICE) bash -lc "cd $(WORKDIR) && amplify status"

# ===== AWS CLI helpers =====
# 例: make aws cmd="sts get-caller-identity"
.PHONY: aws
aws:
	$(COMPOSE) run --rm $(SERVICE) bash -lc "aws $(cmd)"