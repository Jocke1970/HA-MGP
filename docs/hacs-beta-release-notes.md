# MotoGP Sensor 2026.11.0b11 — snabbval i toppkortet

**HACS beta:** `2026.11.0b11` · **MotoGP Next UI:** `0.3.0-dev.22`.

## Ändringar sedan b10

- **Helgschema:** ny knapp i toppkortet som navigerar till befintligt helgschema.
- **Nästa pass:** kompakt chip som visar klass, sessionsnamn och nedräkning med redan befintlig 1-sekundsuppdatering. Tid hämtas ur schemasensorn; ingen påhittad starttid.
- **VM-ställning:** befintligt reglage behålls, men högerställs i samma rad som genvägen och sessionschipet.
- **UI-information:** flyttad från GP-beskrivningen till kortets befintliga fot. Endast en versionspanel visas.
- GP-flagga och MGP-logga samt väder/bana bevarade. GP-rubriken är justerad för att hålla flagga och rubrik ihop där bredden tillåter.
- Backend, Red Flag, TV-delay, arkivfunktion och `main` är oförändrade. Experimentell historik kräver separat backendstöd.

## Installation och verifiering

Välj HACS beta **2026.11.0b11**, starta om HA när inget pass pågår och gör hård omladdning (`Ctrl+Shift+R`). Behåll exakt en JavaScript module-resurs: `/motogp_sensor/ha-motogp-next.js` utan `?v=`.

Verifiera toppkortets knappar, chip och UI-information i foten. Livevarvtider kan inte slutverifieras utan pågående pass.

**Rollback:** Installera beta `2026.11.0b10` via HACS. Bevara `/config/motogp_data/`, dashboard och integrationens konfigurationspost.

Banornas schematiska konturer: [GameDev-Toolkit/global-motorsport-circuits-json](https://github.com/GameDev-Toolkit/global-motorsport-circuits-json), Apache-2.0. Projektet är fristående från officiella MotoGP.
