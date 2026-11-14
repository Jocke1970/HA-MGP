# HA-MGP 2026.11.0b35 – konsekvent sessionsval i timingkortet

**HACS beta:** `2026.11.0b35` · **Frontend:** `0.3.0-dev.73`

## Ändrat sedan b34
- Timingkortets kommande session, T−30 förstart och timingfönstrets synlighet kontrolleras nu mot valt GP:s start-/slutdatum och event-ID när det finns.
- Gamla pass som Moto2 FP2 får inte aktivera en falsk startlista eller fel nedräkning när Portugal GP:s Moto3 FP1 är nästa relevanta pass.
- Regressionstester jämför alla tre kodvägarnas avvisning av fel GP samt relevanta gränser kring T−30 och live.
- Toppkortets fungerande nästa-session-urval, kalendervy och popup ändras inte.

## Säkerhet
Read-only frontendändringar. Ingen backend-/API-ändring eller extra anrop. Saknas verifierbar matchande session visas ingen påhittad förstart. Samma 12-timmars tolerans före GP-start som tidigare; legitima tidiga pass måste fortfarande kontrolleras i verkliga HA-data.

## Okulärbesiktning
Installera b35 via HACS beta, starta om HA och hårdladda sidan. Säkerställ att gammal Moto2 FP2 inte dyker upp medan toppkortet anger nästa Moto3 FP1. Kontrollera timingkortets verkliga förstart/live och att popup/kalender i övrigt är oförändrade.

**Rollback:** `2026.11.0b34`. Behåll `/config/motogp_data/` och entiteter. **Main lämnas orörd.**
