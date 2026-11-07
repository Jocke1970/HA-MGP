# Installera MotoGP HACS beta 2026.11.0b3

**Uppdatera och starta om först efter pågående sprint/livesession.** MotoGP-integrationens ägande via HACS/Marketplace och `motogp_sensor`-konfiguration ska behållas.

1. Ta en HA-backup; behåll `/config/motogp_data/` och nuvarande `/config/www`-filer.
2. Installera **2026.11.0b3** som prerelease för MotoGP Sensor i HACS/Marketplace.
3. Starta om Home Assistant efter passet och verifiera att integrationen laddats utan fel.
4. Om Next redan är registrerad under **`/motogp_sensor/ha-motogp-next.js`**: behåll den. Annars **redigera** den befintliga resursen (JavaScript module); lägg aldrig till en dubblett.
5. **Inga `?v=`-parametrar.** Gör Ctrl+Shift+R i webbläsaren.
6. Verifiera version **0.3.0-dev.10**, VM-tabeller för MotoGP, Moto2 och Moto3 med förarnummer, förarnamn, team, färgmarkering när källan innehåller verifierad färg, och poäng. Kontrollera att livetiming, mobilvisning och förarpopupen fortfarande fungerar.

**Återställning:** installera `2026.11.0b2` från tidigare HACS prerelease och starta om när ingen session pågår. Radera inte integrationens konfigurationspost eller något arkiv.

**Ikon:** den tidigare valda MGP-ikonen planeras för en senare uppdatering och ingår **inte** i b3.
