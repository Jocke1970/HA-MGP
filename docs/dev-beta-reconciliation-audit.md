# HA-MGP dev ↔ beta reconciliation audit

Captured 2026-11-11, before any history reconciliation.

## Immutable verified baseline

- Published prerelease: **2026.11.0b27**, tag points to `97aaa29d78aebe66a6965d1127fb7f220dd967dc`.
- Beta shipped UI `custom_components/motogp_sensor/www/ha-mgp.js`: Git blob `c4dccf1b2a5fd53bbd4c6cd8acb528ea8a65ea8f`.
- Beta compatibility alias `www/ha-motogp-next.js`: **same** blob.
- Original beta HEAD: `97aaa29d78...`; beta was advanced by one **workflow/docs-only** commit `5f11b9a4` containing a release gate. No shipped UI, backend runtime, manifest, tag or release content changed.
- Original dev HEAD: `d7a8879e2d83d106dcfcc2c41f81a59081f805bc`. This is not based on b27.
- Merge base: `c24ee59e6cfe5e6504da77a41fb4a1559cc99949`. Original divergence was 743 commits on dev vs 95 beta-only commits.
- Beta includes **four important paths missing from dev**: `.github/workflows/b17-release-candidate.yml`, `.github/workflows/hacs-beta-package.yml`, `hacs.json`, `tests/test_local_imports.py`.
- The working beta JS and current dev JS have **different Git blobs**. Never replace b27 with dev JS during reconciliation.

## Immediate safety work

The beta packaging workflow now invokes `scripts/verify_beta_lineage.py` before testing/releasing. For existing b27 it enforces the pinned UI hash and matching alias. For any future version it requires the candidate to include both current dev and beta histories, as well as matching aliases. The b27 packaging workflow is green after this change.

**This does not yet make the Git histories converge.** It blocks b28 until the true content and history are reconciled.

GitHub admin branch-protection/rulesets could not be read due to missing connector permission. The workflow cannot prevent someone with write access from bypassing it with direct tagging; repository rules should also be configured by an administrator.

## The red Next regression is a separate CI ordering issue

Run `43105591996` at source commit `882a915f`: the build produced `08026d0cbb0162f779ebf410d4a17317d6a2ff3b`, then failed at the command comparing generated bundle against committed shipped JS. The publisher run `43105592005` subsequently succeeded, and the dev distribution was updated to that exact blob in commit `d7a8879`. No UI-level assertion failure was observed in that failed job, because it stopped before them. Re-test latest dev bundle before any beta candidate and separate source-build CI from post-publish parity checks.

## Reconciliation sequence (not yet executed)

1. Establish an explicit review matrix of beta-only runtime fixes, files and UI semantics (b24–b27).
2. On a separate candidate branch, preserve the b27 UI and release packaging while integrating **only** reviewed dev functionality; test all frontend/HA regressions. No blind tree merge and no ours-only merge that merely claims ancestry.
3. Merge the reviewed result into dev, **with genuine code parity**, retaining both histories and no force push.
4. Make b28 from the reconciled dev HEAD; the release preflight must pass.
5. Validate HACS packaging, source-bundle parity and visual QA in HA; only then publish b28 prerelease.
6. No change to main until explicitly approved.

## Status

- b27 running UI: preserved.
- Beta gate: installed, CI green.
- Real history repair: **pending verified reconciliation**.
- New b28: **not published**.
