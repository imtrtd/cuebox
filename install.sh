#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

log() {
  printf '==> %s\n' "$*"
}

if [[ ! -f .env ]]; then
  log "Creating .env from .env.example"
  cp .env.example .env
fi

if grep -q '^AUTH_SECRET=replace-me-with-a-long-random-string$' .env; then
  if command -v openssl >/dev/null 2>&1; then
    secret="$(openssl rand -base64 32)"
    sed -i "s|^AUTH_SECRET=replace-me-with-a-long-random-string$|AUTH_SECRET=${secret}|" .env
    log "Generated AUTH_SECRET"
  fi
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

log "Installing npm dependencies"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

log "Building MCP widget bundle"
npm run build:mcp-widget

if command -v docker >/dev/null 2>&1 && [[ -f docker-compose.yml ]]; then
  if docker info >/dev/null 2>&1; then
    log "Starting local Postgres with Docker Compose"
    docker compose up -d

    log "Waiting for Postgres to become ready"
    for _ in $(seq 1 30); do
      if docker compose exec -T db pg_isready -U cuebox -d cuebox >/dev/null 2>&1; then
        break
      fi
      sleep 1
    done
  else
    log "Docker daemon unavailable; skipping local Postgres"
  fi
fi

if [[ -n "${DATABASE_URL:-}" ]]; then
  log "Applying database migrations"
  if npx prisma migrate deploy; then
    log "Database migrations applied"
  else
    log "Database migrations skipped (database not reachable)"
  fi
fi

log "Install complete"
