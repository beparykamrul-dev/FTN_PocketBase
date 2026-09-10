from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

def read(path):
    return (ROOT / path).read_text(encoding='utf-8')

note = read('pb_public/ftn-note-editor.js')
sw = read('pb_public/sw.js')
gitignore = read('.gitignore')
manifest = read('pb_public/manifest.webmanifest')

# Encrypted attachments must not leak the original client filename through multipart metadata.
assert "safeAttachmentName(){return 'attachment.ftnenc'}" in note
assert "form.append('attachment',await encryptAttachment(attachment,pass),safeAttachmentName())" in note
assert "form.append('attachment',attachment,attachment.name)" not in note

# The service worker must never cache PocketBase/API or admin responses.
assert "u.pathname.startsWith('/api/')" in sw
assert "u.pathname.startsWith('/_/')" in sw
assert "if(!isSameOrigin(u)||isApi(u))return;" in sw

# Plaintext note fields/passphrases must not be persisted to browser localStorage.
for forbidden in ('localStorage.setItem(\'title\'', 'localStorage.setItem(\'body\'', 'localStorage.setItem(\'pass\'', 'localStorage.setItem(\'passphrase\''):
    assert forbidden not in note

# Repository must exclude runtime data and environment secrets.
for required in ('pb_data/', '.env', '.env.*', '*.db', 'venv/'):
    assert required in gitignore

# The PWA manifest must declare the application shell and icon asset.
assert '"name": "FTN Local"' in manifest
assert '"start_url": "/"' in manifest
assert (ROOT / 'pb_public/ftn-icon.svg').exists(), 'missing PWA icon asset'

# Known PocketBase migration incompatibility must not return.
for path in (ROOT / 'pb_migrations').glob('*.js'):
    text = path.read_text(encoding='utf-8')
    assert 'created DESC' not in text, f'unsupported created DESC index remains in {path.name}'

# Avoid accidental plaintext persistence in the main web shell as well.
for path in ('pb_public/index.html', 'pb_public/workspace.html', 'pb_public/note-editor.html'):
    text = read(path)
    assert not re.search(r"localStorage\.setItem\(['\"](?:title|body|pass|passphrase)['\"]", text)

print('FTN Local security checks: PASS')
