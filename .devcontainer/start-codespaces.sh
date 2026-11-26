#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${CODESPACE_NAME:-}" ]]; then
  echo "This launcher is intended for GitHub Codespaces."
  exit 1
fi

PORT="${PORT:-4173}"
HOST="${HOST:-0.0.0.0}"
CODESPACE_HOST="${CODESPACE_NAME}-${PORT}.app.github.dev"

# Permit only this Codespace's forwarded hostname; do not open the Host
# allowlist to arbitrary domains.
export HOST PORT
export GEV_ALLOWED_HOSTS="${CODESPACE_HOST}"

if curl -fsS "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
  echo "GOD EYE VIEW is already responding on port ${PORT}."
  exit 0
fi

nohup npm run dev -- --host "${HOST}" --port "${PORT}" \
  > /tmp/god-eye-view-vite.log 2>&1 < /dev/null &

for attempt in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
    echo "GOD EYE VIEW is ready on port ${PORT}."
    echo "Open the forwarded port 4173 in the PORTS panel."
    exit 0
  fi
  sleep 2
done

echo "GOD EYE VIEW did not start. Recent log output:"
tail -n 80 /tmp/god-eye-view-vite.log || true
exit 1
