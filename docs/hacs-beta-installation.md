# MotoGP Sensor – HACS beta 2026.11.0b4

Denna beta innehåller Next **0.3.0-dev.11**, en förbättrad VM-leaderboard för MotoGP, Moto2 och Moto3. Inget nytt frontendkort behöver registreras.

1. Säkerhetskopiera HA och behåll `/config/motogp_data/` samt befintliga MotoGP-entiteter.
2. Installera **2026.11.0b4** via HACS/Marketplace.
3. Starta om **efter** pågående MotoGP-session, så att arkiveringen inte avbryts.
4. Behåll din befintliga Next-resurs av typen JavaScript module:
   ```text
   /motogp_sensor/ha-motogp-next.js
   ```
   Skapa ingen dubblett och använd inga `?v=`-parametrar.
5. Ladda om dashboarden med Ctrl+Shift+R. Välj Moto3, Moto2 och MotoGP under VM-ställningen. Verifiera tydligare topp tre, förarnummer, team, poäng, relativa poängbarer och poängavstånd. Prova också mobilens kompakta layout.

**Rollback:** installera föregående beta **2026.11.0b3**, starta om vid lämpligt tillfälle och ladda om browsern. `main` förblir orörd.

Den valda MGP-ikonen ingår ännu inte; den följer med en senare release.
