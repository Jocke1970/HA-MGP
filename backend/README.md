# HA-MGP – backend

Den **aktuella** Home Assistant-backenden finns i `custom_components/motogp_sensor/` med egen `api.py`, `coordinator.py` och `sensor.py`. Den hämtar data från MotoGP/Pulselive. Projektet bygger historiskt vidare på [Liionboy/motogp_sensor](https://github.com/Liionboy/motogp_sensor) men kräver **inte** en andra installation av uppströmsintegrationen.

Denna `backend/`-mapp och `deployed/`-kopiorna innehåller äldre prototyper och revisionsmaterial, **inte** den aktiva HACS-distributionen. Installera dem inte över nuvarande integration.

Intern HA-domän `motogp_sensor` behålls vid repo-/namnbytet till HA-MGP för att undvika brott i entiteter, konfiguration och arkiv. Se [huvud-README](../README.md) och [projektstatus](../docs/project-status.md).
