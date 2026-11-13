# HA-MGP b32 – HACS beta / okulärbesiktning

1. Säkerhetskopiera HA. Behåll `/config/motogp_data/` och tidigare arkiv.
2. Installera **`2026.11.0b32`** via HACS beta efter publicerad prerelease. Installera **inte `dev`**.
3. Starta om HA mellan sessioner och gör `Ctrl+Shift+R` i webbläsaren.
4. Kontrollera frontendversionen **`0.3.0-dev.68`** och att bara ordinarie HA-MGP-resursen är registrerad.
5. Kontrollera att Valencia visar `Valencia GP`, Portugal `Portugal GP` och andra GP visar ett riktigt namn när ett sådant finns.
6. Testa att klicka på **banstrecket och den tomma ytan runt banan inne i banbilden**: båda ska stänga.
7. Klicka utanför popupen, tryck `Esc` och försök klicka i faktarutor/källänkar; interna fakta ska inte stänga popupen. Testa kalenderpopup + aktivt GP, dator och mobil.
8. Om något brister: rollback till **b31** via HACS beta, utan att radera datakatalog eller entiteter.

Ingen main-release görs innan praktiska tester och ditt uttryckliga godkännande.
