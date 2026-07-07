"""Actionable score-improvement tasks for vendor outreach and staff review."""

from __future__ import annotations

import math
from typing import Any

from food_curation.classify import (
    infer_primary_from_capability,
    is_commodity_side_item,
    selection_archetype_id,
    signature_limit_for_booth,
)
from food_curation.needs import applicant_need_tags, normalize_need_tag
from food_curation.select import _instagram_meta, _resolve_scoring_weights, _social_reach_score

from food_curation.constants import SCORE_DISPLAY_SCALE
from food_curation.eventeny import EVENTENY_FORM_HELP, EVENTENY_ELK_GROVE_BUSINESS_HELP

_PRIORITY_ORDER = {"high": 0, "medium": 1, "low": 2}
_FOLLOWER_MILESTONES = (1_000, 10_000, 100_000)


def weighted_score_gain(weights: dict[str, float], component: str, component_delta: float) -> float:
    """Contribution to total score from a change in one component (delta × weight)."""
    return round(weights.get(component, 0) * max(0.0, component_delta), 4)


def format_weighted_gain(gain: float | None) -> str:
    if gain is None or gain <= 0:
        return ""
    pts = round(gain * SCORE_DISPLAY_SCALE)
    return f"~+{pts:,} pts"


def food_capability_items(applicant: dict[str, Any]) -> list[dict[str, Any]]:
    """Food capability lines used for menu-fit scoring (water/soda sides excluded for meal vendors)."""
    capability = applicant.get("capability_menu_items") or []
    primary = selection_archetype_id(applicant) or infer_primary_from_capability(
        capability,
        applicant.get("primary_archetype_id"),
    )
    food = [
        i for i in capability
        if not is_commodity_side_item(i.get("name", ""), primary)
    ]
    return food if food else list(capability)


def _task(
    task_id: str,
    *,
    component: str,
    priority: str,
    title: str,
    detail: str,
    eventeny_hint: str = "",
    estimated_gain: float | None = None,
    task_type: str = "structural",
) -> dict[str, Any]:
    return {
        "id": task_id,
        "component": component,
        "priority": priority,
        "title": title,
        "detail": detail,
        "eventeny_hint": eventeny_hint,
        "estimated_gain": estimated_gain,
        "task_type": task_type,
    }


def _social_reach_tasks(
    applicant: dict[str, Any],
    weight: float,
    components: dict[str, float],
) -> list[dict[str, Any]]:
    if weight <= 0:
        return []
    handle, followers = _instagram_meta(applicant)
    current = components.get("social_reach", _social_reach_score(applicant))
    tasks: list[dict[str, Any]] = []

    if not handle:
        component_delta = max(0.15, 1.0 - current)
        gain = weighted_score_gain({"social_reach": weight}, "social_reach", component_delta)
        gain_note = format_weighted_gain(gain)
        tasks.append(_task(
            "add_instagram",
            component="social_reach",
            priority="high" if weight >= 0.08 else "medium",
            title="Add a business Instagram handle",
            detail=(
                "Social reach scores 0 without an Instagram on file. "
                "Create a business account if needed, then add the handle to your application."
                + (f" Estimated lift: {gain_note}." if gain_note else "")
            ),
            eventeny_hint="Enter your Instagram handle on the Eventeny vendor application.",
            estimated_gain=gain or None,
        ))
        return tasks

    if followers <= 0:
        component_delta = max(0.0, 0.33 - current)
        gain = weighted_score_gain({"social_reach": weight}, "social_reach", component_delta)
        tasks.append(_task(
            "confirm_instagram_followers",
            component="social_reach",
            priority="medium",
            title="Confirm Instagram follower count",
            detail=(
                f"Handle {handle!r} is on file but follower count is missing — "
                "we score conservatively until reach is verified. Ask staff to update after you share stats."
                + (f" Estimated lift: {format_weighted_gain(gain)}." if gain > 0.001 else "")
            ),
            estimated_gain=gain if gain > 0.001 else None,
        ))
        return tasks

    for milestone in _FOLLOWER_MILESTONES:
        if followers >= milestone:
            continue
        target_score = max(0.0, min(1.0, (math.log10(milestone) - 2) / 3))
        component_delta = target_score - current
        gain = weighted_score_gain({"social_reach": weight}, "social_reach", component_delta)
        if gain < 0.002:
            break
        label = f"{milestone:,}"
        gain_note = format_weighted_gain(gain)
        tasks.append(_task(
            "grow_instagram_followers",
            component="social_reach",
            priority="medium" if milestone <= 10_000 else "low",
            title=f"Grow Instagram toward {label} followers",
            detail=(
                f"Currently ~{followers:,} followers. "
                f"About {label} followers adds {gain_note} "
                f"(social reach is {weight:.0%} of total)."
            ),
            estimated_gain=gain,
        ))
        break

    return tasks


def _capability_tasks(
    applicant: dict[str, Any],
    components: dict[str, float],
    weights: dict[str, float],
) -> list[dict[str, Any]]:
    booth_kind = applicant.get("booth_kind", "open_cooking")
    limit = applicant.get("signature_limit") or signature_limit_for_booth(booth_kind)
    food = food_capability_items(applicant)
    cap_count = len(food)
    sig_count = len(applicant.get("signature_menu_items") or [])
    tasks: list[dict[str, Any]] = []

    if cap_count < limit:
        commodity = [
            i for i in (applicant.get("capability_menu_items") or [])
            if is_commodity_side_item(
                i.get("name", ""),
                selection_archetype_id(applicant) or infer_primary_from_capability(
                    applicant.get("capability_menu_items") or [],
                ),
            )
        ]
        commodity_note = ""
        if commodity:
            commodity_note = (
                " Bottled water, soda, and similar sides may stay on your list — "
                "they are ignored for menu-fit scoring."
            )
        current_mf = components.get("menu_fit", 0.5)
        mf_weight = weights.get("menu_fit", 0.30)
        target_mf = min(0.9, current_mf + 0.2 * (limit - cap_count) / max(limit, 1))
        mf_gain = weighted_score_gain(weights, "menu_fit", target_mf - current_mf)
        gain_note = format_weighted_gain(mf_gain)
        tasks.append(_task(
            "expand_capability_menu",
            component="menu_fit",
            priority="high",
            title=f"List at least {limit} food capability items ({cap_count} scored now)",
            detail=(
                f"The engine picks up to {limit} food items from capability for menu-fit scoring. "
                "More distinct dishes (with accurate dietary tags) improve roster fit."
                + commodity_note
                + (f" Estimated lift: {gain_note} (menu fit is {mf_weight:.0%} of total)." if gain_note else "")
            ),
            eventeny_hint=(
                f"Eventeny Q1 — list your full capability menu ({limit}+ food dishes for scoring; "
                "water/soda are fine to include). "
                + (
                    "Signatures (Q2) are optional when you have five or fewer food items."
                    if cap_count <= limit
                    else "Signatures (Q2) — pick up to five highlights if you list more than five food items."
                )
            ),
            estimated_gain=mf_gain if mf_gain >= 0.002 else None,
        ))

    if cap_count > limit and sig_count == 0:
        tasks.append(_task(
            "pick_signatures",
            component="menu_fit",
            priority="high",
            title=f"Choose up to {limit} signature items",
            detail=(
                f"You listed {cap_count} capability items. "
                f"Pick up to {limit} signatures so guests and staff know your festival focus."
            ),
            eventeny_hint=(
                f"Eventeny Q2 — required when capability exceeds {limit} items; "
                "choose your festival highlights."
            ),
        ))
    elif cap_count <= limit and sig_count > 0:
        tasks.append(_task(
            "signatures_optional",
            component="application",
            priority="low",
            title="Signatures are optional for your menu size",
            detail=(
                f"With {cap_count} capability item{'s' if cap_count != 1 else ''}, "
                "the engine can score your full menu — signatures are only required above five items."
            ),
            eventeny_hint=EVENTENY_FORM_HELP,
        ))

    return tasks


def _menu_fit_tasks(
    applicant: dict[str, Any],
    need_weights: dict[str, float],
    components: dict[str, float],
) -> list[dict[str, Any]]:
    if not need_weights:
        return []
    current = components.get("menu_fit", 1.0)
    if current >= 0.95:
        return []

    have = set()
    for item in applicant.get("capability_menu_items") or []:
        for t in item.get("dietary_tags") or []:
            have.add(normalize_need_tag(t))
    for d in applicant.get("dietary") or []:
        have.add(normalize_need_tag(d))

    missing = [
        (tag, weight)
        for tag, weight in sorted(need_weights.items(), key=lambda x: -x[1])
        if weight >= 0.05 and tag not in have
    ][:3]
    if not missing:
        return []

    labels = ", ".join(f"{t.replace('_', ' ')}" for t, _ in missing)
    tasks = [_task(
        "add_regional_need_tags",
        component="menu_fit",
        priority="medium",
        title="Add items that match regional attendee needs",
        detail=(
            f"Capability is missing high-priority tags: {labels}. "
            "Add or tag dishes that fit these needs (e.g. vegetarian plate, mild kid-friendly item). "
            "Roster scarcity changes as vendors commit menus — see the festival food page for live coverage."
        ),
        eventeny_hint="Eventeny Q1 — list dishes and note dietary fit in item descriptions.",
        task_type="market",
    )]

    halal_w = need_weights.get("halal_certified", 0)
    if halal_w >= 0.06 and "halal_certified" not in have:
        tasks.append(_task(
            "halal_certification",
            component="menu_fit",
            priority="high",
            title="Add Halal certification if applicable",
            detail=(
                f"Halal-certified booths score strongly (~{halal_w:.0%} regional need). "
                "Upload certification or attest booth-wide Halal prep on the application. "
                "Value drops as other vendors fill this need — check the live roster board on the festival food page."
            ),
            eventeny_hint="Eventeny — vendor-level Halal attestation or cert upload.",
            task_type="market",
        ))

    return tasks


def _brand_focus_tasks(
    applicant: dict[str, Any],
    components: dict[str, float],
    weights: dict[str, float],
) -> list[dict[str, Any]]:
    focus = components.get("brand_focus", 1.0)
    if focus >= 0.85:
        return []
    spread = applicant.get("recommended_archetype_spread", applicant.get("archetype_spread", 0))
    if spread <= 2:
        return []
    primary = selection_archetype_id(applicant) or applicant.get("primary_archetype_id") or "your primary style"
    bf_weight = weights.get("brand_focus", 0.10)
    gain = weighted_score_gain(weights, "brand_focus", min(0.85, 1.0) - focus)
    gain_note = format_weighted_gain(gain)
    return [_task(
        "narrow_menu_focus",
        component="brand_focus",
        priority="low",
        title="Focus capability on one food style",
        detail=(
            f"Menu spans {spread} throughput styles. "
            f"Prioritize {primary.replace('_', ' ')} items in capability and signatures."
            + (f" Estimated lift: {gain_note} (brand focus is {bf_weight:.0%} of total)." if gain_note else "")
        ),
        estimated_gain=gain if gain >= 0.002 else None,
    )]


def _deposit_task(applicant: dict[str, Any]) -> list[dict[str, Any]]:
    if applicant.get("deposit_applied_at"):
        return []
    return [_task(
        "pay_deposit_early",
        component="tiebreaker",
        priority="low",
        title="Pay deposit when offered (tiebreaker)",
        detail=(
            "Deposit timestamp does not change score components but breaks ties within "
            "the same archetype bucket — earlier deposit wins at equal score."
        ),
    )]


def score_improvement_tasks(
    applicant: dict[str, Any],
    need_weights: dict[str, float] | None = None,
    *,
    selection_context: dict[str, Any] | None = None,
    score: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """Return prioritized, actionable tasks to raise this applicant's score."""
    if applicant.get("vendor_class") == "merchant" or applicant.get("vendor_role") == "merchant":
        return []

    ctx = selection_context or {}
    weights = _resolve_scoring_weights(ctx)
    components = (score or {}).get("components") or {}

    tasks: list[dict[str, Any]] = []
    tasks.extend(_social_reach_tasks(applicant, weights.get("social_reach", 0), components))
    tasks.extend(_capability_tasks(applicant, components, weights))
    tasks.extend(_menu_fit_tasks(applicant, need_weights or {}, components))
    tasks.extend(_brand_focus_tasks(applicant, components, weights))
    tasks.extend(_deposit_task(applicant))

    tasks.sort(
        key=lambda t: (
            _PRIORITY_ORDER.get(t["priority"], 9),
            -(t.get("estimated_gain") or 0),
        ),
    )
    return tasks
