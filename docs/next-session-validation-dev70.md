# HA-MGP dev.70 — next-session date guard and completed GP ordering

Bug report from Home Assistant screenshots (2026-11-13):
- Countdown claimed next Moto3 FP2 in ~12 h despite the next relevant GP being later; not sufficient evidence that the session belonged to the displayed event.
- Past GP list appeared in chronological order, oldest first.

## UI-only changes
- The overview next-session chip now requires a valid **next-event start and end date** and rejects session rows outside its GP weekend (one-day time-zone tolerance at boundaries). If a session declares a different `event_id`, reject it.
- If no session in the selected event is reliably available, display `Nästa pass ej verifierat` without a countdown, rather than presenting a stale/wrong session.
- Past races in the season calendar are rendered **newest first**. R1/R2/etc remain original round numbers, other ordering is unchanged.
- Read-only frontend selection only: no backend refresh, no new API calls. Underlying data from Home Assistant still needs inspection before we can assert the actual next session.
- Regression cases include a stale Moto3 FP2 12h ahead vs an event starting two days later, and explicit newest-first assertions for the completed GP tiles.

**Scope:** dev only; target `0.3.0-dev.70`. b32 beta and main unchanged until further approval.
