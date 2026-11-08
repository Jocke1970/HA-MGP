# HA-MGP — HACS beta

MotoGP, Moto2 och Moto3 för Home Assistant. Inofficiell integration, utan koppling till MotoGP:s rättighetsinnehavare.

**HACS-beta `2026.11.0b17` · Frontend `0.3.0-dev.37`.**

## Nytt sedan b16

- Sessionens resultat förblir synligt mellan pass när kortet redan har ett verifierat avslutat live-snapshot.
- 30 minuter före nästa pass visas officiell startgrid för race/sprint när den publicerats.
- För träning/kval, eller om grid saknas, visas tydligt väntläge: officiell deltagarlista kunde inte verifieras via det öppna API:et.
- Ny tvåminuters slutvarvshantering efter avflaggning; fortsätt verifiera PB mot arkiv i verkliga sessioner.
- Statusindikatorer, timerikoner och aktiva sessionschip.
- Bevarar b16-säsongskalender, fem språk, rekordchips, API-spoilerskydd och befintlig backend.

**Begränsning:** öppna Pulselive `/event/.../entry` returnerade HTTP 400 i verifierade tester. Detta anrop aktiveras därför **inte** i b17. Säsongens team-/förarregister är inte en verifierad sessionsdeltagarlista.

**Resurs:** `/motogp_sensor/ha-mgp.js`; äldre `ha-motogp-next.js` är byte-identiskt kompatibilitetsalias. Registrera bara en.

**SOP:** dev → beta → main. Main är oförändrad. [Installation](docs/hacs-beta-installation.md) · [Release notes](docs/hacs-beta-release-notes.md).
