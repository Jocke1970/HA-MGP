# Next GP API status (dev)

When live timing confirms the final MotoGP RAC is finished, HA-MGP already advances `next_event`. This development change invalidates **event-scoped** schedule/grid caches and queues the **existing** static refresh on the next coordinator cycle. It does not issue any API call directly from the live finish handler. Results of the completed race remain available.

The existing `SENSOR_NEXT_RACE` attributes expose `next_weekend_api_status` keyed by `event_id`, with three independent records:

| Indicator | Green | Yellow | Red |
|---|---|---|---|
| `schedule` | Received identified, dated sessions for all returned records, no category request failures | Pending/partial schedule or missing fields | Every attempted schedule fetch failed |
| `circuit` | **Reserved** for reviewed correct track UUID | Track variant not independently reviewed | **Reserved** for confirmed incorrect or failed track data |
| `entry_list` | **Reserved** for a verified event+category entrant list | No verified entry endpoint | **Reserved** for a confirmed entrant API failure |

Color does **not** mean mere HTTP success. The entry API returned HTTP 400 in past probes, so no new request is made; do not substitute a roster or infer the grid. Broadcast fallback timetable rows without a Results session UUID remain yellow. No runtime write to `circuit_data` occurs.

**UI:** The API state is available as a sensor attribute for colored dots, but the visual dot component is not added in this commit. Multiple HA-MGP frontend entrypoints share bundled outputs and must be built/tested together. Existing beta/main stay untouched.

**Caution:** The general monthly circuit audit and 48-hour preflight still require a safe scheduling/approval adapter; only the existing event transition is integrated here.

Review the changed coordinator logic under tests before beta.
