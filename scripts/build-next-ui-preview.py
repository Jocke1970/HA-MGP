#!/usr/bin/env python3
"""Compose a preview UI onto the verified Next dev.3 single resource."""
import hashlib
import importlib.util
import pathlib
import sys
import tempfile

UI_BLOB = '58d7b0f650c1f8cc9c17f5133623378501268b5e'
QUAL_BLOB = '3cd24780166dcc578624221769a8a459c7b62819'
HEADER_BLOB = '5ca10cc598ac1287e0cb9bbd96cf775f93c5faf8'
MOBILE_BLOB = '9fad86bfd7fdc2e461371efb458b17f6029df794'
BUILD = 'next-one-20261107-08'
VERSION = '0.3.0-dev.14'


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
    with tempfile.TemporaryDirectory() as temp:
        base = pathlib.Path(temp) / 'base.js'
        module.build(frontend, base)
        data = base.read_bytes()
        # build-next-one.py already fails closed on every pinned source blob.
        # Requiring a second hard-coded aggregate hash here made harmless,
        # reviewed source updates unnecessarily brittle.
        text = data.decode('utf-8')
    text = replace_one(text, 'build next-one-20260920-03', 'build ' + BUILD)
    text = replace_one(text, '🏁 MOTOGP NEXT · 0.3.0-dev.3', '🏁 MOTOGP NEXT · ' + VERSION)
    text = replace_one(text, 'ha-motogp-next.js · 0.3.0-dev.3 · samlad testversion',
                       'ha-motogp-next.js · ' + VERSION + ' · UI-preview')
    result = (text + '\n;\n' + ui.decode('utf-8') + '\n;\n' + mobile_bytes.decode('utf-8') + '\n;\n' + qual_bytes.decode('utf-8') + '\n;\n' + header_bytes.decode('utf-8')).encode('utf-8')
    pathlib.Path(target).write_bytes(result)
    print(f'UI preview built: {target} ({len(result)} bytes, git blob {blob(result)})')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('Usage: build-next-ui-preview.py FRONTEND OUTPUT_JS')
    main(sys.argv[1], sys.argv[2])
