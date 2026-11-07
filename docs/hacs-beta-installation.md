# Installera MotoGP HACS beta 2026.11.0b11

**Next UI: 0.3.0-dev.22.** Denna beta flyttar UI-information till foten och lägger till en Helgschema-knapp, nästa sessionschip med nedräkning och högerställd VM-ställningsknapp i det vita toppkortet.

1. Ta backup. Bevara `/config/motogp_data/`, dashboard och MotoGP-konfigurationspost.
2. Välj prerelease **2026.11.0b11** i HACS. Starta inte om under live Sprint, Race eller kval.
3. Starta om efter passet. Använd bara en JavaScript module-resurs: `/motogp_sensor/ha-motogp-next.js` (utan `?v=`).
4. Ladda om webbläsaren med `Ctrl+Shift+R`; kontrollera MGP-logga, nationsflagga, **Helgschema**, nästa pass/nedräkning, **VM-ställning** och att **UI-information** finns i foten. Next-version ska vara `0.3.0-dev.22`.
5. Om något går fel: återgå via HACS till **2026.11.0b10**, starta om efter passet. Radera inga arkiv.

När inget pass pågår går det att verifiera layout, schemanavigation och kommande session. Livevarvtider och övergång till aktiv session behöver kontrolleras under nästa pass.

**Red Flag:** Pollning och statuslogik är oförändrade. Det observerade `N`/30 s-läget felsöks separat före backendändring.
