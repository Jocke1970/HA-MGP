# Dev.71 – refined next-session event-boundary check

The initial 24-hour date-window grace allowed a test session roughly 16 hours before the event's start date. This was too permissive. Reduce the pre-event tolerance to 12 hours for UTC/local timezone rollover and retain the post-event tolerance. The regression must reject stale Moto3 FP2 and prefer an in-weekend next pass, or show a non-verified status if no valid session exists.

No backend/API changes. Completed races remain newest-first. b32 beta and main unchanged. Build pinned to `0.3.0-dev.71`.
