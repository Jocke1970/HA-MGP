# HA-MGP circuit registry (dev only)

This directory is an **initial offline reference dataset**, not yet consumed by the Home Assistant frontend or backend. Changes here do not affect the installed UI.

- `index.json` enumerates the 22 circuits shown in the user-provided Sporting Maps screenshots (captured 2026-11-11).
- Each circuit has `facts.json`: identity, name aliases and basic venue facts. Missing measurements use JSON `null`.
- Each circuit has `season_2026.json`: race date, round, 2026 laps and reported race distance (not permanent circuit attributes).
- Each circuit has `records.json`: **unfilled placeholders** for MotoGP qualifying and race lap records, pending independent verification.
- Values are transcribed from screenshots, **not** represented as MotoGP-verified. Both a source name/URL and capture date are retained. The screenshot images themselves are **not redistributed**.
- `length_m` may be rounded by the website. Never calculate total race distance by multiplying the rounded length by laps, or silently substitute race distance to infer a more precise length.
- `layout_variant: null` means the exact variant is not independently confirmed; especially check Red Bull Ring, Goiânia and Balaton Park against current MotoGP course definitions.
- Sporting Maps drawings are **not included**: rights/attribution must be resolved separately. The image for Le Mans was absent on the source site.
- Circuit IDs are local stable keys, **not Pulselive UUIDs**. Matching events to these IDs must be deliberate and tested, never based on an unvalidated fuzzy guess.
- Before runtime integration, validate per-file schemas, years/IDs, matching aliases and track variants; then add the loader/UI with fallback to existing `CIRCUIT_FACTS` data. Do not delete the current registry until verified parity.

## Suggested next steps

1. Check 2026 dates, race distances and layouts against primary sources.
2. Add verified width, straight length, left/right turns and record holder with separate source provenance.
3. Build a tested read-only registry loader and package the JSON data in the installed integration.
4. Enable UI consumption only after a dev visual test and full CI.

Dev → beta → main; no automatic sync or scraper is implemented here.
