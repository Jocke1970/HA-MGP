# Installera MotoGP HACS beta 2026.11.0b12

**Next UI: 0.3.0-dev.23.** Sedan b11 startar helgschemat dolt och timingkortet visas automatiskt först 30 minuter före nästa schemalagda pass eller när ett pass är verifierat aktivt.

1. Bevara backup av `/config/motogp_data/`, dashboard och MotoGP-konfiguration.
2. Välj prerelease **2026.11.0b12** i HACS när inget pass pågår.
3. Starta om HA. Behåll exakt en JavaScript module-resurs: `/motogp_sensor/ha-motogp-next.js` utan `?v=`.
4. Ladda om webbläsaren med `Ctrl+Shift+R`. Kontrollera **0.3.0-dev.23**, stängt schema och fungerande öppna/stäng-knapp, nedräkning och att livetiming saknas när det är mer än 30 minuter till start.
5. Om något inte fungerar: installera **2026.11.0b11** via HACS och starta om efter passet. Radera inga arkiv.

**Förseningar:** Upp till tre timmar efter schemalagd start kan timingkortet fortsatt synas om passet inte rapporterats avslutat; verifierad aktiv session syns oberoende av schemat. Red Flag och backendpollning är oförändrade.
