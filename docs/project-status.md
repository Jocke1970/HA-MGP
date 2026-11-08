# HA-MGP — status 8 november 2026

**Publicerad beta före b20:** `2026.11.0b19`, UI `0.3.0-dev.40`. **Samlad b20-kandidat:** `2026.11.0b20`, UI `0.3.0-dev.43`.

b19:s beständiga diagnostik finns kvar: `/config/motogp_data/api_diagnostics/YYYY-MM-DD.jsonl`. Händelser registreras från TV-delay-godkänd befintlig live-polling utan extra anrop, inte per poll. Sensorn är inaktiverad som standard; filjournalen är oberoende.

## B20 UI
- Legacy Helgschema-panel som återkom under toppkortet vid livepass borttagen. Modalen i toppkortet är den enda schemakontrollen.
- Endast snabbaste observerade sessionsvarvet färgas rött. Övriga personbästa neutrala; PB-indikatorn består.
- Toppchippet har förbättrad fallback för aktiv session om backendstatuser kan verifieras innan exakt livetimingmatch; aldrig falskt LIVE.
- Moto3/Moto2/MotoGP:s fungerande typografiska filter kvar, riktiga grafiska klassloggor inte implementerade.

## Releasekontrakt
Bygg kandidat från beta b19, inte genom att blint merga divergerad dev. Kör CI och HACS-paketering innan publicering. Efter HACS-b20: uppdatera HA endast mellan pass, kontrollera UI-version, journal och Recorder. Rollback b19. Main orörd.

**Separat arbete:** identifiera riktiga klassloggor, förskjuten racegrid samt timing-lite startlista. Dessa ingår inte i b20.
