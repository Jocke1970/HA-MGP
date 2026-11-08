# HA-MGP 2026.11.0b15 — fem språk och banrekord

**HACS beta:** `2026.11.0b15` · **UI:** `0.3.0-dev.30`.

## Nytt

- Fem Home Assistant-översättningar: **en**, **sv**, **es**, **it**, **fr** (konfiguration och entitetsnamn).
- Fem inbyggda UI-språkkataloger med **engelska som standard/fallback** och automatiskt språkval från Home Assistant. Samtliga ryms i samma `ha-mgp.js`, utan extra fetch eller Lovelace-resurs.
- Klassvisa banrekord (Lap record, Pole lap och Race lap) som kompakta chips **direkt under livetimingens header**. Hämtas ur befintliga `records_by_category`; inga nya API-anrop. Rekord visas bara om datan är giltig, och aldrig från en annan klass eller under spoilerskydd.
- Varken GP-toppkortets banlayout eller förarlistans layout behöver byggas om.
- Bibehållen kompatibilitetsresurs `ha-motogp-next.js`; interna korttaggar och HA-domän är oförändrade.

## Testa i HA

1. Uppdatera från **HACS-beta**, inte `dev`; starta om HA när ingen session pågår.
2. Använd exakt en JavaScript module-resurs: `/motogp_sensor/ha-mgp.js`.
3. Ladda om med `Ctrl+Shift+R`.
4. Kontrollera `0.3.0-dev.30`, UI-rubriker och rekordchips i respektive klass.
5. Byt språk i Home Assistant och kontrollera särskilt engelska, svenska, spanska, italienska och franska; även långa rubriker på mobil.

**Begränsning:** första språkversionen täcker inställningar/entitetsnamn och viktiga korttexter. Vissa dynamiska strängar och experimentella historikdialoger kan fortfarande vara på svenska; rapportera dessa för kompletteringar. Språkbytet ska inte påverka API-data, förar-/teamnamn eller entitets-ID:n.

**Rollback:** `2026.11.0b14`. Behåll `/config/motogp_data/`, konfigurationspost och dashboard.
