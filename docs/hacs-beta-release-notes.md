# HA-MGP 2026.11.0b17 — resultat mellan pass och förhandsstartgrid

**HACS beta `2026.11.0b17` · UI `0.3.0-dev.37`**

## Nytt jämfört med b16

- Senaste verifierade live-resultatet visas mellan passen tills nästa pass ligger inom 30 minuter, med manuell kollapsning.
- T−30 övergår kortet till kommande sessions startvy. För Race/Sprint används officiellt publicerad startgrid (`start_grids` från den befintliga b16-backenden), med tomma tidsfält tills klass- och sessionsmatchad live-data kommer.
- Om ingen verifierad startgrid/deltagarlista finns visas väntmeddelande utan fiktiva placeringar eller tider.
- Vid passerad schemastart får väntvyn ligga kvar kort tills verifierad livetiming anländer.
- Avflaggning ger högst två minuters efterstabilisering av korrekt samma-sessions snapshot.
- UI-status per klass, aktiv session i toppchip, nedräkningsikoner och röd färg under fem minuter.
- Bevarad visuell säsongskalender från b16 och fem UI-språk.

## Medvetna begränsningar och tester

- Pulselive `/event/{eventId}/entry` gav HTTP 400 i kontrollerade anrop; b17 använder **inte** den nya dev-backendens deltagarlista. Officiell startgrid från `/results/event/.../grid` returnerade HTTP 200 i test för Malaysias GP 2026.
- Ingen säker deltagarlista före träning/kval när ett verifierat API-svar saknas. Säsongsteam är inte liktydigt med faktisk startlista.
- Föregående resultat förutsätter ett tidigare observerat live-snapshot under kortets livslängd. Efter omstart saknas automatisk återläsning av komplett slutklassificering.
- Senaste arkiverade PB/varv kontra slutresultat måste kontrolleras under ett riktigt racepass.
- Inga ändringar av integrationsdomän, Lovelace-taggar, befintliga HA-entiteter eller `/config/motogp_data/`.

## Installation och återställning

HACS prerelease `2026.11.0b17`. Lovelace JavaScript module: `/motogp_sensor/ha-mgp.js` (endast en resurs). Hård omladdning. Starta inte om HA under pågående pass.

**Rollback:** `2026.11.0b16`. **main** förblir orörd.
