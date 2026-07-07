#!/usr/bin/env python3
"""Merge lny-2026-social.json Instagram fields into applicant seed."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHARED = ROOT.parent.parent
SEEDS = SHARED / "assets" / "shared" / "food-curation" / "seeds"
APPLICANTS_PATH = SEEDS / "lny-2026-applicants.json"
SOCIAL_PATH = SEEDS / "lny-2026-social.json"


def main() -> None:
    data = json.loads(APPLICANTS_PATH.read_text())
    social = json.loads(SOCIAL_PATH.read_text())
    vendors = social.get("vendors") or {}
    updated = 0
    for app in data.get("applicants") or []:
        entry = vendors.get(app.get("id"))
        if not entry:
            continue
        handle = entry.get("instagram_handle")
        if handle:
            app["instagram_handle"] = handle
        if "instagram_followers" in entry:
            app["instagram_followers"] = entry["instagram_followers"]
        updated += 1
    data.setdefault("meta", {})["social_enrichment"] = SOCIAL_PATH.name
    APPLICANTS_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"Updated {updated} applicants from {SOCIAL_PATH.name}")


if __name__ == "__main__":
    main()
