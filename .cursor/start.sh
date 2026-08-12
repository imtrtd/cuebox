#!/usr/bin/env bash
set -euo pipefail

# Per-boot Next.js startup for Cloud Agents.
# Idempotent: if something is already serving :3000, exit successfully.
# Otherwise start the dev server in the background and wait until it responds.

PORT=3000
LOG_FILE=/tmp/cuebox-next-dev.log
PID_FILE=/tmp/cuebox-next-dev.pid
CURL_TIMEOUT_SECONDS=5

if curl --connect-timeout "${CURL_TIMEOUT_SECONDS}" --max-time "${CURL_TIMEOUT_SECONDS}" -sf "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
  echo "Next.js already listening on ${PORT}"
  exit 0
fi

# Clear a stale PID file from a previous boot when nothing is listening.
rm -f "${PID_FILE}"

echo "Starting Next.js on 0.0.0.0:${PORT}"
nohup npm run dev -- --hostname 0.0.0.0 --port "${PORT}" >"${LOG_FILE}" 2>&1 &
echo $! >"${PID_FILE}"

for _ in $(seq 1 60); do
  if curl --connect-timeout "${CURL_TIMEOUT_SECONDS}" --max-time "${CURL_TIMEOUT_SECONDS}" -sf "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
    echo "Next.js ready on ${PORT}"
    exit 0
  fi
  # Fail fast if the process exited early.
  if [ -f "${PID_FILE}" ] && ! kill -0 "$(cat "${PID_FILE}")" 2>/dev/null; then
    echo "Next.js process exited before becoming ready" >&2
    tail -n 80 "${LOG_FILE}" >&2 || true
    exit 1
  fi
  sleep 1
done

echo "Next.js failed to become ready on ${PORT}" >&2
tail -n 80 "${LOG_FILE}" >&2 || true
exit 1
