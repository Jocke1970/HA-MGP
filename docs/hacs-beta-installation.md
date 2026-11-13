# HA-MGP b34 – HACS beta / okulärbesiktning

1. Säkerhetskopiera HA och behåll `/config/motogp_data/` och alla entiteter.
2. Installera **`2026.11.0b34`** via HACS beta efter bekräftad publicering. Installera aldrig dev.
3. Starta om HA och gör hård omladdning (`Ctrl+Shift+R`).
4. Kontrollera UI-version `0.3.0-dev.72`.
5. I kalendern: R22 ska inte visa kod `VAL`, utan `Valencia GP`. Bekräfta övriga GP och 2027.
6. Öppna genomfört GP och växla mellan MotoGP/Moto2/Moto3. För Pole (Q2): röd plupp om verifierad Q2-pole saknas, grön endast om officiellt Q2-resultat har förare + tid. Delvis kända uppgifter får gul plupp. P1 på startgridden är inte automatiskt pole.
7. Testa att klick på rubrik, text och tom yta stänger popupen; klassflikar, länkar och andra kontroller ska fungera utan att oavsiktligt stänga den. Testa båda popupvarianterna på mobil och desktop, samt Esc och utanför-klick.
8. Kontrollera att b33:s nästa-session-regler, nedräkning och senaste-avverkade GP först fungerar som innan.
9. Vid problem: rollback till **b33** utan radering av datakatalog eller entiteter.

Main uppdateras inte utan uttryckligt godkännande.
