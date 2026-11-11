# HA-MGP: verified b27 vs dev code differences (2026-11-11)

## Preservation baseline

The **published b27** (tag `2026.11.0b27`, SHA `97aaa29d78aebe66a6965d1127fb7f220dd967dc`) remains unchanged. Its JS distributable and alias are both Git blob `c4dccf1b2a5fd53bbd4c6cd8acb528ea8a65ea8f`. Main unchanged. This audit is only about source code; it is **not** a visual Home Assistant acceptance test.

## Git and file coverage

Git histories diverged at `c24ee59e6cfe5e6504da77a41fb4a1559cc99949`. A binary/tree comparison shows **23 paths present in both branches but with different Git blob content** at the audit, plus numerous dev-only circuit datasets, scripts and docs. Most runtime Python modules are **exactly byte-identical**, including `const.py`, `helpers.py`, `calendar.py`, `broadcast_schedule.py`, weather, sessions, archive, and web assets. The essential differences are concentrated:

| Area/file | Published beta b27 | Dev | Assessment |
|---|---|---|---|
| `api.py` | no `async_get_entry_list` helper | a 13-line **unused** `/event/{uuid}/entry` method | **Do not enable** until endpoint + ID parameters validated; previous HTTP 400 |
| `coordinator.py` | existing schedule, live race advance (same base logic) | ~55 **additional** lines: next-weekend status state, schedule failure/count checks, event-scoped cache invalidation and queue static refresh | Additive; validate at real finish, ensure stale grids no longer appear |
| `sensor.py` | existing next-race attributes | one extra `next_weekend_api_status` attribute | Additive; potential entity attribute size low |
| `manifest.json` | `2026.11.0b27` | still **`2026.11.0b11`** | Release metadata stale on dev; must correct **only in release candidate**, never overwrite beta with dev manifest |
| `frontend/ha-mgp-header-track.js` | circuit modal header `mgp-weekend-dialog-head` | new explicit `mgp-circuit-dialog-head` markup/CSS, different BUILD | **VISUAL RISK**: do not replace b27 UI until screenshot/keyboard/close-button checks |
| `frontend/ha-mgp-finish-settling.js` | 2-minute hold, terminal `F` | 4-minute hold and `F`/`C` accepted | Behavioral change; test real race finish, TV delay and spoiler isolation |
| `frontend/ha-mgp-next-weekend-status.js` | absent | new Schema/Bana/Startlista colored dots | New UI; include only with verified event matching and frontend regression |
| `www/ha-mgp.js` and alias | b27 published UI, blob `c4dccf1b...` | newer JS, blob `08026d0c...` | **Not interchangeable**; preserve b27 until reviewed b28 candidate |
| `frontend/ha-mgp-calendar.js` and many other core frontend addons | same | **byte-identical** | Lower regression risk; 2027 calendar is not wholly different source code |
| `scripts/build-next-ui-preview.py` | older pins for frontend header/calendar and version | newer pins + status addon in build | Bundle assembly must stay synchronized with source hashes |
| `hacs.json`, beta packaging workflow and `tests/test_local_imports.py` | present | absent | **Packaging gap**; port and adapt before any new beta |
| Tests | b27 pins manifest/UI/build and checks event-results | dev pins stale b11, newer UI/build, lacks two beta package assertions | Review and make tests assert **same release candidate**, not legacy versions |

## Critical nuance

This is **not** a case of 743 different application features. Most dev-only files are tooling, circuit_data or documentation. Shared runtime implementation is nearly identical. The actual regression risk is **frontend modal CSS**, **finish-settling semantics** and **event transition/status indicators**, not broad unrelated backend rewrites.

The separate `MotoGP Next single-resource regression` failed on run `43105591996` because the source commit generated blob `08026d0c...` while published JS had not yet been updated by the asynchronous bundle publishing workflow. This was a CI **ordering/race**, not evidence of UI assertions failing. The next publisher commit `d7a8879` produced the exact same blob. The prepublish hash equality assertion has been removed from `.github/workflows/next-one.yml`; bundle generation, syntax and functional regression checks remain.

## Conservative route to convergence

1. **Keep the shipped b27 UI immutable** (already gated on beta).
2. Incorporate beta-only packaging validation into dev. The read-only local import test is copied without changing HA runtime. Future HACS release workflow should use beta's package-only checks **without automatically invoking prerelease publish** until a reviewed release candidate exists.
3. Build a separate candidate based on a reconciled dev state, with UI changes isolated and **visual/manual review against b27**.
4. Run the tested candidate through backend+frontend CI, source-to-distribution parity, event/season switch, spoiler/TV delay, calendar/modal behavior, and HACS packaging.
5. Only after validation merge real history with both dev and beta ancestry; do **not** use an ours-only/fake historical merge.
6. b28 release after all gates pass. No direct dev deployment; no main changes.

## Unverified

No HA browser screenshot/test on the candidate has been performed in this audit. Unused entry-list helper is not a verified participant-list API. Next weekend monthly/preflight monitor is still not fully activated. This audit does not authorize b28 publication.
