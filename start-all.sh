#!/usr/bin/env bash

cd /workspaces/brewchain || exit 1

echo "Starting Algorand LocalNet..."
~/.local/bin/algokit localnet start

echo "Starting API..."
cd /workspaces/brewchain/api || exit 1
nohup npm run dev > /workspaces/brewchain/api/api.log 2>&1 &

echo "Starting Gateway..."
cd /workspaces/brewchain/gateway || exit 1
nohup npm run dev > /workspaces/brewchain/gateway/gateway.log 2>&1 &

echo "Starting Frontend..."
cd /workspaces/brewchain/frontend || exit 1
nohup python3 -m http.server 8080 > /workspaces/brewchain/frontend/frontend.log 2>&1 &

echo "Waiting for services to boot..."
sleep 8

if command -v gh >/dev/null 2>&1 && [ -n "$CODESPACE_NAME" ]; then
  echo "Setting Codespaces ports to public..."
  gh codespace ports visibility 3000:public -c "$CODESPACE_NAME" || true
  gh codespace ports visibility 3001:public -c "$CODESPACE_NAME" || true
  gh codespace ports visibility 8080:public -c "$CODESPACE_NAME" || true
else
  echo "gh CLI or CODESPACE_NAME not available, so port visibility was not changed automatically."
fi

echo "All services started."
echo "API log: /workspaces/brewchain/api/api.log"
echo "Gateway log: /workspaces/brewchain/gateway/gateway.log"
echo "Frontend log: /workspaces/brewchain/frontend/frontend.log"