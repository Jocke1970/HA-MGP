# HA-MGP 2026.11.0b41 – API-styrd sessionsövergång och resultat

**HACS beta:** `2026.11.0b41` · **Frontend:** `0.3.0-dev.79`

## Ändrat sedan b40
- När verifierad Pulselive-status visar en pågående session kan livetimingen ta över även om kalenderns starttid ligger fel eller har flyttats. Event, klass, sessionsnamn och TV-delay kontrolleras fortsatt.
- Efter API-status `C`/`F` kan samma verifierade, fördröjningsgodkända slutklassificering återhämtas även om UI:t aldrig såg live-starten.
- En ny, obekräftad session får inte visa förare från föregående pass, och ett aktivt lopp får inte rensas av nästa kalendersession.
- API-verktygets kopiera-JSON-knapp ger återkoppling och försöker en alternativ kopieringsmetod.
- **Bevarat från b40:** komplett tredelad startgrid, markerad pole, verifierade startnummer, nationsflaggor och teamfärger. Okända startnummer gissas aldrig.
- Regressionstest för Portugals Sprint och historiska live-/gridövergångar. Ingen direkt API-pollning från frontend och inga nya HA-resurser.

## Verifiering
- Installera via HACS beta och kontrollera frontendversion samt livesession/avslut under verkligt pass.
- Kod-/pakettester måste passera på beta innan denna prerelease kan publiceras.
- **Rollback:** `2026.11.0b40`. **Main orörd.**
