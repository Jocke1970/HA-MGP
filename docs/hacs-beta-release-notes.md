# HA-MGP 2026.11.0b22 — startgrid, weather diagnostics and local track SVG

**Beta:** `2026.11.0b22` · **UI:** `0.3.0-dev.51`

## Added over b21

- Race/sprint pre-session official grid in staggered 3×3 rows, subject to full roster and contiguous-position validation. A partial or unknown grid remains an entry list.
- Session-bound Results API weather report with successful poll timestamp, first/last observed change, counts, missing-data/error states, and age. **Never claims verified live weather.**
- Optional local circuit SVGs from `/config/www/ha-mgp/circuits/<id>.svg` (browser `/local/ha-mgp/circuits/<id>.svg`) with graceful schematic fallback. SVG artwork is not included in the HACS release; consult `docs/local-circuit-svgs.md`.
- Authenticated session history viewing support in backend.

## Existing behavior retained

- b21's append-only Pulselive event journal and bounded four-minute final-session refresh.
- Five locales, schedule modal, spoiler/TV-delay protection, best lap and timing indicators.

## Installation and rollback

Install/update HACS beta **between sessions**, restart Home Assistant, and refresh browser JS cache if necessary. Revert to `2026.11.0b21` if needed.

Track SVGs are optional and never gate availability of the dashboard. Review backend weather timestamps as **observation times**, not measurement timestamps.
