# Dev.66 – unified circuit dialog header and image-to-close

UI-only dev candidate, not part of published HACS beta.

- Both popup types show larger **country flag**, **circuit name** (primary), **GP name** and **date/location** (secondary). Escape all runtime text and reuse existing country mapping.
- Remove visible **Stäng** buttons from circuit popups only. Clicking the track illustration closes the modal, while backdrop and native Escape retain dismissal. Accessible button semantics and focus indication remain on map image.
- The old separate **weekend schedule** Stäng button remains unchanged.
- Result tables, facts, credits, links and unverified circuit notices stay in place; no API/cache/backend change.
- On no-layout race popup, provide a textual dismiss surface rather than trapping the user.
- Source UI modules pinned in `scripts/build-next-ui-preview.py`; bundle version `0.3.0-dev.66`.
- Do not promote to beta or main until automated checks and Home Assistant visual review.
