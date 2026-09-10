#!/usr/bin/env bash
set -euo pipefail
PB_URL="${PB_URL:-http://127.0.0.1:8090}"
AI_URL="${AI_URL:-http://127.0.0.1:8000}"
curl -fsS "$PB_URL/api/health" >/dev/null
curl -fsS "$AI_URL/healthz" >/dev/null
echo "FTN Local: healthy"
