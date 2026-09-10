# FTN Local

FTN Local is the web-first local workspace for Family Time Network. It combines PocketBase, a small authenticated FastAPI/Pydantic service, browser-side Web Crypto, secure notes, and optional Hugging Face inference.

## Current modules

- FTN Local Dashboard
- Cyber Security
  - Encoder / Decoder
  - AES-GCM text packages
  - SHA-256 hashing/checksum
  - File encrypt/decrypt with `.ftnenc`
- Secure Notes
  - Client-side AES-GCM
  - Protected PocketBase attachments
  - Independent salt/IV for note title and file payload
- AI Core
  - Pydantic validation service
  - Authenticated local AI API
  - Optional server-side Hugging Face proxy
- Network module foundation for DNS, devices and monitoring integrations
- PocketBase Admin integration
- systemd deployment
- Caddy reverse-proxy example
- CI checks for shell, Python, frontend JavaScript and PocketBase migrations

## Architecture

```text
FTN Local Web
     |
     +--> PocketBase :8090 --> SQLite / pb_data
     |
     +--> /ai/* -------> FastAPI :8000
                              |
                              +--> local PocketBase auth
                              +--> optional Hugging Face
```

The AI API is not an open unauthenticated endpoint. The browser sends the current FTN user session token and the local AI service validates it against PocketBase.

## Deploy

On a fresh Ubuntu/Debian host:

```bash
curl -fsSL https://raw.githubusercontent.com/beparykamrul-dev/FTN_PocketBase/main/FTN_PocketBase.sh -o /tmp/FTN_PocketBase.sh
sudo bash /tmp/FTN_PocketBase.sh
```

The installer is idempotent: it can update the application code without deleting `pb_data`. It also installs the versioned migrations and restarts the services after an update.

After startup, create the first PocketBase superuser at `/_/`, then create an FTN Local user from the web console.

## Reverse proxy

Use `deploy/Caddyfile.example` as the starting point when FTN already has Caddy. Keep PocketBase on `127.0.0.1:8090` and FastAPI on `127.0.0.1:8000`.

PocketBase's admin dashboard should be restricted by the existing FTN access-control layer rather than exposed openly.

## Hugging Face

Optional. Put the provider token only on the server:

```text
HF_TOKEN=...
AI_PORT=8000
PB_URL=http://127.0.0.1:8090
```

Then restart the AI service:

```bash
sudo systemctl restart ftn-ai
```

The token is never embedded in the frontend or committed to Git.

## Security model

The legacy project used Base64 with a static salt and described it as encryption. That was not cryptographic protection. FTN Local now uses Web Crypto AES-GCM with random salts and IVs plus PBKDF2-SHA-256 key derivation. Passphrases are not stored by the application.

File encryption stores its own salt and IV so file payloads do not depend on the note-title encryption parameters. Existing notes without `file_salt` remain readable through the compatibility fallback when possible.

## Data and privacy

Runtime data lives in `pb_data/` and is ignored by Git. No application telemetry is exported by the project. Provider integrations are optional and are isolated behind the local service.

## Validation

GitHub Actions validates:

- Python compilation
- shell syntax
- frontend JavaScript syntax
- PocketBase migration execution against a clean SQLite database
