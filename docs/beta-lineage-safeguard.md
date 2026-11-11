# Beta lineage safeguard — November 11, 2026

A release-history audit established that `beta` and `dev` diverge: common ancestor `c24ee59`; at the audit, `dev` was 743 commits ahead and `beta` had 95 commits absent from `dev`.

## Guard installed on beta

`scripts/verify_beta_lineage.py` runs **before** release packaging.
- Already-published `2026.11.0b27`: assert shipped UI and alias have the exact Git blob `c4dccf1b2a5fd53bbd4c6cd8acb528ea8a65ea8f`. No runtime file is modified.
- Any future beta version: assert the candidate descends from both current `dev` **and** published `beta`, and both shipped JS aliases match.
- The gate fails closed. Until dev/beta history is properly reconciled, it intentionally blocks b28 and later. Do not remove it to obtain a green CI.
- GitHub branch rulesets/branch protection require admin access and have **not** been confirmed. CI protects this packaging path, not every possible direct push/tag API.

## Non-negotiable preservation

The working b27 JS is **not replaced**, rebuilt, or copied from dev. Preserve its shipped versions and aliases. Build a b28 candidate only after a separate UI parity/diff review, and run the full HACS/visual tests. The beta branch currently has source and release-only files missing on dev; a blind merge is prohibited.

## Recovery plan

1. Inventory beta-only commits and compare runtime code, frontend bundles and release packaging, not just version strings.
2. Reconcile beta's published content into dev with a reviewed, explicit merge resolution, maintaining both parents and no force updates.
3. Require a green candidate CI, including next-one regression, and verify the b27 UI behavior in HA.
4. Candidate must be a descendant of reconciled dev and published beta. Release b28 only then.
