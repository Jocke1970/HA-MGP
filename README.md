# HA-MGP — Home Assistant MotoGP beta

Unofficial Home Assistant integration for MotoGP, Moto2 and Moto3.

**HACS beta: `2026.11.0b24` · UI `0.3.0-dev.52`.**

## What's included

- Read-only live timing, standings, current/next session and spoilers/TV-delay protections.
- Staggered race/sprint start grid before the session when the official grid can be validated.
- Session-bound track weather reports with polling and changed-value diagnostics (not claimed as true live measurements).
- Local optional SVG circuit illustrations; schematic outlines used as fallback.
- B21 persistent Pulselive diagnostic event journal, including the final-lap and bounded finish-settling behavior.

See [beta release notes](docs/hacs-beta-release-notes.md), [HACS installation](docs/hacs-beta-installation.md), and [local circuit SVG setup](docs/local-circuit-svgs.md).

**Release workflow:** dev → candidate → beta → main. Do not install a release candidate as a published beta until CI passes.
