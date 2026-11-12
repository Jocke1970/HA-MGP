# HA-MGP 2026.11.0b30 – banpopupens placering och större GP-bana

**HACS-beta:** `2026.11.0b30` · **UI:** `0.3.0-dev.64`.

## Nytt jämfört med b29
- Båda typerna av banpopup placeras 12 px längre ned än tidigare och har mer marginal till skärmens övre och nedre kant.
- Banillustrationen i popupen från **kommande GP-kortet** kan nu växa till samma maximala höjd som den i kalenderpopupen, 400 px.
- Den befintliga bredden, knappen **Stäng**, faktarutorna, 2026/2027-källmärkning och all baninformation behålls.
- Inga nya API-anrop, ingen ändrad livetiming eller automatisk preliminär startlista.

## Verifiering innan main
- Installera b30 via HACS beta (inte dev) och testa i Home Assistant på dator och mobil: popupens placering, att Stäng syns, vertikal skrollning, GP-kortets och kalenderns banstorlek.
- Kontrollera under **nästa racehelg** att livesessioner, klassbyten, helgschema, raceavslut, spoilerläge och uppdatering till nästa GP fungerar utan regression.
- **Main släpps först efter racehelgens praktiska test och separat godkännande.** Automatiskt månads-/48h-underhåll och eventspecifik preliminär startlista är fortfarande inte aktiverade.

**Rollback:** `2026.11.0b29` via HACS beta. Behåll `/config/motogp_data/` och dina befintliga entiteter.
