# HA-MGP 2026.11.0b23 — startup hotfix

**Beta:** `2026.11.0b23` · **UI:** `0.3.0-dev.51` (unchanged)

**Critical fix:** b22's `__init__.py` imported `session_history_ws.py`, which imported the absent `session_history_response.py`. As a result, Home Assistant could not load `motogp_sensor`. This release includes the missing module and tests the package-local import graph and session history read-only WebSocket path.

All b22 features remain: race/sprint pre-session grid, session-bound observed weather diagnostics, optional local circuit SVGs with fallback, and b21 journal/finish-settling behavior.

Upgrade to b23 via HACS beta and restart Home Assistant. If necessary, roll back to b21 (b22 cannot load on installations affected by the missing module).

