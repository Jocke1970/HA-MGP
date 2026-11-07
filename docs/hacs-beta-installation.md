# HACS beta 2026.11.0b2 – installation och återställning

**Behåll existerande MotoGP-integration och `motogp_sensor`-entiteter.** Installera aldrig från `dev`.

1. Säkerhetskopiera Home Assistant, `/config/motogp_data/` och befintliga Lovelace-resurser.
2. Installera förhandsversion **2026.11.0b2** av MotoGP Sensor via HACS/Marketplace.
3. Starta om HA efter avslutat pass och kontrollera att integrationen laddas utan import- eller WebSocket-fel.
4. Next-UI:t levereras automatiskt i `custom_components/motogp_sensor/www/ha-motogp-next.js`. Befintlig resurs ska vara:
   
   ```text
   /motogp_sensor/ha-motogp-next.js
   ```

   Om du redan använder den adressen: ändra ingenting under Resurser. Annars **redigera den befintliga** resursen av typen JavaScript module; lägg inte till en andra.
5. Använd **inte `?v=`**. Gör `Ctrl+Shift+R` efter att HACS har uppdaterat filen.
6. Kontrollera UI-version **0.3.0-dev.9** och följande: mobilens fyra timingkolumner, förarpopup med observerade varv, klassvis Moto2/Moto3/MotoGP-poäng, Visa/Dölj schema under LIVE, startgrid kontra preliminär kvalordning och spoilerläge.

**Rollback:** gå tillbaka till HACS beta `2026.11.0b1` och starta om HA; den rena resursadressen ändras inte. Dina JSON-arkiv och HA-konfiguration ska lämnas kvar. `main` är oförändrad.

**Känt från 2026-11-07:** b1:s freshness-indikator verifierades live. De nya b2-funktionerna behöver kontroll i verkliga HA efter installation. Fel i officiellt API (t.ex. ej publicerad grid eller saknad klassificering) ska inte döljas med uppskattade data.
