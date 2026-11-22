# HA-MGP b47 – HACS beta / verifiering

1. Installera **`2026.11.0b47`** via HACS beta, starta om Home Assistant och gör `Ctrl+Shift+R`.
2. Verifiera backend **`2026.11.0b47`** och frontend **`0.3.0-dev.91`**.
3. Öppna **Helgens schema**: en verifierad `F/C` för rätt klass/pass ska visa **✓ KLART**, även om Results API fortfarande står i `NOT-STARTED`.
4. För `RAC2` ska samma schemalagda Race visas, men ett nytt live-sessions-ID ska kunna återöppna loppet. Status från Moto3 får inte läcka till Moto2.
5. Om inga bekräftade statusar finns visas **INVÄNTAR STATUS**, inte ett antaget slutresultat. Resultsrader i Timing visar **PRELIMINÄRT RESULTAT · EJ LIVE** tills slutklassificeringen verkligen bekräftats.
6. Tidigare sessioner som blev klara innan b47 installerades kan sakna fångad Timing Gateway-finish; den befintliga femminutershämtningen kan komplettera dem om Results API uppdaterats.
7. **Rollback b46** vid problem. `main` orörd.
