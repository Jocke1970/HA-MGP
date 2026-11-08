# Installera HA-MGP HACS-beta 2026.11.0b15

**Frontend:** `0.3.0-dev.30`. Installation via **beta**, aldrig direkt från `dev`.

1. Säkerhetskopiera, bevara `/config/motogp_data/` och din Home Assistant-konfiguration.
2. Installera beta `2026.11.0b15` från HACS och starta om HA när inget pass körs.
3. Behåll **en** Lovelace-resurs av typen JavaScript module: `/motogp_sensor/ha-mgp.js`. Den gamla `/motogp_sensor/ha-motogp-next.js` är ett kompatibilitetsalias, men ska inte läggas till som ytterligare resurs.
4. Hård omladdning (`Ctrl+Shift+R`).
5. Verifiera att UI visar `0.3.0-dev.30`, kontrollera rekordchips i livetimingheadern, klassväxling och att ingenting visas i spoilerläge. Byt HA-språk mellan svenska/engelska/spanska/italienska/franska och kontrollera UI-text.

**Rollback:** välj `2026.11.0b14` i HACS vid behov. Radera inte entiteter, integrationskonfiguration eller arkiv. Domänen förblir `motogp_sensor` och de interna Lovelace-korttyperna är oförändrade.
