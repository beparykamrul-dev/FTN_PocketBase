# FTN PocketBase

FTN PocketBase is a lightweight, web-first FTN workspace built around PocketBase, a small FastAPI/Pydantic service, browser-side AES-GCM encryption, and optional Hugging Face inference.

## What is complete

- PocketBase 0.40.x deployment path
- Versioned `pb_migrations/` for `ftn_users`, `notes`, and `ai_tasks`
- Authenticated web console
- Secure Notes with client-side AES-GCM encryption
- Encrypted attachment upload/download
- Dedicated Encoder / Decoder using Web Crypto
- Pydantic validation API with health endpoint
- Optional server-side Hugging Face proxy; token is never placed in the browser
- systemd units for PocketBase and AI service
- Caddy reverse-proxy example
- No external telemetry and no secrets committed to the repository

## Architecture

```text
Browser
  |
  +--> PocketBase :8090  --> SQLite / pb_data
  |
  +--> /ai/* ------------> FastAPI :8000
                              |
                              +--> optional Hugging Face API
```

## Deploy

On a fresh Ubuntu/Debian host:

```bash
curl -fsSL https://raw.githubusercontent.com/beparykamrul-dev/FTN_PocketBase/main/FTN_PocketBase.sh -o /tmp/FTN_PocketBase.sh
sudo bash /tmp/FTN_PocketBase.sh
```

The installer does not delete or recreate an existing `pb_data` directory.

After startup, create the first PocketBase superuser at `/_/`. The committed migration is then applied automatically by PocketBase on startup.

## Reverse proxy

If FTN already uses Caddy, use `deploy/Caddyfile.example` as the starting point. Keep PocketBase bound to `127.0.0.1:8090` and the AI service bound to `127.0.0.1:8000`.

## Hugging Face

Optional only. Put the server-side token in `/etc/ftn-pocketbase/ai.env`:

```text
HF_TOKEN=...
AI_PORT=8000
```

Then:

```bash
sudo systemctl restart ftn-ai
```

The browser sends only model and prompt data to the local AI service; the token remains server-side.

## Important security notes

The old project scripts used Base64 with a static salt and called it encryption. That was not cryptographic protection. The current console uses Web Crypto AES-GCM with a random salt, random IVs, and PBKDF2 key derivation. The passphrase is not stored or transmitted.

PocketBase's superuser dashboard must not be exposed directly to the public Internet without appropriate access controls. Keep `/_/` restricted through the existing FTN reverse-proxy/security layer.

## Data

Runtime data belongs in `pb_data/` and is intentionally not committed. Migrations are committed and are the source-controlled schema definition.
