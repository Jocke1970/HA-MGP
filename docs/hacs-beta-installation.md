# Installera HA-MGP beta 2026.11.0b28

1. Ta en Home Assistant-backup och säkerställ att `/config/motogp_data/` bevaras.
2. Uppdatera till prerelease `2026.11.0b28` i HACS (när den finns). Installera **inte dev**.
3. Starta om Home Assistant **mellan racepass**, inte under pågående tävling.
4. Behåll endast **en** Lovelace JavaScript-modul: `/motogp_sensor/ha-mgp.js`. Ladda om sidan med `Ctrl+Shift+R`.
5. Bekräfta UI-version `0.3.0-dev.62` och testa kalenderns GP-kort, stor banpopup och mobil-stängknapp, helgschema, klassfilter, livetiming, spoilerläge och de nya Schema/Bana/Startlista-pluttarna.
6. Om något ser fel ut: återgå till `2026.11.0b27`, installera om via HACS och starta om mellan sessioner. Ändra inte eller radera entiteter och sessionsarkiv.

Mer: [release notes](hacs-beta-release-notes.md). `main` är orörd.
