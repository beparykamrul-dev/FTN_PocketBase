# FTN Local UX

## Workspace

FTN Local is the product-facing name. PocketBase remains the internal data engine.

## Browser security

- Text and file encryption use Web Crypto AES-GCM.
- PBKDF2-SHA-256 derives keys from user passphrases.
- Passphrases are not persisted by the application.
- Protected attachments remain encrypted before upload.

## File browser

The browser UI provides search, encrypted-record listing, drag/drop upload, attachment open/decrypt, and an item inspector. Folder records are prepared by migration `003_ftn_workspace.js`.

## Streaming boundary

The current `.ftnenc` implementation buffers a complete file in browser memory. It is intentionally **not** described as true streaming encryption. A future chunked format can be added without changing the existing v1 package format.
