# HA-MGP 2026.11.0b34 – kalendernamn, kvalstatus och popupklick

**HACS beta:** `2026.11.0b34` · **Frontend:** `0.3.0-dev.72`

## Ändrat sedan b33
- Kalenderns kort använder fullständigt GP-namn eller säker namn-fallback i stället för trestavig kod som `VAL`.
- Pole (Q2) i historiska officiella sessionsresultat får separat verifieringsstatus: **röd** när kvalresultatet inte kan verifieras; **gul** vid partiella uppgifter; **grön** endast när officiell Q2-pole har förare och kvaltid. En startgrid-P1 räcker inte till grön status.
- Popup kan stängas genom klick på icke-interaktiva delar även utanför banbilden. Källänkar och klassflikar fortsätter vara klickbara. Befintlig Esc-/bakgrundshantering bevaras.
- b33:s sessionsurval, nedräkning och kalenderordning behålls.

## Avgränsning
Frontend- och releaseändringar. Inga nya backend/Pulselive-anrop och ingen egen uppskattning av pole. Den befintliga read-only Q2-klassificeringen är officiell källa.

## Okulärbesiktning
Bekräfta kalendernamn, röd plupp när Q2-data saknas, grön vid verifierat resultat samt popupens klickbeteende i desktop/mobil. Kontrollera samtidigt att resultattabbar och källänkar inte stängs av misstag.

**Rollback:** `2026.11.0b33`. Behåll `/config/motogp_data/` och entiteter. **Main är orörd.**
