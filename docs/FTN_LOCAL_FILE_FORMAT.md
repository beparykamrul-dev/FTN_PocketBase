# FTN encrypted file formats

## v1 — legacy whole-file format

A v1 package is JSON with:

- `format`: `FTN-FILE-AES-GCM`
- `version`: `1`
- `name`: original filename
- `type`: MIME type
- `size`: original byte length
- `salt`: base64 PBKDF2 salt
- `iv`: base64 AES-GCM IV
- `data`: base64 ciphertext

Existing v1 attachments remain decryptable.

## v2 — chunked AES-GCM format

New attachments use v2. The browser reads the source file in 1 MiB chunks instead of calling `File.arrayBuffer()` for the entire plaintext file.

Metadata:

- `format`: `FTN-FILE-AES-GCM`
- `version`: `2`
- `name`: original filename, inside the encrypted package metadata
- `type`: original MIME type
- `size`: original byte length
- `chunkSize`: 1 MiB
- `chunkCount`: expected chunk count
- `salt`: random 16-byte PBKDF2 salt
- `noncePrefix`: random 8-byte nonce prefix
- `chunks`: one base64 AES-GCM ciphertext per chunk

The AES-256 key is derived with PBKDF2-HMAC-SHA-256 using 210,000 iterations. Each chunk gets a unique 12-byte IV consisting of the 8-byte file nonce prefix plus a 32-bit big-endian chunk index. AES-GCM additional authenticated data binds the format, version, original size, chunk size and chunk index to every chunk.

This gives independent authentication for every chunk and prevents silent chunk reordering or metadata changes.

### Current storage boundary

The v2 crypto engine is chunk-oriented on the browser input side, but the current PocketBase attachment API still receives one completed encrypted package as a multipart file. Therefore this release does **not** claim true end-to-end streaming upload or unbounded large-file support. A future server-side resumable chunk-upload endpoint can remove that remaining buffering boundary without changing the cryptographic format.
