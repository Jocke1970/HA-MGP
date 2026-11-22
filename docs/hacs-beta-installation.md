# HA-MGP b46 – HACS beta / verifiering

1. Installera **`2026.11.0b46`** via HACS beta och starta om Home Assistant. Gör sedan `Ctrl+Shift+R`.
2. Verifiera backend **`2026.11.0b46`** och frontend **`0.3.0-dev.89`** i UI.
3. Kontrollera att rekordrutorna visar **rekordtyp, tid, förare och årtal** direkt. För absolut varvrekord och bästa racevarv används API:s data; pole får förare från P1 och helgens årtal.
4. Under pågående helg ska ett nytt verifierat varv visas som preliminärt rekord när en känd publicerad rekordtid slås.
5. Vid nytt racedels-ID `RAC2`: visa **Race · Omstart** och nytt delpass varvantal; TV-delay, No Spoiler och klassisolering ska gälla.
6. **Rollback b45** om något är fel. `main` orörd.
