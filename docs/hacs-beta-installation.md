# HA-MGP b43 – HACS beta / visuell kontroll

1. Installera **`2026.11.0b43`** via HACS beta, starta om Home Assistant och gör `Ctrl+Shift+R`.
2. Kontrollera backend **`2026.11.0b43`** och frontend **`0.3.0-dev.82`**.
3. Före race: kontrollera ”Pole · aktuellt kval” och ”Absolut varvrekord” ovanför en enda tredelad startgrid. Värde — betyder att säkert API-underlag saknas.
4. Vid T−15: tidsinformationen ska vara kvar.
5. Kontrollera att Moto3:s snabbaste observerade varv inte visas under Moto2:s startgrid.
6. API-verktyget ska ligga under timing-/startgridkortet, inte mellan headern och gridden. No Spoiler ska fortsatt fungera.
7. Vid problem: rollback till **b42**. Ingen ny YAML eller separat resurs.

**Main lämnas orörd** tills godkänd liveverifiering.
