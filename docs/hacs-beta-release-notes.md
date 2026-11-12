# HA-MGP 2026.11.0b29 – större banlayouter och fler banfakta

**HACS beta:** `2026.11.0b29` · **Frontend:** `0.3.0-dev.63`.

## Nyheter
- **Större banillustrationer:** kalenderkortens banhöjd 73 → 106 px; kalenderpopupens banutrymme anpassas upp till 400 px. Popupens bredd och huvudlayout är oförändrade.
- **2027 – 22 preliminära tekniska banunderlag** från tidigare Pulselive-snapshots finns nu i kalenderns banpopup. Visar bara tillgängliga fält (banlängd, bredd, raksträcka, höger-/vänsterkurvor) och märker dem tydligt som *preliminära, inte oberoende verifierade*. Ingen rekordtid uppfinns.
- **2026 – 22 dokumenterade banlängder** från Sporting Maps-underlaget visas som *delvis dokumenterade, inte officiellt verifierade*. Portimão/Lusail behåller redan granskade banfakta där de finns.
- **Schema/Bana/Startlista:** gula indikatorer visas även innan backend levererat sin första verifieringsstatus för nästa GP; äldre GP-status får inte återanvändas.
- Adelaide kan visa preliminära tekniska siffror trots att verifierad banlayout fortfarande saknas.

## Oförändrat / begränsningar
- Ny API-pollning inför helger, månatlig bankontroll och 48-timmarskontroll är **inte** aktiverade.
- Preliminär deltagarlista från `/event/.../entry` är inte verifierad. Förarkatalogen används inte som startlista.
- Banritningar i kortet är schematiska eller separat installerade lokala SVG; tillgängliga banmått bevisar inte rätt layoutvariant.
- `main` påverkas inte.

## Installera och testa
Installera via **HACS beta**, aldrig dev, efter publicerad prerelease. Starta om HA mellan sessioner och ladda om webbläsaren (`Ctrl+Shift+R`). Kontrollera 2026/2027-kalender, banpopup i desktop/mobil, preliminär statusmarkering, och att livetiming, spoilerläge och helgschema fungerar som b28.

**Rollback:** `2026.11.0b28`. Bevara `/config/motogp_data/` och befintliga entiteter.
