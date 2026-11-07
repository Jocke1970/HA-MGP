# Installera HA-MGP via HACS-beta

**Senaste verifierat publicerade beta: `2026.11.0b12`**, med frontend `0.3.0-dev.23`. Ett utvecklingsbygge är inte en HACS-release.

1. Ta backup; behåll `/config/motogp_data/`, dashboard och befintlig HA-konfigurationspost.
2. Välj prerelease **2026.11.0b12** i HACS för [HA-MGP](https://github.com/Jocke1970/HA-MGP). Installera **inte** från `dev`.
3. Starta om Home Assistant efter uppdateringen, men aldrig under pågående session.
4. Behåll exakt en Lovelace-resurs, typ **JavaScript module**: `/motogp_sensor/ha-motogp-next.js` (utan extra `?v=`).
5. Gör hård omladdning (`Ctrl+Shift+R`) och kontrollera UI-versionen under `ⓘ UI-information`, schemats öppna/stäng-knapp och 30-minutersgränsen för livetiming.

**Rollback:** använd tidigare känd fungerande beta och bevara data och konfigurationspost. Ta inte bort integrationen eller skapa en till med samma domän.

GitHub-repot och produktnamnet heter **HA-MGP**. Den nya resursadressen `/motogp_sensor/ha-mgp.js` introduceras i en **kommande beta**, inte i b12. Följ [migrationsguiden](js-resource-migration.md) när den betan har släppts. Domänen och korttaggarna ändras inte. Vi gör ingen automatisk omdöpning av befintliga entiteter.
