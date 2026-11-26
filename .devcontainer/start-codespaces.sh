#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${CODESPACE_NAME:-}" ]]; then
  echo "This launcher is intended for GitHub Codespaces."
  exit 1
fi

PORT="${PORT:-4173}"
HOST="${HOST:-0.0.0.0}"
CODESPACE_HOST="${CODESPACE_NAME}-${PORT}.app.github.dev"

export HOST PORT
export GEV_ALLOWED_HOSTS="${CODESPACE_HOST}"

echo "[1/4] Checking Node.js and npm..."
if ! command -v npm >/dev/null 2>&1 || ! node --version 2>/dev/null | grep -Eq '^v24\\.'; then
  echo "Node.js 24 is missing. Installing it automatically for this Codespace user..."
  export NVM_DIR="${HOME}/.nvm"
  mkdir -p "${NVM_DIR}"
  if [[ ! -s "${NVM_DIR}/nvm.sh" ]]; then
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  fi
  # shellcheck disable=SC1091
  source "${NVM_DIR}/nvm.sh"
  nvm install 24.22.2
  nvm alias default 24.22.2
  nvm use 24.22.2
fi

export PATH="${HOME}/.nvm/versions/node/v24.22.2/bin:${PATH}"
echo "Node: $(node --version)"
echo "npm:  $(npm --version)"

if curl -fsS "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
  echo "GOD EYE VIEW is already responding on port ${PORT}."
  exit 0
fi

echo "[2/4] Installing project dependencies (this may take several minutes)..."
npm ci

echo "[3/4] Starting GOD EYE VIEW..."
nohup npm run dev -- --host "${HOST}" --port "${PORT}" \
  > /tmp/god-eye-view-vite.log 2>&1 < /dev/null &

echo "[4/4] Waiting for the application..."
for attempt in $(seq 1 90); do
  if curl -fsS "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
    echo "GOD EYE VIEW is ready on port ${PORT}."
    echo "Open the forwarded port ${PORT} in the PORTS panel."
    echo "Private Codespaces URL: https://${CODESPACE_HOST}"
    exit 0
  fi
  sleep 2
done

echo "GOD EYE VIEW did not start. Recent log output:"
tail -n 100 /tmp/god-eye-view-vite.log || true
exit 1
