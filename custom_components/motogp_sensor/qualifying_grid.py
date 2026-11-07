"""Class-scoped, non-fabricated Q1 eliminations for the qualifying grid.

The FIM 2026 grid rule is Q2 top 12 / Q1 places 13+ (MotoGP) and
Q2 top 18 / Q1 places 19+ (Moto2/Moto3). Results source stays separately
labelled as provisional until an event's published grid exists.
"""
from __future__ import annotations

import re
from typing import Any

Q2_GRID_SIZE = {"MotoGP": 12, "Moto2": 18, "Moto3": 18}
Q1_TRANSFER_COUNT = {"MotoGP": 2, "Moto2": 4, "Moto3": 4}
_HEX = re.compile(r"#[0-9a-fA-F]{6}\Z")


def _rank(value: Any) -> int | None:
    if value is None or isinstance(value, bool):
        return None
    try:
        result = int(value)
    except (ValueError, TypeError, OverflowError):
        return None
    return result if 1 <= result <= 60 and str(value).strip() == str(result) else None


def _rider_number(value: Any) -> str:
    if value is None or isinstance(value, bool):
        return ""
    value = str(value).strip().lstrip("#")
    return str(int(value)) if value.isdecimal() and 0 < int(value) <= 999 else ""


def q1_eliminated_rows(
    classification: dict[str, Any], category: str,
    standings: list[dict[str, Any]] | None = None,
) -> list[dict[str, Any]]:
    """Return *only* Q1 non-transferees with official-rule grid slots.

    Reject malformed, duplicate, or noncontiguous results. A Q1 classification
    lacking verified transfer ranks is not safe to project onto the grid.
    """
    transfer = Q1_TRANSFER_COUNT.get(category)
    q2_size = Q2_GRID_SIZE.get(category)
    if transfer is None or q2_size is None or not isinstance(classification, dict):
        return []
    raw = classification.get("classification")
    if not isinstance(raw, list) or len(raw) <= transfer:
        return []

    parsed: dict[int, dict[str, Any]] = {}
    used_numbers: set[str] = set()
    for entry in raw:
        if not isinstance(entry, dict):
            return []
        position = _rank(entry.get("position"))
        rider = entry.get("rider")
        rider = rider if isinstance(rider, dict) else {}
        number = _rider_number(rider.get("number"))
        name = str(rider.get("full_name") or "").strip()
        if position is None or not number or not name or position in parsed or number in used_numbers:
            return []
        team = entry.get("team")
        team = team if isinstance(team, dict) else {}
        parsed[position] = {
            "q1_position": position,
            "position": q2_size + position - transfer,
            "number": number,
            "rider": name[:90],
            "team": str(team.get("name") or "")[:100],
            "color": "",
        }
        used_numbers.add(number)

    if set(parsed) != set(range(1, max(parsed) + 1)):
        return []  # no invented ranks when classification has holes

    # Standings colors are optional and only matched within this same class.
    # A neutral UI marker is safer than guessing when data disagrees.
    source_colors: dict[tuple[str, str, str], set[str]] = {}
    for row in standings or []:
        if not isinstance(row, dict):
            continue
        number = _rider_number(row.get("number"))
        name = str(row.get("rider") or "").strip().casefold()
        color = str(row.get("team_color") or "").strip()
        team = str(row.get("team") or "").strip().casefold()
        if number and name and team and _HEX.fullmatch(color):
            source_colors.setdefault((number, name, team), set()).add(color)

    losers: list[dict[str, Any]] = []
    for pos in sorted(parsed):
        if pos <= transfer:
            continue
        row = parsed[pos]
        options = source_colors.get((row["number"], row["rider"].casefold(), row["team"].casefold()), set())
        if len(options) == 1:
            row["color"] = next(iter(options))
        losers.append(row)
    return losers
