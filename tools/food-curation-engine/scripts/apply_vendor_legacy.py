#!/usr/bin/env python3
"""Merge vendor-festival-legacy.json into lny-2026-applicants.json."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
SHARED = ROOT.parent.parent
SEEDS = SHARED / "assets" / "shared" / "food-curation" / "seeds"
APPLICANTS_PATH = SEEDS / "lny-2026-applicants.json"
LEGACY_PATH = SEEDS / "vendor-festival-legacy.json"

from food_curation.legacy import attach_vendor_legacy  # noqa: E402


def main() -> None:
    data = json.loads(APPLICANTS_PATH.read_text())
    legacy = json.loads(LEGACY_PATH.read_text())
    applicants = attach_vendor_legacy(data.get("applicants") or [], legacy.get("by_id") or {})
    updated = sum(1 for a in applicants if a.get("festival_legacy"))
    data["applicants"] = applicants
    data.setdefault("meta", {})["festival_legacy"] = LEGACY_PATH.name
    APPLICANTS_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"Updated {updated} applicants from {LEGACY_PATH.name}")


if __name__ == "__main__":
    main()
