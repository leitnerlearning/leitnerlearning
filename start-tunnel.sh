#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

if [[ ! -x ./cloudflared ]]; then
  echo "Downloading cloudflared..."
  curl -fsSL -o cloudflared.tgz "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-arm64.tgz"
  tar xzf cloudflared.tgz
  chmod +x cloudflared
  rm -f cloudflared.tgz
fi

if ! lsof -iTCP:8080 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Starting HTTP server on port 8080..."
  python3 -m http.server 8080 >/dev/null 2>&1 &
  sleep 1
fi

echo "Starting trusted HTTPS tunnel to http://localhost:8080"
echo "Copy the https://....trycloudflare.com URL into iPhone Safari."
./cloudflared tunnel --url http://localhost:8080 --no-autoupdate