# MotoGP Sensor 2026.11.0b9 — vit toppheader och snabbaste varv per förare

**HACS beta:** `2026.11.0b9` · **MotoGP Next:** `0.3.0-dev.16`. Senast publicerade beta före denna var `2026.11.0b7`; b8 var endast en dev-kandidat.

## Ändringar sedan b7

- **Enhetligt, vitt toppkort:** Grand Prix-titel, datum och VM-knapp till vänster, **Banväder** i mitten och högerställd **Banlayout** längst till höger på desktop. Inga separata grå väder- och bankort. Mobilen får en kompakt layout i samma vita header. Bangeometrierna är fortfarande schematiska och paketerade lokalt (21 banor).
- **Livetiming – senaste och snabbaste varv på samma rad:** Varje förare får sin senaste varvtid överst med befintlig PB-/rekordfärg och sitt faktiska personbästa (`best_lap_time`) som mindre text **Snabbaste: …** under. Om bästa varv saknas visas `—`. Gäller live träning, kval, Sprint och Race i samma visningskomponent.
- **Klickbara förarrader bevarade:** Fixen hanterar de extra HTML-attributen som varv-popupen sätter på varje rad. Tidigare orsakade kombinationen att snabbaste varvet inte syntes, trots att sensordatan fanns.
- Ingen ändring i backendpollning, Red Flag-klassificering, sessionsarkiv, TV-delay eller spoilerläge. Den tidigare identifierade 30-sekunderspollningen under röd flagg kvarstår som separat utredning.

## Kontroll och installation

Testerna omfattar frontend, Next-bygget, backendregressioner samt den *färdiga HACS-JavaScriptfilen*. Ett nytt samspelstest kör den verkliga installationsordningen mellan Next UI och klickbar förarpopup, och kontrollerar senaste + snabbaste varv, PB, okända varv samt spoilerläge.

Uppdatera via HACS till **2026.11.0b9**, men **vänta tills pågående pass är slut innan omstart**. Behåll exakt en JavaScript module-resurs:

```text
/motogp_sensor/ha-motogp-next.js
```

Ingen `?v=`-parameter och ingen extra resurs. Efter HA-omstart: `Ctrl+Shift+R`, verifiera **0.3.0-dev.16**, att headern har väder till vänster om högerställd bana och att varje förare har senaste och snabbaste varv.

**Rollback:** Installera tidigare publicerad beta `2026.11.0b7` via HACS. Bevara `/config/motogp_data/`, dashboard och integrationens konfigurationspost.

Bangeometrier: förenklade från [GameDev-Toolkit/global-motorsport-circuits-json](https://github.com/GameDev-Toolkit/global-motorsport-circuits-json) (Apache-2.0); se `docs/track-layout-attribution.md` och licensfil. Tidigare godkända MGP-ikonen är fortfarande inte incheckad. `main` ändras inte.
