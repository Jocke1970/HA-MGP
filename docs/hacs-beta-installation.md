# HA-MGP b48 – sista racehelgens beta

1. Installera **`2026.11.0b48`** via HACS beta. Starta om Home Assistant och gör `Ctrl+Shift+R`.
2. Kontrollera **backend `2026.11.0b48`** och **frontend `0.3.0-dev.94`**.
3. **Före start:** `STARTLISTA · INFÖR START`; inga påhittade LIVE- eller förseningstillstånd. Verifiera startgridens individuella kvaltider när de finns samt alla tre rekordtyper.
4. **Under live:** pass-, klass- och sessions-ID, varvräkning, TV-delay och No Spoiler ska fungera som tidigare. `RAC2` visas som `Omstart` vid en ny racedelsession.
5. **Efter lopp:** sparade varvtider ska heta `PRELIMINÄRT RESULTAT` tills officiell slutklassificering faktiskt bekräftats; kontrollera status i helgschemat.
6. **Banväder:** gamla Results-sessionsvärden ska inte visas som aktuella när rapporten varit oförändrad över 10 minuter. Ingen ny källa ingår ännu.
7. Vid fel: rollback till **b47**. `main` lämnas orörd tills finalhelgens verifiering.
