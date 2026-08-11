#!/usr/bin/env bash
set -euo pipefail

# Idempotent Cloud Agent setup for Cuebox (Next.js + Prisma/SQLite + Auth.js).
# Safe to re-run: it only creates the local dev env file when missing and then
# refreshes dependencies, the Prisma client, and the SQLite schema.

# Provision a local development .env if one is not already present.
# AUTH_SECRET is a generated dev-only secret; DATABASE_URL points at the
# repo-local SQLite file used by Prisma.
if [ ! -f .env ]; then
  echo "Creating .env for local development"
  {
    echo "AUTH_SECRET=$(openssl rand -base64 32)"
    echo 'DATABASE_URL="file:./dev.db"'
  } > .env
fi

npm install
npx prisma generate
npx prisma migrate deploy
