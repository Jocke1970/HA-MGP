"""Static UI invariants: source reliability badges and compact responsive fact cards."""
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
HEADER=(ROOT/"frontend/ha-mgp-header-track.js").read_text()
CALENDAR=(ROOT/"frontend/ha-mgp-calendar.js").read_text()

class FactsLayoutTest(unittest.TestCase):
    def test_calendar_cards(self):
        self.assertIn('grid-template-columns:repeat(3,minmax(0,1fr))',CALENDAR)
        self.assertIn('@media(max-width:660px){.mgp-season-detail-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}',CALENDAR)
        self.assertIn('facts?.provisional',CALENDAR)
        self.assertIn('mgp-season-facts-status',CALENDAR)
        self.assertIn('Preliminära banfakta',CALENDAR)
        self.assertIn('Verifierade banfakta',CALENDAR)
        self.assertIn('font-size:16px',CALENDAR)
    def test_current_gp_cards(self):
        self.assertIn('mgp-circuit-facts-status',HEADER)
        self.assertIn('data-status="verified"',HEADER)
        self.assertIn('data-status="preliminary"',HEADER)
        self.assertIn('grid-template-columns:repeat(3,minmax(0,1fr))',HEADER)
        self.assertIn('@media(max-width:660px){.mgp-circuit-detail-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}',HEADER)

if __name__=="__main__":
    unittest.main()
