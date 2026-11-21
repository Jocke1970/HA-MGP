# HA-MGP 2026.11.0b38 – banfakta-popup framför livekort

**HACS beta:** `2026.11.0b38` · **Frontend:** `0.3.0-dev.76`

## Fix sedan b37
- Detaljpopupen för banfakta använder nu den översta dialognivån i webbläsarens dokument, så att ett separat timingkort inte skymmer innehållet.
- Vid vanliga uppdateringar av översiktskortet återanvänds den öppna dialogen; den stängs och tas bort vid avfärd eller stängning.
- Inga ändringar i backend, API-polling, entiteter, förseningscheckpoint eller TV-delay.

## Kontroll
Öppna banfakta samtidigt som timingkortet visas under. Popup och bakgrundstoning ska ligga framför hela vyn, inklusive livekortet. Stäng via bilden eller utanför popupen, kontrollera att timingkortet syns normalt igen. Upprepa efter uppdatering och med mindre skärmbredd.

**Rollback:** `2026.11.0b37`. Behåll data och entiteter. **Main orörd.**
