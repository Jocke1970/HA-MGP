"""Fail CI if a local relative Python import has no file in the HACS package."""
from __future__ import annotations

import ast
from pathlib import Path

PKG = Path(__file__).resolve().parents[1] / "custom_components" / "motogp_sensor"


def check_local_imports() -> None:
    missing: list[str] = []
    files = sorted(PKG.rglob("*.py"))
    for source in files:
        module_dir = source.parent
        tree = ast.parse(source.read_text(encoding="utf-8"), filename=str(source))
        for node in ast.walk(tree):
            if not isinstance(node, ast.ImportFrom) or not node.level:
                continue
            base = module_dir
            for _ in range(node.level - 1):
                base = base.parent
            if node.module:
                target = base.joinpath(*node.module.split("."))
                if not (target.with_suffix(".py").is_file() or (target / "__init__.py").is_file()):
                    missing.append(f"{source.relative_to(PKG)}:{node.lineno}: .{node.module}")
            else:
                for name in node.names:
                    target = base / name.name
                    if not (target.with_suffix(".py").is_file() or (target / "__init__.py").is_file()):
                        missing.append(f"{source.relative_to(PKG)}:{node.lineno}: .{name.name}")
    assert not missing, "Missing package-local imports:\n" + "\n".join(missing)
    assert (PKG / "session_history_response.py").is_file()
    assert (PKG / "session_history_ws.py").is_file()
    print(f"PASS: {len(files)} HACS Python modules, all local imports resolvable")


if __name__ == "__main__":
    check_local_imports()
