# FTN Local Workspace API

The workspace uses PocketBase REST with the authenticated FTN user token.

## Folders

- `GET /api/collections/file_folders/records?sort=path`
- `POST /api/collections/file_folders/records`
- `PATCH /api/collections/file_folders/records/:id`
- `DELETE /api/collections/file_folders/records/:id`

Folder records are owner-scoped. Clients must never substitute another user's `user` value.

## Audit

Workspace actions may be recorded in `security_events` with `category=workspace`, a bounded `action`, and JSON metadata. Metadata must not contain passphrases, plaintext note bodies, provider tokens, or decrypted file contents.

## Preview

Only allowlisted text, image, audio, and video MIME types receive an in-browser preview. Unsupported types remain download/decrypt only. Decrypted data is rendered through DOM properties rather than untrusted HTML injection.

## Encryption boundary

Existing FTN file format v1 remains unchanged. The current browser implementation buffers a file before AES-GCM encryption/decryption; this document does not claim chunked streaming support.
