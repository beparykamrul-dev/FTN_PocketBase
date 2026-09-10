# FTN encrypted file format v1

A file package is JSON with:

- `format`: `FTN-FILE-AES-GCM`
- `version`: `1`
- `name`: original filename
- `type`: MIME type
- `size`: original byte length
- `salt`: base64 PBKDF2 salt
- `iv`: base64 AES-GCM IV
- `data`: base64 ciphertext

This format is stable for existing files. Future chunked/streaming storage should use a new version instead of silently changing v1 semantics.
