#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/blog}"
cd "$APP_DIR"

export SERVER_HOST="${SERVER_HOST:-82.156.149.118}"
export COMPOSE_FILE="docker-compose.yml:docker-compose.prod.yml"

if [ ! -f .env ]; then
  cp .env.example .env
  sed -i 's/NODE_ENV=development/NODE_ENV=production/' .env
  sed -i "s/change_me_to_a_long_random_string/$(openssl rand -hex 32)/" .env
fi

# Docker internal network uses service ports, not host-mapped ports.
sed -i 's/^MYSQL_PORT=.*/MYSQL_PORT=3306/' .env
sed -i 's/^REDIS_PORT=.*/REDIS_PORT=6379/' .env
sed -i 's/^MYSQL_HOST=.*/MYSQL_HOST=mysql/' .env
sed -i 's/^REDIS_HOST=.*/REDIS_HOST=redis/' .env

docker compose build --pull
docker compose up -d
docker compose ps
docker image prune -f

NGINX_VHOST="/www/server/panel/vhost/nginx/${SERVER_HOST}.conf"
if [ -f deploy/nginx/blog.conf ] && [ -d /www/server/panel/vhost/nginx ]; then
  cp deploy/nginx/blog.conf "$NGINX_VHOST"
  nginx -t && nginx -s reload
fi

echo "Deploy finished. Web: http://${SERVER_HOST}/zh"
