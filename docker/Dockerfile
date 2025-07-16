# ベースイメージ
FROM ubuntu:22.04

# 環境変数の設定（非対話モード）
#ENV DEBIAN_FRONTEND=noninteractive

# 必要なパッケージのインストール
RUN apt-get update && \
    apt-get install -y curl git unzip gnupg vim && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g @aws-amplify/cli @vue/cli && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリ（ホストとバインドマウントされることを想定）
WORKDIR /app

# Webpackエラー回避用
ENV NODE_OPTIONS=--openssl-legacy-provider

# デフォルトのコンテナ起動時のコマンド
#CMD ["npm", "run", "serve"]
# 最後の行を次のように変更
CMD ["/bin/bash"]