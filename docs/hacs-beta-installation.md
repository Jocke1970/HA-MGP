# HA-MGP b37 – HACS beta / okulärbesiktning

1. Behåll en HA-backup, alla entiteter och `/config/motogp_data/`.
2. Installera **`2026.11.0b37`** från HACS beta när prerelease finns; installera inte dev.
3. Starta om HA och gör hård omladdning i webbläsaren (`Ctrl+Shift+R`).
4. Bekräfta backend b37 och frontend `0.3.0-dev.75`.
5. Q1 MotoGP: endast topp två markerade Q2, övriga preliminär grid P13+. Q1 Moto2/Moto3: topp fyra Q2, övriga preliminär grid P19+. Inga påståenden om officiell pole.
6. Q1/Q2: snabbaste varv överst och senaste varv under. Race/Sprint: senaste varv överst.
7. Klicka TV-delay-knappen i livekortet, ändra reglaget och kontrollera `input_number.motogp_tv_delay_seconds`. Vid saknad hjälpare får knappen inte skriva något.
8. Efter passerad schemalagd start utan verifierad live: se vänteläge, efter fem minuter `START EJ BEKRÄFTAD · MÖJLIG FÖRSENING`. Ingen falsk LIVE-status.
9. Kolla fortsatt b36:s skydd för gamla Results-sessioner och att Sprint-rutan bara visas för MotoGP.
10. Vid problem: rollback till **b36**. Radera inga historiska data.

**Main lämnas orörd** tills beta testats och godkänts.
