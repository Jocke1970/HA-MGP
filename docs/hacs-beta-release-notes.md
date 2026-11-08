# HA-MGP 2026.11.0b18 – helgschema, snabbaste varv och API-debug

**HACS beta:** `2026.11.0b18` · **Frontend:** `0.3.0-dev.40`.

## Nytt
- Helgschema öppnas som modal så det inte skjuter ned live-timingen mellan översiktskortet och timingkortet.
- Moto3, Moto2 och MotoGP grafiska/typografiska klassfilter, med förstärkta klick- och klassisoleringsregressioner.
- Förarens giltiga snabbaste varv markeras rött.
- Sessionens snabbaste **observerade** varv ligger kvar med det frysta resultatet efter målgång; ska inte ersättas av nästa pass.
- Valfri **Pulselive API debug**-sensor, avstängd som standard. Loggar förändringstidpunkter för session, status, första förarlista, första varvet och högsta observerade varv från samma godkända TV-fördröjda feed; ingen extra polling.
- Alla b17-funktioner (T−30 grid, avflaggningsfönster, spoilerskydd, säsongskalender och fem språk) behålls.

## Begränsningar
- `/event/{eventId}/entry` returnerade HTTP 400 i verifierade tester. Detta anrop är inte aktiverat i b18. Den säsongsbaserade `/riders`-katalogen är inte en bekräftad deltagarlista för en viss session.
- Sessionens snabbaste tid är den snabbaste **observerade** bland verifierade förarposter i just detta frontend-snapshot, inte ett påstående om slutligt officiellt varv.
- Diagnostikens första observation kan ske efter officiell start, särskilt efter HA-omstart. Inga tidsstämplar skapas på nytt per poll utan verklig ändring.
- En kall frontendstart utan ett föregående sessionssnapshot ger ännu inte garanterad återläsning av senaste resultatet. PB-arkivavvikelser måste följas upp under beta.

## Säkerhet, installation och rollback
Uppdatera via HACS-beta. Behåll endast JS-modulen `/motogp_sensor/ha-mgp.js`; det gamla aliaset är byte-identiskt. Omstart endast mellan pass. **Rollback:** `2026.11.0b17`. **Main oförändrad.**
