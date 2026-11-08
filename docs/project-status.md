# HA-MGP — status 8 november 2026

**Senaste bekräftade publicerade beta innan b18-gate:** `2026.11.0b17` · UI `0.3.0-dev.37`.
**b18-releasekandidat:** `2026.11.0b18` · UI `0.3.0-dev.40`.

## Innehåll i kandidat
- Helgschema öppnas i modal från toppkortets knapp i stället för mellan toppkort och separat livetiming.
- Kategorifilter med grafiska textmärken: Moto3, Moto2, MotoGP. Klickbarhet och klassisolerad filtrering omfattas av regressioner. Märkena är inte officiella logotyper.
- Förarens snabbaste giltiga varv rött. Sessionens snabbaste **observerade** varv visas även med fryst avslutat sessionssnapshot.
- Pulselive API debug: separat diagnostiksensor avstängd som standard, använder befintlig TV-delay-godkänd live-feed utan nya anrop. Attribut för status, sessions-ID, första observerade roster och varv, med betydelsefulla ändringstider och utan massdump av JSON.
- B17:s backend, T−30-grid, historik och spoilerskydd bevaras. Inget `/event/.../entry`-anrop på beta.

## Verifierat och kvar
- I GitHub Actions har 2026 års Results/Broadcast, sessions-API, live-lite, race-grid och classification svarat HTTP 200. Deltagar-`entry` gav HTTP 400 och får inte vara en produktionsförutsättning.
- `/riders` och `/teams` returnerar kataloguppgifter, inte bekräftat deltagande i ett pass.
- Nästa steg: b18 CI/release, installation endast via HACS-beta, visuellt test av modal, klassfilter och varvtider vid verklig avflaggning. Main först efter verifiering.
- [PyMotoGP](https://github.com/tejred213/PyMotoGP) beskriver historisk Analysis-PDF via `session_files.analysis.url`. Potentiell separat framtida källa för kontroll av historiskt PB/varv, men ingår **inte** i b18.

## Dev efter b18

På dev finns fortsatt API-inventering, bl.a. `/riders`/`/teams` och en experimentell `/event/.../entry`-väg som svarade HTTP 400. Dessa är uttryckligen **inte med i b18:s produktionsbackend**. Nästa steg är att kartlägga historiska Analysis-PDF:er och förbättra det officiella deltagarunderlaget före en framtida beta.
