# Next-weekend preparation — dev design

This is a **pure, offline scheduler and test suite**, not an active job or new API poller. It does **not** modify the installed Home Assistant integration.

## Event-based refresh policy

When the previous GP has **ended**, prepare the next GP: refresh the next weekend's session schedule using HA-MGP's existing Results API session data, the selected circuit and track identity, and (if the dedicated endpoint reliably supports it) an event/category-specific provisional entry list. Do not wait for the next race weekend to begin. Don't treat official classifications as a prerequisite for weekend-end detection.

- **Once per calendar month:** general circuit-registry change check.
- **After previous GP weekend:** next-GP preparation, as soon as previous event end is known and passed.
- **48 hours before next GP's first scheduled session:** one final check, **only** when the first session's timestamp is actually known.
- A missing session start means preflight is **skipped**, never inferred from the date of the GP. A postponed/cancelled session should be handled when the scheduler is integrated with actual HA statuses.
- Reuse backend's existing schedule data, combine overlapping checks into a single refresh and avoid duplicate requests. Store last-success timestamps; errors need backoff and must not cause repeated rapid requests.
- Every difference is reported as a **candidate**; stable reviewed data are never overwritten automatically.
- Circuit status and provisional participant status are separate. `is_active=false` from Pulselive isn't by itself proof of a wrong circuit.

## Provisional entry list

`/event/{event_uuid}/entry?categoryUuid=...` has previously returned **HTTP 400** in HA-MGP diagnostics. A provisional start list must only be displayed if the response has the exact event and category identity, contains validated entrant objects, and the endpoint is confirmed to work. The `/riders` and `/teams` catalogs are **not** evidence that a rider participates in the next session. Status stays `unavailable` otherwise; don't infer a final starting grid or expose spoilers.

## Implementation status

`scripts/motogp_weekend_preparation.py` contains testable scheduling decisions **without network access**.
`tests/test_weekend_preparation.py` covers weekend transitions, 48h window, monthly cadence and entry-list gating.

**Still to implement before enabling in HA:** a live adapter with persisted successful-run state, API error backoff, event/category identity joins, first-session lookup across classes, supervised update review, and a rate-limit/terms-of-use check. No GitHub Actions periodic job or live Pulselive monitoring is switched on in this change.

dev → beta → main.
