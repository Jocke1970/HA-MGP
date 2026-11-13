# HA-MGP 2026.11.0b32 – GP-namn och större klickyta för banpopup

**HACS beta:** `2026.11.0b32` · **Frontend:** `0.3.0-dev.68`

## Ändrat sedan b31
- GP-rubrik använder i första hand ett fullständigt eventnamn. Koder som `VAL` och `POR` ersätts med `Valencia GP` respektive `Portugal GP` där bana matchar; andra kortkoder får ett neutralt lands-/GP-namn.
- Både kalenderns och aktuellt GP:s popup har en **hel klickbar banbildsyta**, inte enbart SVG-banan.
- Bakgrundsklick kräver en faktisk position **utanför popupens** synliga rektangel. Tomma utrymmen **inne** i popupen får inte stänga den.
- `Esc` fortsätter stänga. Faktarutor, resultat, källänkar och popupens scrollning ska fungera som tidigare.
- Inga nya backend/API-anrop eller automatiska banverifieringar. Officiell baninsamlare är oförändrad read-only-pilot.

## Okulärbesiktning innan main
Installera b32 **via HACS beta**, starta om Home Assistant mellan sessioner och gör hård omladdning. Granska Valencia/Portugal och ett GP med fullständigt källnamn. Testa klick på banstreck **och tom yta inom bilden**, samt klick utanför, Esc och klick i faktarutor. Kontrollera båda popupvarianterna på dator och mobil.

**Rollback:** `2026.11.0b31`. Behåll `/config/motogp_data/` och samtliga entiteter. **Main lämnas orörd** tills senare separat beslut.
