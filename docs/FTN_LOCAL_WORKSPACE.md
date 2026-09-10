# FTN Local Workspace

The workspace is web-first and local-first. Notes and attachments are encrypted in the browser before persistence. Folder metadata is owner-scoped in PocketBase.

## Current boundary

- Secure notes and protected attachments
- Folder/tree data model
- Search and item inspection UI
- AES-GCM browser encryption
- PWA shell

Large-file encryption is currently whole-buffer based; this release does not claim chunked streaming encryption.

## Data flow

`Browser -> Web Crypto -> PocketBase`

The server stores ciphertext and metadata. Passphrases are not persisted by the application.

## UX components

`pb_public/ftn-ux.js` contains progressive enhancements so the core application remains functional without the extension. `pb_public/ftn-workspace.css` contains reusable workspace presentation styles.
