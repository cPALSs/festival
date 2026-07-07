#!/usr/bin/env python3
"""CLI — run curation engine and emit JSON for staff app / backtest."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHARED = ROOT.parent.parent
ASSETS = SHARED / "assets" / "shared" / "food-curation"
sys.path.insert(0, str(ROOT))

from food_curation import (  # noqa: E402
    capacity_plan,
    classify_applicant,
    gap_analysis,
    publish_public_menu,
    select_roster,
    vendor_roi,
)


def load_json(path: Path) -> dict | list:
    return json.loads(path.read_text())


def main() -> None:
    p = argparse.ArgumentParser(description="Food curation engine CLI")
    p.add_argument("--preset", type=Path, default=ASSETS / "presets/lny-2027.json")
    p.add_argument("--applicants", type=Path, required=True)
    p.add_argument("--needs", type=Path, default=ASSETS / "regional-need-profile.json")
    p.add_argument("--attendance", type=int, default=None)
    p.add_argument("--output", type=Path, default=None)
    p.add_argument("--public-menu", action="store_true")
    args = p.parse_args()

    config = load_json(args.preset)
    if args.attendance:
        config["attendance"] = args.attendance
    need = load_json(args.needs)
    data = load_json(args.applicants)
    applicants = data["applicants"] if isinstance(data, dict) else data

    cap = capacity_plan(config)
    classified = [classify_applicant(a, config) for a in applicants]
    selected = select_roster(classified, cap, {**config, **need})
    gaps = gap_analysis(selected, {**need, **config}, classified)
    roi = vendor_roi(selected["accepted"], cap)

    manual = [a for a in applicants if a.get("manual_accepted_2026")]
    out = {
        "config": config,
        "capacity": cap,
        "selection": selected,
        "gaps": gaps,
        "roi": roi,
        "backtest": {
            "manual_2026_food_count": len(manual),
            "engine_accept_count": selected["summary"]["accepted_count"],
            "target_slots": cap["food_slots"],
        },
    }
    if args.public_menu:
        accepted_with_offer = [
            {
                **a,
                "conditional_offer": a.get("conditional_offer")
                or {
                    "status": "accepted",
                    "offered_menu_items": a.get("signature_menu_items", []),
                },
            }
            for a in selected["accepted"]
        ]
        merged = {**need, **config}
        out["public_menu"] = publish_public_menu(
            accepted_with_offer,
            config.get("festival_name", "Festival"),
            need_profile=merged,
        )

    text = json.dumps(out, indent=2, default=str)
    if args.output:
        args.output.write_text(text)
        print(f"Wrote {args.output}")
    else:
        print(text)


if __name__ == "__main__":
    main()
