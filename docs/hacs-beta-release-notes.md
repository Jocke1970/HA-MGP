# HA-MGP 2026.11.0b31 – renare banpopup och tydligare banfakta

**HACS-beta:** `2026.11.0b31` · **UI:** `0.3.0-dev.66`

## Nytt jämfört med b30
- Banpopupens rubrik har **större nationsflagga, banans namn, GP-namn och datum/plats**, både i kalender och kommande GP.
- Banbilden fungerar som **stängningsknapp**; den synliga "Stäng"-knappen är borttagen från just banpopuperna. Bakgrundsklick och Escape fungerar fortfarande. Om bild saknas finns en textbaserad stängningsyta.
- Banfaktarutorna har större text och **tre kolumner** på bred skärm, två på mobil.
- Statusetiketter skiljer verifierade uppgifter från delvis dokumenterade/preliminära; banvarianter får inte automatiskt fullständig verifieringsstatus baserat på mått.
- En **read-only-pilot** för officiell historisk baninformation (Buriram, Valencia, Red Bull Ring) finns i utvecklingsträdet. Den kör offline som standard och gör **inga API-anrop från Home Assistant**. Detta är inte en schemalagd insamlare eller automatiskt grönt ljus för någon banlayout.

## Praktiskt test inför main
Installera b31 via **HACS beta**, starta om HA mellan sessioner och gör hård omladdning. Verifiera popup-rubrik, flagga, korrekt namnfält, att stängning via bild och bakgrund samt Escape fungerar, samt att alla faktarutor, källhänvisningar, 2026/2027 och resultat fungerar.

Under nästa racehelg: följ livepass, klassväxling, spoilerläge, kalender/helgschema och automatisk övergång till kommande GP. **Main kräver separat godkännande efter racehelgen.**

**Rollback:** `2026.11.0b30`. Bevara `/config/motogp_data/` och alla entiteter.
