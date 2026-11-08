# HA-MGP 2026.11.0b24 — baninformation, GP-väder och helgschema

**Beta:** `2026.11.0b24` · **UI:** `0.3.0-dev.52`

- Klicka på banlayouten för att öppna en större SVG (lokal bild om installerad, annars schematisk) och verifierade banfakta/rekord där sådana finns. Portimão innehåller längd, raka, kurvor och MotoGP-varvrekord från publicerade källor.
- Banväder visas bara när rapportens Results-event-ID stämmer med visat GP och rapportdatum ligger inom evenemanget. Gamla temperaturer från föregående GP döljs.
- Helgschemat kompletteras med framtida sessionsstart från Broadcast API:s offset-aware `broadcasts` när Results API ännu saknar dessa pass. Broadcast-ID används aldrig som officiella Results-session-ID:n.
- Om schema saknas även där får användaren en korrekt status och länk till MotoGP:s officiella kalender.

Allt från b23 kvarstår, inklusive rättad startup, sessionhistorik, spoilerskydd, TV-delay och diagnostik. Original-SVG-filer ingår inte i GitHub/HACS: installera dem lokalt under `/config/www/ha-mgp/circuits/`.

**Installera via HACS beta mellan pass**, starta om Home Assistant och uppdatera webbläsarens JS-cache vid behov. Rollback: `2026.11.0b23`.
