# Pilot: low-request historical circuit-source audit (dev, read-only)

**Objective:** build a historical reference from official MotoGP GP profiles first, then compare against 2027 Pulselive snapshots. No automatic promotion to "verified" in the HA frontend.

## Three deliberately scoped circuits
- **Buriram 2025**: reference [MotoGP GP profile](https://www.motogp.com/en/calendar/2025/event/thailand/3361d50e-1ba0-4d71-83a6-99f6b49daafa). Compare against 2027 Pulselive.
- **Valencia 2025**: reference [MotoGP GP profile](https://www.motogp.com/en/calendar/2025/event/valencia/c0ff87f1-5dde-439e-830d-cf9eed4e0119). The prose says 8 left turns but the official **Circuit Specs** table says 9: report the discrepancy rather than silently fixing it.
- **Red Bull Ring 2025**: reference [MotoGP GP profile](https://www.motogp.com/en/calendar/2025/event/austria/2691a49e-a593-4119-8fe4-826017d5f2dd?tab=circuit-info). Historic prose states 4.318 km/10 bends, official **Circuit Specs** 4.35 km and 8 right + 3 left. Exact chicane/variant must be separately verified.

## Modes and call budget

`python3 scripts/audit_official_circuits.py` – **offline default, zero network requests**, reads three tiny curated text extracts of the published official profiles and local 2027 snapshots; outputs JSON without mutating any registry.

`python3 scripts/audit_official_circuits.py --fetch --cache-dir .cache/ha-mgp-circuits --output /tmp/circuit-audit.json` – explicit opt-in **up to 3 HTTPS requests on the first run**, only to the listed `www.motogp.com` URLs; cache hits make future runs **zero requests**. No retries, no redirects outside official host, 2MB response limit, 12s timeout. Live HTML may be JS-hydrated or blocked; unavailable is reported, not guessed. Cache is local only. Do not run automatically/periodically until access terms are confirmed.

## Limits and verifier semantics
- The offline excerpts were reviewed against official pages during development; they are **test inputs**, not archived official PDF files or proof that the script successfully fetched them directly.
- `Circuit Specs` labelled fields alone are parsed; site descriptions, racedistances and 2027 API values do not fill missing historic fields.
- Official site displays 2-decimal km lengths. Comparison tolerates rounding at up to 5m, while exact metre, width, straight and bend fields must agree.
- Matching historical values does **not** certify current GP layout nor an SVG: `full_green_status_allowed=false`.
- This pilot performs **zero Home Assistant API calls**. It does not change coordinator, frontend, displayed status, beta or main.
- Full official `CircuitInformation.pdf` access and actual PDF extraction are **not yet confirmed**. PDF support is not claimed here.
- Next: test controlled live access, look for stable official document links, separately verify event-specific layout mapping, then build a reference archive with hashes and a refresh-on-change strategy.
