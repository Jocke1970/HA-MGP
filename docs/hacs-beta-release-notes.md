# MotoGP Sensor 2026.11.0b7 — banlayout, banväder och full startgrid

**HACS beta/prerelease:** `2026.11.0b7`, Next UI **`0.3.0-dev.14`**. Publicerad beta `2026.11.0b4` är föregångaren; b5/b6 var enbart dev-kandidater.

## Nytt sedan b4

- **Toppkortet:** responsiv, schematisk banlayout tillsammans med det faktiskt rapporterade banvädret. 21 lokalt paketerade banformer, bland annat Lusail, Mandalika, Assen och Mugello; inga nätverksanrop från frontenden. Rapporterad lufttemperatur, bantemperatur, fuktighet, underlag och väderstatus visas där HA-sensorn har värden. Kortet märks **Senast rapporterat · inte livegaranti**. Det gamla separata väderkortet i översikten ersätts utan att sensorn eller dess backend ändras.
- **3–3–3-startgrid:** förskjutna positioner P1/P2/P3, P4/P5/P6 osv., med startnummer, efternamn och verifierad teamfärg. Q1-utslagna visas längst bak: **från P13 i MotoGP** och **P19 i Moto2/Moto3**. Backend läser separat verifierat Q1-resultat efter planerad Q2-start. Om Q1-data saknas visas en förklarande väntestatus – inga förare eller startplatser hittas på. Endast en fullständig och motsägelsefri publicerad grid får etiketten **Publicerad startgrid**; kvalordningen märks **preliminär**. Under Race/Sprint visas bara publicerad startgrid. Spoilerläget fortsätter dölja den.
- **Statusraden i timingkortet:** när rubriken säger **Nästa: MotoGP · Sprint** hämtas inte längre `STATUS OKÄND: Moto2 Q2` från det föregående passet. Om nästa pass är framtida och ingen livekälla är bekräftad visas neutralt **MELLAN PASSEN** (eller **SENASTE PASS · EJ LIVE** när förardata för föregående pass visas). Om starttiden passerat inväntas fortfarande matchande livekälla, utan att klockslaget tolkas som LIVE.
- Den befintliga förbättrade VM-ställningen (podium, nummer, team, verifierade färger och relativa poängbarer) från b4 är oförändrad.

## HACS-installation

1. Ta gärna backup. Bevara `/config/motogp_data/`, MotoGP-konfigurationsposten och dashboarden.
2. **Installera inte eller starta om HA mitt i ett livepass.** Välj prerelease **2026.11.0b7** i HACS/Marketplace och starta om efter ett avslutat pass.
3. Next-resursen är redan paketerad av integrationen och ska fortsatt vara en **enda** JavaScript module med exakt adress:
   ```text
   /motogp_sensor/ha-motogp-next.js
   ```
   **Inga `?v=`-parametrar eller dubbla resurser.**
4. Gör **Ctrl+Shift+R** och kontrollera Next UI **0.3.0-dev.14**, banlayout/väder, Moto2/Moto3/MotoGP-grid samt statusraden mellan pass.
5. Vid problem: installera tidigare prerelease **2026.11.0b4** via HACS, starta om efter passet och ladda om dashboarden. Radera inte några arkiv.

## Tester, källor och begränsningar

Dev-kontrollerna omfattar backend, frontend, HACS-bundle och Next-regressioner. Release-arbetsflödet kör dessutom **samma UI-tester direkt mot de delar som extraherats ur den paketerade HACS-JavaScriptfilen**, inklusive ett test som återskapar Qatar-situationen Moto2 Q2 → MotoGP Sprint. Ett grönt CI-resultat ersätter inte verklig testning i din HA-miljö.

Bangeometrierna är förenklade från det Apache-2.0-licensierade projektet [GameDev-Toolkit/global-motorsport-circuits-json](https://github.com/GameDev-Toolkit/global-motorsport-circuits-json). Se `docs/track-layout-attribution.md` och den bevarade licensen. Ritningarna är schematiska och saknar officiella start-/mål- och sektormarkeringar. Om en bana eller väderdata saknas visas en neutral fallback, aldrig en gissad banform eller temperatur.

Den tidigare godkända MGP-ikonen är fortfarande förberedd separat och **ingår inte i b7**. `main` är orörd.
