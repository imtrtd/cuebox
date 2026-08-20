#!/usr/bin/env bash
# Idempotent repository bootstrap for local and Cloud Agent installs.
# Durable setup only — no long-running services or migrations.
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
    secret="$(openssl rand -base64 32 | tr -d '\n')"
    # Quote the secret so shell/dotenv parsers stay safe.
    sed -i "s|^AUTH_SECRET=replace-me-with-a-long-random-string$|AUTH_SECRET=\"${secret}\"|" .env
    log "Generated AUTH_SECRET"
  fi
fi

log "Installing npm dependencies"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

log "Building MCP widget bundle"
npm run build:mcp-widget

log "Install complete"
