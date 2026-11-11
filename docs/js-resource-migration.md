# HA-MGP – migrering av JavaScript-resurs

**Status 2026-11-07:** Namnbytet är gjort på `dev`, inte publicerat som en HACS-beta. Ingen ändring ska ännu göras i den installerade `2026.11.0b12`.

## Filnamn

- Ny samlad huvudfil: `dist/ha-mgp.js` och `custom_components/motogp_sensor/www/ha-mgp.js`.
- Ny frontendkälla: `frontend/ha-mgp-core.js`, `ha-mgp-split.js`, `ha-mgp-ui.js`, `ha-mgp-header-track.js` och övriga `ha-mgp-*.js`-moduler.
- Gammal HACS-resurs: `custom_components/motogp_sensor/www/ha-motogp-next.js` finns **kvar** som byte-identiskt alias under övergången.
- Äldre separat kort: `ha-motogp-card.js` kvar endast av kompatibilitetsskäl; källfilen har döpts om till `frontend/ha-mgp-legacy-card.js`.

## Vid kommande godkänd beta

1. Installera den nya **beta-releasen från HACS** och starta om HA efter session.
2. Kontrollera att `/motogp_sensor/ha-mgp.js` kan laddas direkt i webbläsaren.
3. Under **Inställningar → Dashboards → Resurser**, redigera den **befintliga** JavaScript module-resursen: ändra `/motogp_sensor/ha-motogp-next.js` till `/motogp_sensor/ha-mgp.js`.
4. **Lägg inte till en andra resurs!** Båda registrerar samma custom-element-ID och ska inte laddas samtidigt.
5. Hård omladdning (`Ctrl+Shift+R`). Kontrollera toppkort, schema, livetiming, VM-ställning och `ⓘ UI-information`.

Rollback: återställ den gamla resurs-URL:en och tidigare beta vid behov. **Ingen** ominstallation av integrationen, omdöpning av domän, radering av entiteter eller sessionsarkiv krävs. De interna korttyperna `ha-motogp-next-overview-card` och `ha-motogp-next-timing-card` förblir oförändrade.
