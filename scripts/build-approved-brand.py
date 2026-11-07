#!/usr/bin/env python3
"""Build 256/512 px brand PNGs from the user-approved MGP artwork.

The checked-in WebP source is a visually preserved, quality-optimized
version of the approved 256x256 `mgp_racing_arc_icon.png` artwork.
The original 256/512 PNG files remain in the approved release ZIP;
do not substitute a different icon or guess typography.
"""
from __future__ import annotations

import hashlib
from io import BytesIO
from pathlib import Path

try:
    from PIL import Image
except ImportError as exc:
    raise SystemExit("Pillow is required: python -m pip install Pillow") from exc

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets" / "approved-mgp-racing-arc.webp"
BRAND = ROOT / "custom_components" / "motogp_sensor" / "brand"
EXPECTED_SHA256 = "05db82a11b3182c4e2525f69589d4b02279f5da8a40bef543a57916ef79c480c"


def run() -> None:
    raw = SOURCE.read_bytes()
    sha = hashlib.sha256(raw).hexdigest()
    if sha != EXPECTED_SHA256:
        raise SystemExit(f"STOP: unexpected MGP artwork SHA256 {sha}")
    with Image.open(BytesIO(raw)) as img:
        if img.format != "WEBP" or img.size != (256, 256):
            raise SystemExit("STOP: approved MGP artwork must be WebP 256x256")
        img = img.convert("RGB")
        BRAND.mkdir(parents=True, exist_ok=True)
        for name, size in (("icon.png", 256), ("icon@2x.png", 512)):
            image = img if size == 256 else img.resize((512, 512), Image.Resampling.LANCZOS)
            path = BRAND / name
            if path.is_symlink():
                raise SystemExit(f"STOP: output is a symlink: {name}")
            image.save(path, format="PNG", optimize=True)
            with Image.open(path) as proof:
                if proof.format != "PNG" or proof.size != (size, size):
                    raise SystemExit(f"STOP: malformed icon output: {name}")
            print(f"{path.relative_to(ROOT)}: {size}px, {path.stat().st_size} bytes, sha256={hashlib.sha256(path.read_bytes()).hexdigest()}")


if __name__ == "__main__":
    run()
