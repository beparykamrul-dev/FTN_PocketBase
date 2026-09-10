# FTN Local release checklist

- [x] FTN Local branding
- [x] Dashboard health chart box
- [x] Ecosystem glossary
- [x] Cyber Security text/file workflows
- [x] Browser-side AES-GCM
- [x] Secure Notes and protected attachments
- [x] Encrypted attachment preview/download UI
- [x] Advanced item inspector UX
- [x] PWA shell assets
- [x] Installable manifest + service-worker registration
- [x] Online/offline UI status
- [x] Versioned shell cache with stale-cache cleanup
- [x] API/auth/file endpoints excluded from service-worker cache
- [x] Folder data model migration
- [x] Server-side folder CRUD UI
- [x] Workspace search and Favorite/Archive/Attachment filters
- [x] Secure Note create/edit navigation
- [x] Security regression gate in CI
- [x] Encrypted attachment upload filename privacy
- [x] FTN encrypted file format v2 with chunked AES-GCM
- [x] FTN v1 backward-compatible attachment decryption
- [x] Security headers example
- [ ] True end-to-end streaming/resumable upload
- [ ] Time-series telemetry-backed charts

Offline mode is intentionally limited to the static FTN Local shell. Authenticated workspace data, PocketBase API responses, protected attachments, tokens, and decrypted plaintext are not cached by the service worker.

FTN file v2 reads plaintext input in 1 MiB chunks and authenticates every chunk. The current PocketBase multipart attachment API still receives one completed encrypted package, so true streaming/resumable upload remains an explicit future boundary.
