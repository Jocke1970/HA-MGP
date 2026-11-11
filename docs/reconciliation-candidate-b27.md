# Reconciliation candidate: b27 → dev (no released UI changes)

This branch incorporates **both real Git histories** (first parent current dev, second parent current beta b27 + the safeguard commit), with explicit beta-only files, not an empty or ours-only ancestry trick.

## Deliberate merge choices

- **Keep dev runtime code and compiled dev UI as-is.** The dev JS is `08026d0cbb0162f779ebf410d4a17317d6a2ff3b` and the published b27 JS is `c4dccf1b2a5fd53bbd4c6cd8acb528ea8a65ea8f`; they must NOT be confused.
- **Bring forward beta-only release packaging, b27 lineage gate and its audit**, plus `tests/test_local_imports.py` and `hacs.json` already ported to dev, byte-identical.
- **Keep dev's backend next-GP transition and verification dots.** No attempt to reactivate the unsupported participant-list endpoint.
- The old b27 candidate workflow is **manual-only** on the reconciled dev line. It retains historical b27 assertions but must not run automatically for b28, nor publish anything. The b27 beta copy remains unchanged.
- The beta packaging workflow retains b27-specific assertions and auto-release logic; its trigger is limited to the beta branch. **Before b28, it MUST be deliberately updated to b28 and reviewed**.
- Add dev-targeted PR checks for the existing frontend and Next integration. These run read-only against PR code.
- Do not put this candidate into beta. **Merge into dev only after PR CI checks succeed**. Main stays unchanged.

## Explicit limitations

This candidate verifies code lineage and dev CI; it does not visually accept the new UI. A b28 prerelease still requires review of the circuit popup, calendar layout, mobile, finish settling, weekend status dots and HACS packaged assets against working b27.

Published b27 tag, its JS, manifest, and existing installation are untouched.
