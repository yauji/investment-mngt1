# ./Dockerfile
FROM ubuntu:22.04

# 必須ツール（amplify は Node、awscli は認証/SSO 用、python3 は一部のコード生成/ビルドで利用されることあり）
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      python3 python3-pip python3-venv \
      git unzip curl bash ca-certificates jq \
      build-essential openssl && \
    rm -rf /var/lib/apt/lists/*

# Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# AWS CLI v2 (multi-arch; supports amd64/arm64)
ARG TARGETARCH
RUN set -eux; \
    case "$TARGETARCH" in \
      amd64)  AWSCLI_ARCH=x86_64 ;; \
      arm64)  AWSCLI_ARCH=aarch64 ;; \
      *) echo "Unsupported TARGETARCH: $TARGETARCH"; exit 1 ;; \
    esac; \
    curl -sSL "https://awscli.amazonaws.com/awscli-exe-linux-${AWSCLI_ARCH}.zip" -o /tmp/awscliv2.zip && \
    unzip -q /tmp/awscliv2.zip -d /tmp && \
    /tmp/aws/install && \
    rm -rf /tmp/aws /tmp/awscliv2.zip

# Amplify CLI
RUN npm install -g @aws-amplify/cli

# 作業ディレクトリ
WORKDIR /workspace


# 便利エイリアス（任意）
SHELL ["/bin/bash", "-lc"]
RUN echo 'alias a="amplify"' >> ~/.bashrc && \
    echo 'alias awsprofile="aws configure list-profiles"' >> ~/.bashrc

# デフォルトはシェルで
CMD [ "bash" ]