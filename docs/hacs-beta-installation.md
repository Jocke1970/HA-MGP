# HA-MGP b41 – HACS beta / liveverifiering

1. Installera **`2026.11.0b41`** via HACS beta, starta om Home Assistant och gör `Ctrl+Shift+R`.
2. Kontrollera backend **`2026.11.0b41`** och frontend **`0.3.0-dev.79`**.
3. Före loppet: verifiera tredelad startgrid, P1/pole, färger, flaggor och endast säkra startnummer. Okända nummer får inte gissas.
4. Vid verklig start: rätt klass och pass ska byta till **LIVE** på API-bekräftelse, även om schematiden flyttats. Inga gamla förare eller andra klasser får visas.
5. Under passet: verifiera förändringar i varv/placeringar, TV-delay och att No Spoiler döljer data.
6. Efter passet: `C`/`F` ska ge avslutat resultat, aldrig fastna i ”Start ej bekräftad” för samma pass.
7. API-verktyg → Live timing → Kopiera JSON: kontrollera kopiering och synlig återkoppling.
8. Vid problem: rollback till **b40**. Ingen ny YAML eller extra Lovelace-resurs.

**Main lämnas orörd** till godkänd visuell/live-verifiering.
