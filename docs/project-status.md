# HA-MGP — status 2026-11-07

## Projekt och releaser

- GitHub: [Jocke1970/HA-MGP](https://github.com/Jocke1970/HA-MGP), tidigare `ha-motogp`.
- Produktnamn: **HA-MGP**, med backend + frontend i samma HACS-integration.
- Publicerad HACS-beta: **2026.11.0b12**, frontend **0.3.0-dev.23**.
- Aktuell dev-kandidat: **0.3.0-dev.25** med det nya produktnamnet **HA-MGP** i UI. Den är **inte** publicerad som beta.
- Ordning: **dev → beta → main**.

## Funktioner

Grand Prix-toppkort, banväder och schematisk banlayout, dynamisk nationsflagga för värdlandet, helgschema och nedräkning, livetiming, varvdata, spoilerskydd och klassvis VM-ställning.

I den ännu opublicerade dev-versionen är helgschema och VM-ställning ömsesidigt uteslutande, dubbel schemarubrik borttagen och VM-listan inte längre begränsad till tio förare.

**Kvar att göra:** förarnas nationsflaggor i livetiming och VM-ställning, klassloggor som filterknappar (originalmaterialet måste hittas/verifieras), verkliga livepassprov och kontroll av historikfunktionens beroende till backend.

## Kompatibilitet

Vi behåller `motogp_sensor` som intern HA-domän, resursen `/motogp_sensor/ha-motogp-next.js`, korttaggarna `ha-motogp-next-*` och sessionslagringen `/config/motogp_data/`. NEXT är bara ett äldre internt identifierarnamn. Repo/produkt heter HA-MGP.

Övriga äldre anteckningar dokumenterar tidigare tester och ska inte följas som aktuella installationsinstruktioner. Se [installation](hacs-beta-installation.md) och [dokumentationsindex](README.md).
