#!/usr/bin/env bash
set -euo pipefail

APP=/opt/ftn-pocketbase
PB_VERSION="${PB_VERSION:-0.40.3}"
PB_ARCH="${PB_ARCH:-amd64}"
AI_PORT="${AI_PORT:-8000}"
PB_PORT="${PB_PORT:-8090}"
REPO_URL="https://github.com/beparykamrul-dev/FTN_PocketBase.git"

log(){ printf '\n[%s] %s\n' "FTN" "$*"; }
require_root(){ [[ ${EUID} -eq 0 ]] || { echo "Run as root: sudo bash FTN_PocketBase.sh"; exit 1; }; }

require_root
log "Installing FTN PocketBase stack (PocketBase ${PB_VERSION})"
apt-get update
apt-get install -y ca-certificates curl git unzip python3 python3-venv python3-pip

id ftn >/dev/null 2>&1 || useradd --system --home "$APP" --shell /usr/sbin/nologin ftn
mkdir -p "$APP" /etc/ftn-pocketbase

if [[ ! -x "$APP/pocketbase" || "${FORCE_PB_DOWNLOAD:-0}" == "1" ]]; then
  tmp=$(mktemp -d)
  trap 'rm -rf "$tmp"' EXIT
  curl -fL "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${PB_ARCH}.zip" -o "$tmp/pb.zip"
  unzip -qo "$tmp/pb.zip" -d "$tmp/pb"
  install -m 0755 "$tmp/pb/pocketbase" "$APP/pocketbase"
fi

if [[ ! -d "$APP/.git" ]]; then
  git clone --depth=1 "$REPO_URL" "$APP/repo"
else
  git -C "$APP/repo" pull --ff-only
fi

# Sync application files without touching runtime data.
cp -a "$APP/repo/pb_public" "$APP/"
cp -a "$APP/repo/pb_migrations" "$APP/"
cp -a "$APP/repo/ai_service" "$APP/"
cp -a "$APP/repo/deploy/ftn-pocketbase.service" /etc/systemd/system/
cp -a "$APP/repo/deploy/ftn-ai.service" /etc/systemd/system/

python3 -m venv "$APP/venv"
"$APP/venv/bin/pip" install --upgrade pip
"$APP/venv/bin/pip" install -r "$APP/ai_service/requirements.txt"

if [[ ! -f /etc/ftn-pocketbase/ai.env ]]; then
  cp "$APP/repo/deploy/ai.env.example" /etc/ftn-pocketbase/ai.env
  chmod 600 /etc/ftn-pocketbase/ai.env
fi

mkdir -p "$APP/pb_data"
chown -R ftn:ftn "$APP"
chmod 700 "$APP/pb_data"

systemctl daemon-reload
systemctl enable --now ftn-pocketbase.service
systemctl enable --now ftn-ai.service

log "Waiting for health endpoints"
for i in {1..30}; do
  curl -fsS "http://127.0.0.1:${PB_PORT}/api/health" >/dev/null 2>&1 && break || sleep 1
done
curl -fsS "http://127.0.0.1:${AI_PORT}/healthz" >/dev/null

cat <<EOF

FTN PocketBase is installed.

Web:       http://127.0.0.1:${PB_PORT}/
Admin:     http://127.0.0.1:${PB_PORT}/_/
API:       http://127.0.0.1:${PB_PORT}/api/
AI:        http://127.0.0.1:${AI_PORT}/healthz
Data:      ${APP}/pb_data
Migrations:${APP}/pb_migrations

First login:
  Open the Admin URL and create the first PocketBase superuser.

Optional Hugging Face:
  edit /etc/ftn-pocketbase/ai.env, set HF_TOKEN, then:
  systemctl restart ftn-ai

This installer does not overwrite an existing pb_data directory or configure
Nginx/Caddy automatically. Put your existing reverse proxy in front of 8090
and proxy /ai/ to 127.0.0.1:8000.
EOF
