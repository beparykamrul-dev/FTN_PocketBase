# FTN Local Workspace Actions

The advanced workspace exposes folder operations through the authenticated PocketBase REST API.

## Supported actions

- Create a child folder from the selected folder.
- Rename the selected owner-scoped folder.
- Delete the selected owner-scoped folder.
- Rebuild the tree after each mutation.
- Record bounded workspace audit events.

The root node is virtual and cannot be renamed or deleted.

## Security boundary

Folder names and hierarchy metadata are not encrypted because they are workspace metadata. Authentication and PocketBase owner rules remain authoritative. Audit events must not include passphrases, plaintext note bodies, decrypted files, or provider credentials.
