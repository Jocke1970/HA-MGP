# HA-MGP b35 – HACS beta / okulärbesiktning

1. Säkerhetskopiera Home Assistant. Behåll `/config/motogp_data/` och alla entiteter.
2. Installera **`2026.11.0b35`** från HACS beta efter publicerad prerelease, aldrig dev.
3. Starta om HA och gör hård omladdning (`Ctrl+Shift+R`).
4. Kontrollera att frontend visar `0.3.0-dev.73`.
5. Under väntan på Portugal: toppkortet ska fortsätta visa korrekt nästa session (t.ex. Moto3 FP1); timingkortet får inte visa en gammal Moto2 FP2 eller felaktig "STARTLISTA · INVÄNTAR LIVE".
6. Timingkortet får öppna förstartsläget först inom 30 minuter före ett **matchande GP-pass**, och får fortsätta vid fördröjd bekräftelse. Äkta live-session får visas som tidigare.
7. Kontrollera att kalenderpopup, banfakta, kvalpluppar och MotoGP/Moto2/Moto3-flikar fungerar som i b34 på dator och mobil.
8. Vid problem: rollback till **b34**, utan att ta bort data eller entiteter.

**Main lämnas orörd** tills okulärbesiktningen är godkänd.
