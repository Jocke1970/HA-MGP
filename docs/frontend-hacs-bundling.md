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
    ha-motogp-next.js     # Aktiv HA-MGP UI-modul; historiskt filnamn
    ha-motogp-card.js     # Äldre valfritt kort – ladda inte parallellt
```

Home Assistant serverar den aktiva resursen på `/motogp_sensor/ha-motogp-next.js`. Registrera den som **JavaScript module**, exakt en gång i dashboardens resurser. Byt inte URL eller korttaggar bara för att projektet nu heter HA-MGP.

## Uppdatering och rollback

1. Välj en **publicerad beta** i HACS; aldrig `dev`.
2. Ta backup, undvik omstart under pågående pass och bevara `/config/motogp_data/`.
3. Starta om HA efter uppdatering och ladda sedan om webbläsaren med `Ctrl+Shift+R`.
4. Kontrollera den faktiska UI-versionen under `ⓘ UI-information`.
5. Vid problem: återgå till tidigare betaversion. Radera inte integrationen eller sessionsarkivet.

Den byggda JS-filen i `dist/` och HACS-kopian ska vara byte-identiska, kontrollerat av byggskript och CI. Namnet `next` är bakåtkompatibelt tekniskt arv, inte produktnamnet. Se [versionsguiden](frontend-versioning.md).
