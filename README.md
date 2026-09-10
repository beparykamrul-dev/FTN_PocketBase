# FTN Local

FTN Local is the web-first local workspace for Family Time Network. It combines PocketBase, a small authenticated FastAPI/Pydantic service, browser-side Web Crypto, secure notes, and optional Hugging Face inference.

## Current modules

- FTN Local Dashboard
- Cyber Security: Encoder / Decoder, AES-GCM text packages, SHA-256, `.ftnenc` file encryption
- Secure Notes with browser-side AES-GCM and protected attachments
- Notes & File Browser UX extension with search styling, item inspector and breadcrumbs
- AI Core with authenticated local API and optional server-side Hugging Face proxy
- Network module foundation for DNS, devices and monitoring integrations
- PocketBase Admin integration, systemd deployment and Caddy reverse-proxy example
- PWA shell assets and offline static-cache service worker

## Workspace data model

Migration `003_ftn_workspace.js` adds an owner-scoped `file_folders` collection for the folder/tree phase and extends security-event metadata fields. Existing note/file data is not deleted by this migration.

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

```bash
curl -fsSL https://raw.githubusercontent.com/beparykamrul-dev/FTN_PocketBase/main/FTN_PocketBase.sh -o /tmp/FTN_PocketBase.sh
sudo bash /tmp/FTN_PocketBase.sh
```

The installer is idempotent and preserves `pb_data` during application updates.

## Security

FTN Local uses Web Crypto AES-GCM with random salts and IVs plus PBKDF2-SHA-256 key derivation. Passphrases are not stored by the application. Provider credentials remain server-side. Runtime `pb_data/` is ignored by Git and application telemetry is not exported.

See `docs/FTN_LOCAL_SECURITY.md`, `docs/FTN_LOCAL_FILE_FORMAT.md`, and `docs/FTN_LOCAL_RELEASE.md` for the explicit security and feature boundaries.

## Reverse proxy

Use `deploy/Caddyfile.example` when FTN already has Caddy. Keep PocketBase on `127.0.0.1:8090` and FastAPI on `127.0.0.1:8000`. Use `deploy/security-headers.example` as a header baseline.

## Validation

GitHub Actions validates Python compilation, shell syntax, frontend JavaScript syntax, and PocketBase migration execution against a clean SQLite database.
