"""Gap analysis and recruitment recommendations."""

from __future__ import annotations

from typing import Any

from food_curation.classify import selection_archetype_id
from food_curation.needs import applicant_need_tags, merge_need_weights


def gap_analysis(
    selected: dict[str, Any],
    need_profile: dict[str, Any],
    all_applicants: list[dict[str, Any]],
) -> dict[str, Any]:
    capacity = selected.get("capacity", {})
    accepted = selected.get("accepted", [])
    snack_accepted = selected.get("snack_accepted", [])
    roster_for_gaps = accepted + snack_accepted
    need_weights = merge_need_weights(need_profile)
    attendance = capacity.get("attendance", 6000)

    supply_gaps = []
    for row in capacity.get("rows", []):
        filled = sum(
            1 for a in roster_for_gaps
            if selection_archetype_id(a) == row["id"]
        )
        if filled < row["slots"]:
            supply_gaps.append({
                "type": "archetype_slot",
                "archetype_id": row["id"],
                "label": row["label"],
                "slots_needed": row["slots"] - filled,
                "priority": "high",
                "rationale": f"Need {row['slots'] - filled} more vendor(s) for {row['label']}",
            })

    pool_gaps = []
    for tag, weight in need_weights.items():
        pool_has = any(
            tag in applicant_need_tags(a)
            for a in all_applicants
        )
        accepted_has = any(tag in applicant_need_tags(a) for a in accepted)
        if weight * attendance > 0 and not accepted_has:
            pool_gaps.append({
                "type": "dietary_need",
                "tag": tag,
                "weight": weight,
                "pool_has_applicant": pool_has,
                "priority": "high" if weight >= 0.08 else "medium",
                "rationale": f"No {tag} coverage in accepted roster; regional need ~{weight:.0%}",
                "recommendation": "Recruit certified vendor" if not pool_has else "Engine may promote via need coverage or suggest capability swap",
            })

    swap_suggestions = []
    for gap in pool_gaps:
        if not gap.get("pool_has_applicant"):
            continue
        tag = gap["tag"]
        for a in all_applicants:
            cap_items = [
                i for i in a.get("capability_menu_items", [])
                if tag in i.get("dietary_tags", [])
            ]
            sig_has = any(tag in i.get("dietary_tags", []) for i in a.get("signature_menu_items", []))
            if cap_items and not sig_has:
                swap_suggestions.append({
                    "vendor_id": a.get("id"),
                    "business_name": a.get("business_name"),
                    "suggested_item": cap_items[0].get("name"),
                    "item_id": cap_items[0].get("item_id"),
                    "for_gap": tag,
                })

    recruitment = supply_gaps + pool_gaps
    brief_lines = ["# Food curation — gap brief", ""]
    for r in recruitment:
        brief_lines.append(f"- **{r.get('label') or r.get('tag')}**: {r['rationale']}")

    return {
        "supply_gaps": supply_gaps,
        "pool_gaps": pool_gaps,
        "swap_suggestions": swap_suggestions,
        "recruitment_recommendations": recruitment,
        "brief_md": "\n".join(brief_lines),
    }
