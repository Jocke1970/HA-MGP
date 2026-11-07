# Installera MotoGP HACS beta 2026.11.0b9

**Next UI: 0.3.0-dev.16.** Sedan b7 ingår det enhetliga vita toppkortet med **banväder i mitten** och **banlayout längst till höger**, och under senaste varv visas **snabbaste varvet för varje förare**.

1. Ta backup. Bevara `/config/motogp_data/`, dashboard och MotoGP-konfigurationspost.
2. Välj prerelease **2026.11.0b9** i HACS. **Starta inte om under live Sprint, Race eller kval.**
3. Starta om efter passet. Använd bara en JavaScript module-resurs: `/motogp_sensor/ha-motogp-next.js` (utan `?v=`).
4. Ladda om browsern med `Ctrl+Shift+R`; kontrollera Next-version **0.3.0-dev.16** och både senaste och snabbaste varv.
5. Om något går fel: återgå via HACS till **2026.11.0b7**, starta om efter passet. Radera inga arkiv.

**Red Flag:** Pollning och statuslogik är oförändrade i b9. Det observerade `N`/30 s-läget felsöks separat innan ändring i backend.
