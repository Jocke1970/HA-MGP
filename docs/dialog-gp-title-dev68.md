# dev.68 – readable GP titles for circuit popups

Follow-up to b31 ocular inspection and dev.67 map-click target fix.

- Prefer full event names (`event_name`, `sponsored_name`, `name`, `short_name`), ignoring short all-capital paddock codes.
- For VAL/POR, use a small, circuit-specific fallback (`Valencia GP`/`Portugal GP`). For other abbreviated events with a known country, display `<country> GP` rather than the code; otherwise `Grand Prix`. Dynamic strings are escaped.
- Regression covers VAL/POR, preferred full source name and generic country fallback.
- No backend/API or facts changes. Includes dev.67 expanded map click-area and guarded backdrop handling.
- Frontend target `0.3.0-dev.68`. Package b32 only after CI and beta PR gate green. b31 rollback; main unchanged.
