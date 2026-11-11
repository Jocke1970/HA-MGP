# HA-MGP – HACS och frontend

HA-MGP levererar backend och UI **tillsammans** i HACS:

```text
custom_components/motogp_sensor/
  manifest.json
  api.py
  coordinator.py
  sensor.py
  web_assets.py
  www/
    ha-mgp.js             # Ny huvudresurs från kommande beta
    ha-motogp-next.js     # Gammal URL, byte-identiskt kompatibilitetsalias
    ha-motogp-card.js     # Äldre separat kort; ladda inte parallellt
```

I **publicerade b12** gäller `/motogp_sensor/ha-motogp-next.js`. I **kommande beta** kan samma UI laddas från `/motogp_sensor/ha-mgp.js`. De två filerna är byte-identiska, och **endast en** ska registreras som JavaScript module. Se [resursmigrering](js-resource-migration.md) före byte. Korttyperna ändras inte.

## Uppdatering och rollback

1. Välj en **publicerad beta** i HACS; aldrig `dev`.
2. Ta backup, undvik omstart under pågående pass och bevara `/config/motogp_data/`.
3. Starta om HA efter uppdatering och ladda sedan om webbläsaren med `Ctrl+Shift+R`.
4. Kontrollera den faktiska UI-versionen under `ⓘ UI-information`.
5. Vid problem: återgå till tidigare betaversion. Radera inte integrationen eller sessionsarkivet.

Den byggda JS-filen i `dist/` och HACS-kopian ska vara byte-identiska, kontrollerat av byggskript och CI. Källmodulerna ligger nu under `frontend/ha-mgp-*.js`. Den äldre JS-resursen ligger kvar för kompatibilitet. Se [versionsguiden](frontend-versioning.md).
