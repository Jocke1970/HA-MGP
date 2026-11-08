#!/usr/bin/env python3
"""Compose a preview UI onto the verified Next dev.3 single resource."""
import base64
import hashlib
import importlib.util
import json
import pathlib
import sys
import tempfile

UI_BLOB = '3d7706123b12223515010745d04b883b4c567e4f'
QUAL_BLOB = '3cd24780166dcc578624221769a8a459c7b62819'
HEADER_BLOB = '32b6030889f81a4836b357b9b04ab23438ff72de'
HISTORY_BLOB = '8b7038e64df05cb7ffbc1e6059a966c867733fac'
MOBILE_BLOB = '9fad86bfd7fdc2e461371efb458b17f6029df794'
I18N_BLOB = '3a5bd509a76c8667ade302d84b191b81d3ca8e4e'
CALENDAR_BLOB = '564bcf4010ab6c243c05bd8e0732165596530e85'
BUILD = 'next-one-20261108-07'
VERSION = '0.3.0-dev.32'


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
    addon = frontend / 'ha-mgp-ui.js'
    if not addon.is_file() or addon.is_symlink():
        raise SystemExit('STOP: UI addon missing or symlink')
    ui = addon.read_bytes()
    if blob(ui) != UI_BLOB:
        raise SystemExit('STOP: unexpected UI source revision')
    mobile = frontend / 'ha-mgp-mobile-laps.js'
    if not mobile.is_file() or mobile.is_symlink():
        raise SystemExit('STOP: missing/unsafe mobile popup addon')
    mobile_bytes = mobile.read_bytes()
    if blob(mobile_bytes) != MOBILE_BLOB:
        raise SystemExit('STOP: unexpected mobile popup source revision')
    qual = frontend / 'ha-mgp-qual-grid.js'
    if not qual.is_file() or qual.is_symlink():
        raise SystemExit('STOP: missing/unsafe qualifying grid addon')
    qual_bytes = qual.read_bytes()
    if blob(qual_bytes) != QUAL_BLOB:
        raise SystemExit('STOP: unexpected qualifying grid source revision')
    header = frontend / 'ha-mgp-header-track.js'
    if not header.is_file() or header.is_symlink():
        raise SystemExit('STOP: missing/unsafe event header track/weather addon')
    header_bytes = header.read_bytes()
    if blob(header_bytes) != HEADER_BLOB:
        raise SystemExit('STOP: unexpected event header track/weather source revision')
    history = frontend / 'ha-mgp-session-history.js'
    if not history.is_file() or history.is_symlink():
        raise SystemExit('STOP: missing/unsafe session history addon')
    history_bytes = history.read_bytes()
    if blob(history_bytes) != HISTORY_BLOB:
        raise SystemExit('STOP: unexpected session history source revision')
    # Bundle all five translations into the one HACS resource, so no locale
    # HTTP requests, stale caches or parallel Lovelace resources are required.
    languages = {}
    locales_dir = frontend / 'locales'
    for locale in ('en', 'sv', 'es', 'it', 'fr'):
        path = locales_dir / (locale + '.json')
        if not path.is_file() or path.is_symlink():
            raise SystemExit('STOP: missing/unsafe locale file ' + locale)
        item = json.loads(path.read_text(encoding='utf-8'))
        if not isinstance(item, dict) or not all(isinstance(k, str) and isinstance(v, str) for k, v in item.items()):
            raise SystemExit('STOP: invalid locale entries in ' + locale)
        languages[locale] = item
    canonical = set(languages['en'])
    if not canonical or any(set(values) != canonical for values in languages.values()):
        raise SystemExit('STOP: incomplete locale keys, English must be canonical')
    i18n_path = frontend / 'ha-mgp-i18n.js'
    if not i18n_path.is_file() or i18n_path.is_symlink():
        raise SystemExit('STOP: missing/unsafe HA-MGP i18n addon')
    i18n_bytes = i18n_path.read_bytes()
    if blob(i18n_bytes) != I18N_BLOB:
        raise SystemExit('STOP: unexpected HA-MGP i18n addon revision')
    i18n_source = i18n_bytes.decode('utf-8')
    if i18n_source.count('__MGP_UI_LOCALES_JSON__') != 1:
        raise SystemExit('STOP: unexpected locale catalog placeholder')
    i18n_source = i18n_source.replace('__MGP_UI_LOCALES_JSON__', json.dumps(languages, ensure_ascii=True, separators=(',', ':')))
    calendar_path = frontend / 'ha-mgp-calendar.js'
    if not calendar_path.is_file() or calendar_path.is_symlink():
        raise SystemExit('STOP: missing/unsafe season calendar addon')
    calendar_bytes = calendar_path.read_bytes()
    if blob(calendar_bytes) != CALENDAR_BLOB:
        raise SystemExit('STOP: unexpected season calendar source revision')
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
    result = (text + '\n;\n' + ui.decode('utf-8') + '\n;\n' + mobile_bytes.decode('utf-8') + '\n;\n' + qual_bytes.decode('utf-8') + '\n;\n' + header_source + '\n;\n' + history_bytes.decode('utf-8') + '\n;\n' + i18n_source + '\n;\n' + calendar_bytes.decode('utf-8')).encode('utf-8')
    pathlib.Path(target).write_bytes(result)
    print(f'UI preview built: {target} ({len(result)} bytes, git blob {blob(result)})')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('Usage: build-next-ui-preview.py FRONTEND OUTPUT_JS')
    main(sys.argv[1], sys.argv[2])
