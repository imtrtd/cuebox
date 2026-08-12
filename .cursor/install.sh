#!/usr/bin/env bash
set -euo pipefail

# Idempotent Cloud Agent setup for Cuebox (Next.js + Prisma/SQLite + Auth.js).
# Safe to re-run: it fills missing local env values, then refreshes
# dependencies, the Prisma client, and the SQLite schema.

# Provision missing local development values without overwriting an existing
# configuration. AUTH_SECRET is a generated dev-only secret; DATABASE_URL
# points at the repo-local SQLite file used by Prisma.
if [ ! -f .env ]; then
  echo "Creating .env for local development"
  touch .env
fi

if ! grep -qE '^[[:space:]]*AUTH_SECRET=' .env; then
  echo "Adding missing AUTH_SECRET to .env"
  echo "AUTH_SECRET=$(openssl rand -base64 32)" >> .env
fi

if ! grep -qE '^[[:space:]]*DATABASE_URL=' .env; then
  echo "Adding missing DATABASE_URL to .env"
  echo 'DATABASE_URL="file:./dev.db"' >> .env
fi

if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi
npx prisma generate
npx prisma migrate deploy
