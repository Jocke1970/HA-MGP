# HA-MGP b42 – HACS beta / okulärbesiktning

1. Installera **`2026.11.0b42`** via HACS beta, starta om Home Assistant och gör `Ctrl+Shift+R`.
2. Kontrollera backend **`2026.11.0b42`** och frontend **`0.3.0-dev.81`**.
3. T−30 till start: endast **en** tredelad startgrid, i timingkortet. Ingen andra grid ska dyka upp vid T−15.
4. Verifiera pole position, flaggor, teamfärger, startnummer och att inga okända nummer gissas.
5. Under livetiming: öppna TV-delay. Reglaget ska visa hjälparens gränser (hos dig 0–180 s), och panelen får inte täcka varvtiderna.
6. Testa exempelvis 60/120/180 s. Inget ogiltigt serviceanrop får skickas. Kontrollera att helper-state ändras och att backend faktiskt fördröjer data.
7. Bekräfta att VM-ställningens knapp och lista fortfarande fungerar.
8. Vid fel: rollback till **b41**. Ingen ny YAML eller separat Lovelace-resurs.

**Main lämnas orörd** tills godkänd liveverifiering.
