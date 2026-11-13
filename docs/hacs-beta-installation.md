# HA-MGP b33 – HACS beta / okulärbesiktning

1. Säkerhetskopiera HA och behåll `/config/motogp_data/` och tidigare arkiv.
2. Installera **`2026.11.0b33`** via HACS beta efter publicerad prerelease. Installera **inte dev**.
3. Starta om Home Assistant och gör `Ctrl+Shift+R` i webbläsaren.
4. Kontrollera frontendversion **`0.3.0-dev.71`** och en enda registrerad HA-MGP-resurs.
5. Kontrollera `Official MotoGP-page` och klicka både på banstrecket och tom yta **inne i banbildens rektangel** i båda popupvarianterna. Även klick utanför och Esc ska fungera; faktalänkar ska inte stänga av misstag.
6. Kontrollera nästa session mot faktiskt kommande GP-schema. En gammal Moto3 FP2 får inte visas som nästa pass; vid otillräcklig verifiering ska `Nästa pass ej verifierat` visas utan nedräkning.
7. Kontrollera att nedräkningen visar **dagar, timmar, minuter** och att passerade GP sorteras **nyaste först**, med oförändrade omgångsnummer.
8. Testa dator och mobil. Rapportera eventuell felaktig eventgräns/tidszon (särskilt torsdagspass), eftersom gränstoleransen är 12 timmar.
9. Vid problem: rollback till **b32** via HACS beta utan att ta bort data eller entiteter.

Ingen main-release före praktiska tester och separat godkännande.
