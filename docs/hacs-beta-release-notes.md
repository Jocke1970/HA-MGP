# HA-MGP 2026.11.0b26 — helgschemat under GP-kortet

**Beta:** `2026.11.0b26` · **UI:** `0.3.0-dev.60`

- Helgschemat visas som en **utfällbar sektion under GP-toppkortet**, likt VM-ställningen, i stället för en flytande popup.
- Alla befintliga klassknappar (ALL, Moto3, Moto2, MotoGP), dagsektioner och sessionsuppgifter är oförändrade.
- Stäng fäller ihop schemat; VM-ställningen och schemat förblir ömsesidigt exklusiva.
- Kalender 2026/2027, klickbara Grand Prix, historiska Pulselive-resultat och banreferenser finns kvar från b25.
- Återstår: banpopupens skärmplacering, vissa pole-tider, banfakta och vädret.

Installera via HACS beta och uppdatera JS-cachen (Ctrl+Shift+R). Verifiera visuellt att schemat ligger under GP-kortet. Rollback: `2026.11.0b25`. `main` lämnas orörd.
