#!/usr/bin/env bash
# Per-boot database reconciliation for Cloud Agent start.
# Starts local Postgres when Docker is available, then applies migrations.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

log() {
  printf '==> %s\n' "$*"
}

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if command -v docker >/dev/null 2>&1 && [[ -f docker-compose.yml ]]; then
  if docker info >/dev/null 2>&1; then
    log "Starting local Postgres with Docker Compose"
    docker compose up -d

    log "Waiting for Postgres to become ready"
    ready=0
    for _ in $(seq 1 30); do
      if docker compose exec -T db pg_isready -U cuebox -d cuebox >/dev/null 2>&1; then
        ready=1
        break
      fi
      sleep 1
    done
    if [[ "$ready" -ne 1 ]]; then
      log "Postgres did not become ready in time; continuing without migrate"
      exit 0
    fi
  else
    log "Docker daemon unavailable; skipping local Postgres"
  fi
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  log "DATABASE_URL unset; skipping migrations"
  exit 0
fi

log "Applying database migrations"
if npx prisma migrate deploy; then
  log "Database migrations applied"
else
  log "Database migrations skipped (database not reachable)"
fi
