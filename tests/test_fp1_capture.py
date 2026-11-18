#!/usr/bin/env python3
"""Read-only FP1 collector smoke tests."""
import importlib.util
import json
import stat
import tempfile
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[1] / "scripts" / "diagnostics" / "capture_fp1.py"
spec = importlib.util.spec_from_file_location("fp1_capture", SOURCE)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
assert mod.parse_date("2026-11-20T09:45:00+01:00").isoformat() == "2026-11-20T08:45:00+00:00"
state = {"state": "POR", "attributes": {
    "next_weekend_api_status": {"results_sessions_rejected": 20},
    "sessions_all": [{"category": "Moto3", "name": "FP1",
                      "source": "broadcast_schedule",
                      "date_utc": "2026-11-20T09:00:00Z"}],
    "unrelated_private_field": "must-not-copy"}}
result = mod.normalize("sensor.motogp_next_race", state)
assert result["attributes"]["next_weekend_api_status"]["results_sessions_rejected"] == 20
assert result["attributes"]["sessions_all"][0]["source"] == "broadcast_schedule"
assert "unrelated_private_field" not in result["attributes"]
with tempfile.TemporaryDirectory() as directory:
    path = Path(directory) / "capture.jsonl"
    mod.write_line(path, result)
    assert json.loads(path.read_text()) == result
    assert stat.S_IMODE(path.stat().st_mode) == 0o600
print("FP1 collector smoke tests OK")
