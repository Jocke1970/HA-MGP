# HA-MGP beta 2026.11.0b29 – installation och test

1. Gör en Home Assistant-backup. Behåll `/config/motogp_data/` och sessionsarkiven.
2. Välj HACS prerelease **`2026.11.0b29`**, när den publicerats. Installera inte från `dev`.
3. Starta om HA **mellan racepass**, aldrig mitt under aktiv livetiming.
4. Behåll en enda Lovelace JavaScript-resurs: `/motogp_sensor/ha-mgp.js`. Gör `Ctrl+Shift+R`.
5. Kontrollera **UI `0.3.0-dev.63`**. Öppna 2027-banor som Buriram, Valencia och Adelaide: preliminära mått ska visas där de finns och ej verifierade rekord ska saknas. Kontrollera även Valencia 2026, storleken på SVG, desktop/mobilpopup, Stäng, Schema/Bana/Startlista samt livetiming och spoilerläge.
6. Vid problem: återställ **`2026.11.0b28`** via HACS beta. Radera inte integrationens enheter, entiteter eller arkiv.

Se [release notes](hacs-beta-release-notes.md). `main` lämnas orörd.
