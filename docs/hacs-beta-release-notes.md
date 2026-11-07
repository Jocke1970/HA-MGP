# MotoGP Sensor 2026.11.0b4 — premium VM-ställning

**HACS-beta**, Next UI **0.3.0-dev.11**. Denna version bygger på b3, vars klasspecifika VM-ställningar, teamfärger och nummer redan fungerade i Home Assistant.

## Nytt sedan 2026.11.0b3

- VM-ställningen får en kompakt **leaderboard-design** för MotoGP, Moto2 och Moto3, med tydligare förare/team och startnummer.
- De tre första platserna får diskreta **podium-markeringar**.
- På bredare kort används det tidigare tomma utrymmet till en tunn, källbaserad poängbar i förarens verifierade teamfärg. Barens längd visar publicerade poäng i förhållande till **ledaren i den valda VM-klassen**.
- Totalt antal poäng och **poängavstånd till klassledaren** visas tydligt. Decimala poäng behandlas korrekt, exempelvis `−2,5 p`; detta är inte prognoser.
- Mobilvyn döljer poängbaren och prioriterar placering, nummer, förare, team och poäng.
- Färgmarkeringar faller tillbaka till neutralt när leverantören inte tillhandahåller en verifierad färg. Inga färger eller poäng gissas.

**Oförändrat:** backend för standings, livetiming, lagringsarkiv, spoilerläge, TV-fördröjning, mobilens timingtabell, varvpoppup, kvalgrid och helgschema. Endast Next-kortets VM-presentation samt versionsmetadata ändras.

## Installation

1. Bevara den befintliga MotoGP-integrationen och `/config/motogp_data/`; ta gärna en HA-backup.
2. Installera prerelease **2026.11.0b4** via HACS/Marketplace. Starta om efter avslutat racepass.
3. Den redan registrerade JavaScript-modulresursen ska fortsatt ha exakt adressen:
   ```text
   /motogp_sensor/ha-motogp-next.js
   ```
   Ändra inte URL:en om den redan är rätt. **Inga `?v=`-parametrar och inga dubbla resurser.**
4. Ladda om dashboarden med Ctrl+Shift+R. Kontrollera Next **0.3.0-dev.11**, alla tre VM-klasserna och mobilvisningen.

## Tester och rollback

Dev-kontrollerna för frontend, Next, weekend/backend och JS-paketering var gröna före promotion. Beta-arbetsflödet testar dessutom leaderboard-beteendet mot det **faktiskt paketerade Next-JavaScriptet**, inte bara källfilen.

Vid problem: välj HACS prerelease **2026.11.0b3**, starta om efter pågående session och ladda om webbläsaren. Radera inte MotoGP-integrationen eller sessionsarkiv.

Den tidigare valda MGP-ikonen är fortsatt planerad separat och **ingår inte** i b4; bildpaketet återstår att checka in. `main` är oförändrad.
