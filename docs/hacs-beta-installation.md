# Installera HA-MGP HACS-beta 2026.11.0b17

**Frontend:** `0.3.0-dev.37`. Uppdatera enbart genom HACS beta, inte från dev.

1. Säkerhetskopiera HA-konfigurationen och behåll `/config/motogp_data/`.
2. Välj beta `2026.11.0b17` som nu är publicerad. Starta om HA när inget racepass pågår.
3. Behåll exakt **en** JavaScript module-resurs, `/motogp_sensor/ha-mgp.js`; lägg inte till det identiska aliaset.
4. Hård omladdning med `Ctrl+Shift+R`. Kontrollera UI `0.3.0-dev.37`.
5. Verifiera: senast resultat mellan sessioner, startgrid vid T−30, läge utan entry-lista, spoilerskydd, tvåminuters efteravflaggning och mobil.
6. Resultatet mellan pass kan saknas efter omstart utan tidigare fångat live-snapshot; det är en känd begränsning, inte skäl att visa gissade tider.

**Rollback:** välj HACS-beta `2026.11.0b16`. Radera inte integrationen, entiteterna eller arkivet.
