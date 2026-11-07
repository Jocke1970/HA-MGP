#!/usr/bin/env python3
"""Compose a preview UI onto the verified Next dev.3 single resource."""
import base64
import hashlib
import importlib.util
import pathlib
import sys
import tempfile

UI_BLOB = 'b40e5065cc3bc9de4c11eefd56d977849a3a428e'
QUAL_BLOB = '3cd24780166dcc578624221769a8a459c7b62819'
HEADER_BLOB = '1ec6542b62698dd4d2eec31c43b3fd15837726e9'
HISTORY_BLOB = '8b7038e64df05cb7ffbc1e6059a966c867733fac'
MOBILE_BLOB = '9fad86bfd7fdc2e461371efb458b17f6029df794'
BUILD = 'next-one-20261107-19'
VERSION = '0.3.0-dev.25'


def blob(data):
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()


def replace_one(text, original, replacement):
    if text.count(original) != 1:
        raise SystemExit('STOP: unexpected dev.3 template: ' + original[:60])
    return text.replace(original, replacement, 1)


def main(frontend, target):
    script = pathlib.Path(__file__).with_name('build-next-one.py')
    spec = importlib.util.spec_from_file_location('motogp_pinned_next', script)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    frontend = pathlib.Path(frontend)
    addon = frontend / 'ha-motogp-next-ui-preview.js'
    if not addon.is_file() or addon.is_symlink():
        raise SystemExit('STOP: UI addon missing or symlink')
    ui = addon.read_bytes()
    if blob(ui) != UI_BLOB:
        raise SystemExit('STOP: unexpected UI source revision')
    mobile = frontend / 'ha-motogp-next-mobile-laps.js'
    if not mobile.is_file() or mobile.is_symlink():
        raise SystemExit('STOP: missing/unsafe mobile popup addon')
    mobile_bytes = mobile.read_bytes()
    if blob(mobile_bytes) != MOBILE_BLOB:
        raise SystemExit('STOP: unexpected mobile popup source revision')
    qual = frontend / 'ha-motogp-next-qual-grid.js'
    if not qual.is_file() or qual.is_symlink():
        raise SystemExit('STOP: missing/unsafe qualifying grid addon')
    qual_bytes = qual.read_bytes()
    if blob(qual_bytes) != QUAL_BLOB:
        raise SystemExit('STOP: unexpected qualifying grid source revision')
    header = frontend / 'ha-motogp-next-header-track.js'
    if not header.is_file() or header.is_symlink():
        raise SystemExit('STOP: missing/unsafe event header track/weather addon')
    header_bytes = header.read_bytes()
    if blob(header_bytes) != HEADER_BLOB:
        raise SystemExit('STOP: unexpected event header track/weather source revision')
    history = frontend / 'ha-motogp-next-session-history.js'
    if not history.is_file() or history.is_symlink():
        raise SystemExit('STOP: missing/unsafe session history addon')
    history_bytes = history.read_bytes()
    if blob(history_bytes) != HISTORY_BLOB:
        raise SystemExit('STOP: unexpected session history source revision')
    with tempfile.TemporaryDirectory() as temp:
        base = pathlib.Path(temp) / 'base.js'
        module.build(frontend, base)
        data = base.read_bytes()
        # build-next-one.py already fails closed on every pinned source blob.
        # Requiring a second hard-coded aggregate hash here made harmless,
        # reviewed source updates unnecessarily brittle.
        text = data.decode('utf-8')
    text = replace_one(text, 'build next-one-20260920-03', 'build ' + BUILD)
    text = replace_one(text, '🏁 MOTOGP NEXT · 0.3.0-dev.3', '🏁 HA-MGP · ' + VERSION)
    text = replace_one(text, 'ha-motogp-next.js · 0.3.0-dev.3 · samlad testversion',
                       'HA-MGP UI · ' + VERSION + ' · UI-preview')
    # Keep the approved MGP logo self-contained in the single JS resource.
    artwork = pathlib.Path(__file__).resolve().parent.parent / 'assets' / 'approved-mgp-racing-arc.webp'
    logo_bytes = artwork.read_bytes()
    if hashlib.sha256(logo_bytes).hexdigest() != '05db82a11b3182c4e2525f69589d4b02279f5da8a40bef543a57916ef79c480c':
        raise SystemExit('STOP: unexpected approved MGP artwork')
    logo_uri = 'data:image/webp;base64,' + base64.b64encode(logo_bytes).decode('ascii')
    header_source = header_bytes.decode('utf-8')
    if header_source.count('__MGP_APPROVED_BRAND_DATA_URI__') != 1:
        raise SystemExit('STOP: missing or duplicate MGP logo placeholder')
    header_source = header_source.replace('__MGP_APPROVED_BRAND_DATA_URI__', logo_uri)
    result = (text + '\n;\n' + ui.decode('utf-8') + '\n;\n' + mobile_bytes.decode('utf-8') + '\n;\n' + qual_bytes.decode('utf-8') + '\n;\n' + header_source + '\n;\n' + history_bytes.decode('utf-8')).encode('utf-8')
    pathlib.Path(target).write_bytes(result)
    print(f'UI preview built: {target} ({len(result)} bytes, git blob {blob(result)})')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('Usage: build-next-ui-preview.py FRONTEND OUTPUT_JS')
    main(sys.argv[1], sys.argv[2])
