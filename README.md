# HA-MGP — HACS beta

Home Assistant-integration och frontend för **MotoGP, Moto2 och Moto3**. Ursprungligen baserad på [Liionboy/motogp_sensor](https://github.com/Liionboy/motogp_sensor); inte officiellt ansluten till MotoGP.

**HACS-beta `2026.11.0b15` · UI `0.3.0-dev.30`**.

## Nytt sedan b14

- **Fem språk:** svenska, engelska, spanska, italienska och franska, med **engelska som fallback**. Home Assistants språk avgör automatiskt språk i kortet.
- Separata HA-översättningsfiler för integrationsinställningar, sensorer och entitetsnamn.
- **Rekordchips i livetimingkortets header** för sessionens klass (MotoGP/Moto2/Moto3). De visas även när förarlistan är hopfälld, men inte i spoilerläget. Inga nya API-anrop.
- Befintliga VM-ställningar, nationsflaggor, banlayout, schema och 30-minutersstyrd timing behålls.

**Resurs:** `/motogp_sensor/ha-mgp.js` som en enda Lovelace JavaScript module. Den äldre `/motogp_sensor/ha-motogp-next.js` är ett byte-identiskt alias – registrera **aldrig båda**.

**Arbetsordning:** `dev → beta → main`. `main` är inte ändrad i denna beta.

[Installera](docs/hacs-beta-installation.md) · [Release notes](docs/hacs-beta-release-notes.md) · [Språkfiler och bidrag](docs/localization.md).

Intern integrationsdomän `motogp_sensor`, entiteter och befintliga korttaggar är oförändrade.
