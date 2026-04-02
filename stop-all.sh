#!/usr/bin/env bash

pkill -f "node --watch src/server.js" || true
pkill -f "python3 -m http.server 8080" || true
docker stop algokit_sandbox_algod algokit_sandbox_indexer algokit_sandbox_conduit algokit_sandbox_postgres 2>/dev/null || true

echo "Stopped API, gateway, frontend, and LocalNet."