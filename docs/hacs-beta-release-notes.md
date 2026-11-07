# MotoGP Sensor 2026.11.0b10 — MGP-logga, nationsflagga och UI-information

**HACS beta:** `2026.11.0b10` · **MotoGP Next UI:** `0.3.0-dev.21`.

## Sedan b9

- Godkänd **MGP-logga** i toppkortets övre vänstra del, inbäddad som SHA256-kontrollerad WebP i den samlade JS-filen.
- **Nationsflagga** bredvid GP-rubriken för kända landvärden (t.ex. 🇶🇦 Qatar); inget gissas vid okänd landskod.
- Hopfällbar **UI-information** med frontendversion, baskortversion och tydligt separerad backendversion.
- Oförändrad vit toppkortslayout: GP-information till vänster, banväder i mitten och bana längst till höger.
- Behåller senaste/snabbaste varv, tabeller och spoilerläge.
- Experimentell knapp för arkiverade pass finns i UI men kräver backend-WS `motogp_sensor/session_history`, **som inte ingår i denna UI-fokuserade beta**. Knappen är inte verifierad i HACS-betan.
- Ingen ändring av Red Flag, pollning, TV-delay eller `main`.

## Test och installation

Installera prerelease **2026.11.0b10** från HACS beta när inget pass pågår. Starta om HA och ladda om webbläsaren med `Ctrl+Shift+R`. Behåll EN Lovelace-resurs: `/motogp_sensor/ha-motogp-next.js` (utan extra `?v=`).

Kontrollera MGP-logga, nationsflagga, `UI-information` (`0.3.0-dev.21`), väder/bana och mobilvy. Livevarvtider kan inte slutverifieras utan pågående pass.

**Rollback:** HACS `2026.11.0b9`; bevara `/config/motogp_data/`, dashboard och konfigurationspost. Schematisk banform hämtad från [GameDev-Toolkit/global-motorsport-circuits-json](https://github.com/GameDev-Toolkit/global-motorsport-circuits-json) (Apache-2.0). Projektet är oberoende av officiella MotoGP.
