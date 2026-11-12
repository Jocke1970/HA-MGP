"""Checks that the preview keeps 2027 data separate from old race facts."""
from pathlib import Path
import re
import unittest

ROOT=Path(__file__).resolve().parents[1]
HEADER=(ROOT/"frontend/ha-mgp-header-track.js").read_text(encoding="utf-8")
CAL=(ROOT/"frontend/ha-mgp-calendar.js").read_text(encoding="utf-8")

class CircuitFactsPreview(unittest.TestCase):
    def test_2027_is_explicitly_scoped(self):
        self.assertIn("Number(season)===2027",HEADER)
        self.assertIn("calendarFacts2027(circuit)",HEADER)
        self.assertIn("selected.circuit,selectedYear",CAL)
    def test_no_fictitious_records(self):
        self.assertIn("Preliminära banmått · Pulselive 2027",HEADER)
        self.assertNotIn("recordHolder:'2027'",HEADER)
    def test_known_and_missing_fields(self):
        self.assertIn('"buriram":[4554,12,1000,5,7]',HEADER)
        self.assertIn('"buenosaires":[4350,null,null,null,null]',HEADER)
        self.assertIn('"adelaide":[3219,10,640,7,9]',HEADER)
        self.assertIn("data[1]!=null",HEADER)
        self.assertIn("EXTRA_2027_CIRCUITS",HEADER)
    def test_layout_and_popup_contract(self):
        self.assertIn(".mgp-season-track--tile{height:106px",CAL)
        self.assertIn("height:clamp(240px,43dvh,400px)",CAL)
        self.assertIn("mgp-season-dialog-head",CAL)
        self.assertIn("mgp-circuit-dialog-head",HEADER)

if __name__ == "__main__":
    unittest.main()
