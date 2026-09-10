#!/usr/bin/env bash
set -euo pipefail

APP=/opt/ftn-pocketbase
PB_VERSION="${PB_VERSION:-0.40.3}"
PB_ARCH="${PB_ARCH:-amd64}"
AI_PORT="${AI_PORT:-8000}"
PB_PORT="${PB_PORT:-8090}"
REPO_URL="https://github.com/beparykamrul-dev/FTN_PocketBase.git"

log(){ printf '\n[FTN] %s\n' "$*"; }
require_root(){ [[ ${EUID} -eq 0 ]] || { echo "Run as root: sudo bash FTN_PocketBase.sh"; exit 1; }; }

require_root
log "Installing/updating FTN Local stack (PocketBase ${PB_VERSION})"
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

REPO="$APP/repo"
if [[ -d "$REPO/.git" ]]; then
  git -C "$REPO" fetch --depth=1 origin main
  git -C "$REPO" reset --hard origin/main
else
  rm -rf "$REPO"
  git clone --depth=1 "$REPO_URL" "$REPO"
fi

# Replace only application code; runtime database data is never removed.
rm -rf "$APP/pb_public" "$APP/pb_migrations" "$APP/ai_service"
cp -a "$REPO/pb_public" "$APP/pb_public"
cp -a "$REPO/pb_migrations" "$APP/pb_migrations"
cp -a "$REPO/ai_service" "$APP/ai_service"
install -m 0644 "$REPO/deploy/ftn-pocketbase.service" /etc/systemd/system/ftn-pocketbase.service
install -m 0644 "$REPO/deploy/ftn-ai.service" /etc/systemd/system/ftn-ai.service

python3 -m venv "$APP/venv"
"$APP/venv/bin/pip" install --upgrade pip
"$APP/venv/bin/pip" install -r "$APP/ai_service/requirements.txt"

if [[ ! -f /etc/ftn-pocketbase/ai.env ]]; then
  cp "$REPO/deploy/ai.env.example" /etc/ftn-pocketbase/ai.env
fi
chmod 600 /etc/ftn-pocketbase/ai.env
mkdir -p "$APP/pb_data"
chown -R ftn:ftn "$APP"
chmod 700 "$APP/pb_data"

systemctl daemon-reload
systemctl enable --now ftn-pocketbase.service
systemctl enable --now ftn-ai.service

log "Waiting for PocketBase"
ready=0
for i in {1..30}; do
  if curl -fsS "http://127.0.0.1:${PB_PORT}/api/health" >/dev/null 2>&1; then ready=1; break; fi
  sleep 1
done
[[ "$ready" == "1" ]] || { journalctl -u ftn-pocketbase.service -n 80 --no-pager; exit 1; }

log "Checking AI service"
curl -fsS -H "Authorization: Bearer installer-health-check" "http://127.0.0.1:${AI_PORT}/healthz" >/dev/null 2>&1 || {
  # 401 is expected because the AI service now requires a real FTN session.
  code=$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer installer-health-check" "http://127.0.0.1:${AI_PORT}/healthz" || true)
  [[ "$code" == "401" ]] || { journalctl -u ftn-ai.service -n 80 --no-pager; exit 1; }
}

cat <<EOF

FTN Local is installed/updated.

Web:        http://127.0.0.1:${PB_PORT}/
Admin:      http://127.0.0.1:${PB_PORT}/_/
API:        http://127.0.0.1:${PB_PORT}/api/
AI:         http://127.0.0.1:${AI_PORT}/ (session protected)
Data:       ${APP}/pb_data
Migrations: ${APP}/pb_migrations

Create the first PocketBase superuser from the Admin URL, then create an FTN user
from the web console. Existing pb_data is preserved.

Optional Hugging Face:
  edit /etc/ftn-pocketbase/ai.env, set HF_TOKEN, then restart ftn-ai.

This installer does not configure Nginx/Caddy automatically.
EOF
