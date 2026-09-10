# FTN Local security contract

1. Encryption keys are derived locally from passphrases.
2. Random salt and IV values are generated per encryption operation.
3. The server receives ciphertext and encryption metadata, not plaintext passphrases.
4. AI endpoints require the active PocketBase authentication token.
5. Provider credentials belong only in server-side environment configuration.
6. `pb_data/` must never be committed.
7. Do not expose the PocketBase admin route publicly without the FTN access-control layer.
8. Do not add telemetry that exports secrets, plaintext notes, passphrases, or provider tokens.
