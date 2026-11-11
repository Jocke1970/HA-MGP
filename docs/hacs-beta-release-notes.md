# HA-MGP 2026.11.0b28 – nästa GP, API-status och banregistret

**HACS beta:** `2026.11.0b28` · **UI:** `0.3.0-dev.62`.

## Nyheter
- Efter att sista MotoGP-racet fått bekräftad avslutningsstatus växlar nästa-GP-vyn och den **befintliga** statiska uppdateringen förbereder nästa helgs schema vid nästa uppdateringscykel. Gamla eventbundna scheman/startgrids rensas.
- Tre kompakta källstatusar för nästa GP: **Schema, Bana, Startlista** med grönt/gult/rött. Gult betyder bl.a. preliminär eller saknad verifierad källa – inte automatiskt ett API-fel. Ingen startlista gissas från `/riders` eller `/teams`.
- Banregistret får 2026/2027-underlag, Pulselive-identiteter och verifieringsanteckningar. Dessa data är för närvarande **offline referensfiler** och används **inte automatiskt** i Home Assistants runtime.
- Banpopupens rubrik och stängknapp har justerats i dev; målgångens frysta snapshot tillåter nu både `F` och `C` och upp till fyra minuters justering.

## Fortfarande inte aktivt
- Månadsvis automatisk bankontroll och 48-timmarskontrollen är **inte installerade som ett aktivt schemalagt jobb**.
- `/event/.../entry` är inte tillförlitligt verifierat och anropas **inte** automatiskt. Startlistan kan därför stå som ej tillgänglig.
- Grönt för Bana kräver faktisk layoutverifiering; API-svar ensamt räcker inte.

## Verifiering före HA-test
- Kandidatens källbundna bygg- och backendtester, HACS-packagering, identiska JS-alias och versionskontroller måste vara gröna.
- **Visuell HA-verifiering återstår efter beta:** kontrollera banpopup/stängknapp och mobil, klassfilter, helgschema, färgpluttar, raceavslut, spoilerskydd.
- Endast `beta`. **Main orörd**.

## Installation och rollback
Installera via HACS beta, **inte dev**. Behåll `/config/motogp_data/`, befintliga entiteter och en enda Lovelace-modul: `/motogp_sensor/ha-mgp.js`. Uppdatera mellan racepass och gör hård omladdning vid behov. **Rollback:** `2026.11.0b27`, med orörd och verifierad JS-bunt.
