# HA-MGP – frontendversioner

Frontend och Python-backend har **separata versionsnummer**.

- Senaste publicerade HACS-beta: **2026.11.0b12**
- Frontend i den betan: **0.3.0-dev.23**
- Aktuell dev med HA-MGP-namn och nya JS-filnamn: **0.3.0-dev.25** (ej släppt i HACS)

Frontend-versionen syns i kortets fot under **ⓘ UI-information**. Det är ett säkrare bevis på laddad version än en URL-query eller HACS visningsnamn. Gör hård omladdning efter uppdatering.

Det aktiva UI:t heter **HA-MGP**. Den nya huvudresursen heter `/motogp_sensor/ha-mgp.js` i dev. Den gamla `/motogp_sensor/ha-motogp-next.js` finns kvar som alias. De interna korttyperna `ha-motogp-next-overview-card` och `ha-motogp-next-timing-card` är oförändrade. Se [migreringsplanen](js-resource-migration.md).

**Installation sker endast från beta.** `dev → beta → main`. Se [installation](hacs-beta-installation.md).
