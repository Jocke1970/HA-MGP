# MotoGP Sensor 2026.11.0b2 — mobilvy, varvhistorik och klassvis VM-ställning

**HACS beta / prerelease** med Next UI **0.3.0-dev.9**. Bygger på den live-testade b1-versionen. `main` är oförändrad och installation från `dev` ska inte användas.

## Nytt sedan 2026.11.0b1

- **Responsiv livetiming:** på kort under cirka 620 px visas de fyra viktigaste kolumnerna – position, förare, varv och senaste varvtid. Desktop behåller full timingtabell.
- **Tryck på en förare:** en tillgänglig popup med *observerade* varvtider, varvnummer, differens mot förarens bästa observerade tid samt uttryckliga luckor. Inga tider uppskattas eller lagras som nya HA-sensorattribut.
- **Autentiserad WebSocket-hämtning:** `motogp_sensor/rider_laps` läser enbart den aktuella TV-fördröjda sessionens arkiv. Spoilerläge och sessionsbyte spärrar läsning även när de ändras under en begäran.
- **VM-ställning:** separata officiella klassificeringar för **MotoGP, Moto2 och Moto3** från var och en av kategoriernas API-ID. En **Visa VM-ställning**-knapp i översikten gör tabellerna frivilliga; om data saknas visas det öppet, aldrig en annan klass poäng.
- **Schema:** under LIVE visas en knapp för **Visa/Dölj schema**; utan livepass ligger helgens schema kvar i normal vy.
- **Kval Q1/Q2:** kompletterande panel bredvid timing på bredare kort, nedanför på mobil. En verifierad grid visas som **Publicerad startgrid**; annars visas **Kvalordning · preliminär** utan att påstå att griden är fastställd.
- **Releasesäkerhet:** rättat ett blockerande importfel för WebSocket-kommandot och lagt in regressionstest så det inte återkommer.

## HACS-installation och UI-resurs

1. Ta en backup och bevara `/config/motogp_data/` och dina nuvarande dashboardinställningar.
2. Installera `2026.11.0b2` via HACS/Marketplace, behåll befintlig konfigurationspost och starta om Home Assistant när ett livepass inte pågår.
3. **Ingen ändring av befintlig Next-resurs behövs** om den redan är `/motogp_sensor/ha-motogp-next.js`. Annars redigera den enda befintliga JavaScript-modulresursen till exakt den URL:en.
4. **Inga `?v=`-parametrar och inga dubbla Lovelace-resurser.** Ladda om med Ctrl+Shift+R.
5. Kontrollera på mobil och desktop att UI visar `0.3.0-dev.9`, att kvalpanelen är rätt märkt, att VM-klasserna inte blandas samt att förarpopupen fungerar.
6. Vid problem: välj HACS `2026.11.0b1`, starta om HA och ladda om dashboarden. Radera inte MotoGP-konfiguration eller sessionsarkiv.

## Teststatus och begränsning

Dev-kontrollerna (frontend, Next, weekend/backend) var gröna före release. Beta-arbetsflödet kompilerar integrationskoden, testar arkiv och WebSocket, granskar HACS-paketets filintegritet, kontrollerar JS-syntax och kör popup/freshness-regression innan prerelease-taggen skapas. Verifierad CI är **inte** samma sak som installationstest i din HA.

Live-API:ets publiceringstid kan påverka om officiell grid eller klassvis VM-ställning ännu är tillgänglig; då använder vi explicita mellanlägen. Spoiler- och TV-delay-skyddet gäller oförändrat.
