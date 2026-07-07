#!/usr/bin/env python3
"""Compare Python vs JavaScript scoring and selection for parity checks."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHARED = ROOT.parent.parent
ASSETS = SHARED / "assets" / "shared" / "food-curation"
sys.path.insert(0, str(ROOT))

from food_curation.capacity import capacity_plan  # noqa: E402
from food_curation.classify import classify_applicant  # noqa: E402
from food_curation.menu_recommendation import attach_recommended_menu
from food_curation.needs import merge_need_weights  # noqa: E402
from food_curation.legacy import attach_vendor_legacy  # noqa: E402
from food_curation.select import score_applicant, score_snack_applicant, select_roster  # noqa: E402
from food_curation.vendor_taxonomy import is_drinks_vendor, is_open_prep_vendor, is_snack_vendor  # noqa: E402

TOLERANCE = 1e-4
COMPONENT_KEYS = (
    "menu_fit",
    "need_anchor",
    "brand_focus",
    "vendor_roi",
    "demographic",
    "social_reach",
    "festival_legacy",
    "policy_preference",
)


def _load_config() -> dict:
    config = json.loads((ASSETS / "presets/lny-2027.json").read_text())
    config["attendance"] = 6000
    return config


def _py_scores(applicants: list[dict], config: dict, need_profile: dict) -> dict[str, dict]:
    merged = {**config, **need_profile}
    need_weights = merge_need_weights(merged)
    cap = capacity_plan(config)

    open_prep = [
        attach_recommended_menu(classify_applicant(a, config), need_weights)
        for a in applicants if is_open_prep_vendor(a)
    ]
    drinks = [
        attach_recommended_menu(classify_applicant(a, config), need_weights)
        for a in applicants if is_drinks_vendor(a)
    ]
    meal_pool = open_prep + drinks

    out: dict[str, dict] = {}
    for a in meal_pool:
        out[a["id"]] = score_applicant(a, cap, need_weights, pool=meal_pool, config=merged)
    for a in applicants:
        if is_snack_vendor(a):
            snack_pool = [a for a in applicants if is_snack_vendor(a)]
            out[a["id"]] = score_snack_applicant(
                a, cap, need_weights, pool=snack_pool, config=merged,
            )
    return out


def _py_actions(applicants: list[dict], config: dict, need_profile: dict) -> dict[str, dict]:
    merged = {**config, **need_profile}
    cap = capacity_plan(config)
    classified = [classify_applicant(a, config) for a in applicants]
    sel = select_roster(classified, cap, merged)
    actions: dict[str, dict] = {}
    for lane in (
        "open_prep_accepted",
        "open_prep_waitlisted",
        "drinks_accepted",
        "drinks_waitlisted",
        "snack_accepted",
        "snack_waitlisted",
    ):
        for a in sel[lane]:
            actions[a["id"]] = {
                "recommended_action": a.get("recommended_action"),
                "action_reason": a.get("action_reason"),
                "total": (a.get("score") or {}).get("total"),
            }
    return actions


def _run_js() -> dict:
    mjs = ROOT / "scripts" / "compare_py_js_scores.mjs"
    proc = subprocess.run(
        ["node", str(mjs)],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        print(proc.stderr, file=sys.stderr)
        raise SystemExit(f"JS compare failed (exit {proc.returncode})")
    return json.loads(proc.stdout)


def _diff_float(a: float, b: float) -> float | None:
    d = abs(a - b)
    return d if d > TOLERANCE else None


def main() -> int:
    config = _load_config()
    need_profile = json.loads((ASSETS / "regional-need-profile.json").read_text())
    seed = json.loads((ASSETS / "seeds/lny-2026-applicants.json").read_text())
    applicants = attach_vendor_legacy([
        a for a in seed["applicants"] if a.get("status") != "rejected"
    ])

    py_scores = _py_scores(applicants, config, need_profile)
    py_actions = _py_actions(applicants, config, need_profile)
    js = _run_js()
    js_scores = js["scores"]
    js_actions = js["actions"]

    score_issues: list[str] = []
    all_ids = sorted(set(py_scores) | set(js_scores))

    for vid in all_ids:
        if vid not in py_scores:
            score_issues.append(f"  {vid}: missing in Python")
            continue
        if vid not in js_scores:
            score_issues.append(f"  {vid}: missing in JavaScript")
            continue
        ps, js_sc = py_scores[vid], js_scores[vid]
        total_d = _diff_float(ps["total"], js_sc["total"])
        if total_d is not None:
            score_issues.append(f"  {vid}: total py={ps['total']:.6f} js={js_sc['total']:.6f} Δ={total_d:.6f}")
        pc, jc = ps.get("components") or {}, js_sc.get("components") or {}
        for key in COMPONENT_KEYS:
            if key not in pc and key not in jc:
                continue
            pv, jv = pc.get(key, 0.0), jc.get(key, 0.0)
            d = _diff_float(pv, jv)
            if d is not None:
                score_issues.append(
                    f"    {key}: py={pv:.6f} js={jv:.6f} Δ={d:.6f}",
                )

    action_issues: list[str] = []
    action_ids = sorted(set(py_actions) | set(js_actions))
    for vid in action_ids:
        pa, ja = py_actions.get(vid), js_actions.get(vid)
        if not pa or not ja:
            action_issues.append(f"  {vid}: missing in {'Python' if not pa else 'JavaScript'}")
            continue
        if pa["recommended_action"] != ja["recommended_action"]:
            action_issues.append(
                f"  {vid}: action py={pa['recommended_action']} js={ja['recommended_action']}",
            )
        elif pa.get("action_reason") != ja.get("action_reason"):
            action_issues.append(
                f"  {vid}: reason py={pa.get('action_reason')} js={ja.get('action_reason')}",
            )

    print(f"Compared {len(all_ids)} scored vendors · {len(action_ids)} selection rows")
    print(f"Tolerance: {TOLERANCE}")

    if score_issues:
        print(f"\nScore discrepancies ({len([l for l in score_issues if not l.startswith('    ')])} vendors):")
        for line in score_issues:
            print(line)
    else:
        print("\nScores: Python and JavaScript match within tolerance.")

    if action_issues:
        print(f"\nSelection discrepancies ({len(action_issues)}):")
        for line in action_issues:
            print(line)
    else:
        print("Selection: Python and JavaScript match.")

    return 1 if score_issues or action_issues else 0


if __name__ == "__main__":
    raise SystemExit(main())
