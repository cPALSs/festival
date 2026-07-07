"""Menu-fit-first roster selection — four vendor-class lanes."""

from __future__ import annotations

import math
from datetime import datetime
from typing import Any

from food_curation.classify import classify_applicant, selection_archetype_id
from food_curation.constants import (
    AUDIENCE_PRESETS,
    DEFAULT_SCORING_WEIGHTS,
    DRINK_ARCHETYPE_IDS,
    EXCLUSIVITY_GROUPS,
    NEED_COVERAGE_MIN_WEIGHT,
    NEED_SWAP_MAX_SCORE_GAP,
    OPEN_PREP_ARCHETYPE_IDS,
    SNACK_ARCHETYPE_IDS,
    SNACK_VENDOR_DEFAULTS,
)
from food_curation.legacy import legacy_score
from food_curation.policy import policy_preference_score
from food_curation.menu_recommendation import attach_recommended_menu, menu_fit_from_items
from food_curation.needs import applicant_need_tags, merge_need_weights, menu_items_for_scoring, normalize_need_tag
from food_curation.vendor_taxonomy import (
    is_drinks_vendor,
    is_merchant_vendor,
    is_open_prep_vendor,
    is_snack_vendor,
    layout_counts,
    merchant_requires_tff_pre_pkg,
)


def _need_anchor_score(
    applicant: dict[str, Any],
    need_weights: dict[str, float],
    pool: list[dict[str, Any]],
) -> float:
    """Boost when applicant is a rare pool source for a high-priority attendee need."""
    if not need_weights or not pool:
        return 0.0
    my_tags = applicant_need_tags(applicant)
    score = 0.0
    for tag, weight in need_weights.items():
        if weight < 0.05 or tag not in my_tags:
            continue
        providers = sum(1 for a in pool if tag in applicant_need_tags(a))
        if providers == 1:
            score += weight * 5.0
        elif providers == 2:
            score += weight * 2.0
    return min(score, 1.0)


def _ensure_need_coverage(
    accepted: list[dict[str, Any]],
    waitlisted: list[dict[str, Any]],
    need_weights: dict[str, float],
    max_score_gap: float = NEED_SWAP_MAX_SCORE_GAP,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Promote waitlisted need-holders when roster lacks a high-priority dietary tag."""
    accepted = list(accepted)
    waitlisted = list(waitlisted)
    for tag, weight in sorted(need_weights.items(), key=lambda x: -x[1]):
        if weight < NEED_COVERAGE_MIN_WEIGHT:
            continue
        if any(tag in applicant_need_tags(a) for a in accepted):
            continue
        candidates = [a for a in waitlisted if tag in applicant_need_tags(a)]
        if not candidates:
            continue
        candidates.sort(key=lambda a: (-a["score"]["total"], a.get("_deposit_ts", float("inf"))))
        pick = candidates[0]
        pick_arch = selection_archetype_id(pick) or "unclassified"
        same_arch = [
            a for a in accepted
            if (selection_archetype_id(a) or "unclassified") == pick_arch
        ]
        if not same_arch:
            continue
        victim = min(same_arch, key=lambda a: a["score"]["total"])
        gap = victim["score"]["total"] - pick["score"]["total"]
        if gap > max_score_gap:
            continue
        accepted.remove(victim)
        waitlisted.remove(pick)
        waitlisted.append({
            **victim,
            "recommended_action": "waitlist",
            "action_reason": "need_coverage_swap",
        })
        accepted.append({
            **pick,
            "recommended_action": "accept",
            "action_reason": "need_coverage",
        })
    return accepted, waitlisted


def _parse_deposit(ts: str | None) -> float:
    if not ts:
        return float("inf")
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00")).timestamp()
    except ValueError:
        return float("inf")


def _menu_fit_score(applicant: dict[str, Any], need_weights: dict[str, float]) -> float:
    return menu_fit_from_items(
        menu_items_for_scoring(applicant),
        need_weights,
        vendor_dietary=applicant.get("dietary"),
    )


def _resolve_scoring_weights(config: dict[str, Any] | None, overrides: dict[str, float] | None = None) -> dict[str, float]:
    w = {**DEFAULT_SCORING_WEIGHTS, **(overrides or {})}
    preset = (config or {}).get("audience_preset")
    if preset and preset in AUDIENCE_PRESETS:
        w.update(AUDIENCE_PRESETS[preset].get("scoring_weight_overrides", {}))
    return w


def _instagram_meta(applicant: dict[str, Any]) -> tuple[str | None, int]:
    social = applicant.get("social") or {}
    ig = social.get("instagram") if isinstance(social, dict) else {}
    handle = (ig.get("handle") if isinstance(ig, dict) else None) or applicant.get("instagram_handle")
    followers = (ig.get("followers") if isinstance(ig, dict) else None)
    if followers is None:
        followers = applicant.get("instagram_followers")
    try:
        followers_int = int(followers or 0)
    except (TypeError, ValueError):
        followers_int = 0
    handle_str = str(handle).strip() if handle else None
    return handle_str or None, followers_int


def _social_reach_score(applicant: dict[str, Any]) -> float:
    """Log-scaled Instagram followership when handle is present (novelty / discovery proxy)."""
    handle, followers = _instagram_meta(applicant)
    if not handle:
        return 0.0
    if followers <= 0:
        return 0.15
    # 100 → ~0, 1k → ~0.33, 10k → ~0.67, 100k+ → 1.0
    score = (math.log10(followers) - 2) / 3
    return max(0.0, min(1.0, score))


def _brand_focus_score(applicant: dict[str, Any]) -> float:
    spread = applicant.get("recommended_archetype_spread", applicant.get("archetype_spread", 0))
    purity = applicant.get(
        "recommended_primary_archetype_purity",
        applicant.get("primary_archetype_purity", 0),
    )
    if spread <= 2:
        return 1.0
    return max(0.2, purity)


def _demographic_score(applicant: dict[str, Any], need_weights: dict[str, float]) -> float:
    if not need_weights:
        return 0.5
    hits = 0.0
    for d in applicant.get("dietary", []):
        hits += need_weights.get(normalize_need_tag(d), 0)
    for item in menu_items_for_scoring(applicant):
        for t in item.get("dietary_tags", []):
            hits += need_weights.get(normalize_need_tag(t), 0) * 0.5
    return min(hits * 5, 1.0)


def _roi_score(applicant: dict[str, Any], capacity: dict[str, Any]) -> float:
    fee = applicant.get("booth_fee", 750)
    arch = selection_archetype_id(applicant)
    if not arch:
        return 0.5
    slots = capacity.get("slots_by_archetype", {}).get(arch, 1)
    if arch in DRINK_ARCHETYPE_IDS:
        orders = capacity.get("drink_orders", capacity.get("total_orders", 0))
    else:
        orders = capacity.get("open_prep_orders", capacity.get("total_orders", 0))
    row = next((r for r in capacity.get("rows", []) if r["id"] == arch), None)
    if row and row.get("lane") == "snacks":
        return 0.5
    share = row.get("order_share", 0.1) if row else 0.1
    avg_ticket = 12 if arch in DRINK_ARCHETYPE_IDS else 15
    expected_gross = (orders * share / max(slots, 1)) * avg_ticket
    viability = fee * 3
    if expected_gross >= viability:
        return 1.0
    return max(0.0, expected_gross / viability)


def _snack_policy(capacity: dict[str, Any], config: dict[str, Any] | None = None) -> dict[str, Any]:
    cfg = {**SNACK_VENDOR_DEFAULTS, **((config or {}).get("snack_vendors") or {})}
    if capacity.get("snack_policy"):
        cfg = {**cfg, **capacity["snack_policy"]}
    return cfg


def _effective_snack_fee(applicant: dict[str, Any], snack_cfg: dict[str, Any]) -> float:
    """Policy snack fee for ROI planning (lane rate card, not historical import)."""
    return float(snack_cfg.get("booth_fee", 400))


def _snack_roi_score(
    applicant: dict[str, Any],
    capacity: dict[str, Any],
    config: dict[str, Any] | None = None,
) -> float:
    snack_cfg = _snack_policy(capacity, config)
    fee = _effective_snack_fee(applicant, snack_cfg)
    mult = float(snack_cfg.get("viability_mult", 2.0))
    arch = selection_archetype_id(applicant)
    rows = {r["id"]: r for r in capacity.get("snack_rows", [])}
    if arch and arch in SNACK_ARCHETYPE_IDS:
        slots = max(capacity.get("slots_by_archetype", {}).get(arch, 1), 1)
        share = rows.get(arch, {}).get("vendor_share", 0.25)
    else:
        slots = max(capacity.get("snack_slots", 1), 1)
        share = 1.0
    buyers = capacity.get("snack_buyers_est", 0)
    avg_ticket = 8
    expected_gross = (buyers * share / slots) * avg_ticket
    viability = fee * mult
    if expected_gross >= viability:
        return 1.0
    return max(0.0, expected_gross / viability) if viability else 0.5


def score_applicant(
    applicant: dict[str, Any],
    capacity: dict[str, Any],
    need_weights: dict[str, float],
    weights: dict[str, float] | None = None,
    pool: list[dict[str, Any]] | None = None,
    config: dict[str, Any] | None = None,
) -> dict[str, Any]:
    w = _resolve_scoring_weights(config, weights)
    components = {
        "menu_fit": _menu_fit_score(applicant, need_weights),
        "need_anchor": _need_anchor_score(applicant, need_weights, pool or []),
        "brand_focus": _brand_focus_score(applicant),
        "vendor_roi": _roi_score(applicant, capacity),
        "demographic": _demographic_score(applicant, need_weights),
        "social_reach": _social_reach_score(applicant),
        "festival_legacy": legacy_score(applicant),
        "policy_preference": policy_preference_score(applicant, config),
        "deposit_fifo": 0.0,
    }
    total = sum(components[k] * w.get(k, 0) for k in components if k != "deposit_fifo")
    return {
        "total": total,
        "components": components,
        "weights": w,
    }


def snack_selection_rank(applicant: dict[str, Any]) -> float:
    """ROI ranks snack slots; composite total is for staff outreach."""
    score = applicant.get("score") or {}
    components = score.get("components") or {}
    return float(components.get("vendor_roi", score.get("total", 0)))


def score_snack_applicant(
    applicant: dict[str, Any],
    capacity: dict[str, Any],
    need_weights: dict[str, float] | None = None,
    weights: dict[str, float] | None = None,
    pool: list[dict[str, Any]] | None = None,
    config: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Full composite score on the meal scale; vendor_roi uses snack 2× viability."""
    config = config or {}
    w = _resolve_scoring_weights(config, weights)
    nw = need_weights if need_weights is not None else merge_need_weights(config)
    scoring_pool = pool or []
    components = {
        "menu_fit": _menu_fit_score(applicant, nw),
        "need_anchor": _need_anchor_score(applicant, nw, scoring_pool),
        "brand_focus": _brand_focus_score(applicant),
        "vendor_roi": _snack_roi_score(applicant, capacity, config),
        "demographic": _demographic_score(applicant, nw),
        "social_reach": _social_reach_score(applicant),
        "festival_legacy": legacy_score(applicant),
        "policy_preference": policy_preference_score(applicant, config),
        "deposit_fifo": 0.0,
    }
    total = sum(components[k] * w.get(k, 0) for k in components if k != "deposit_fifo")
    return {
        "total": total,
        "components": components,
        "weights": w,
    }


def _select_by_archetype(
    classified: list[dict[str, Any]],
    capacity: dict[str, Any],
    need_weights: dict[str, float],
    weights: dict[str, float] | None,
    allowed_archetypes: frozenset[str],
    scoring_pool: list[dict[str, Any]] | None = None,
    config: dict[str, Any] | None = None,
    *,
    score_fn=None,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    score_fn = score_fn or score_applicant
    slots_by = capacity.get("slots_by_archetype", {})
    exclusivity_filled: set[str] = set()
    accepted: list[dict[str, Any]] = []
    waitlisted: list[dict[str, Any]] = []

    pool = scoring_pool if scoring_pool is not None else classified

    by_arch: dict[str, list[dict[str, Any]]] = {}
    for a in classified:
        arch = selection_archetype_id(a) or "unclassified"
        if arch not in allowed_archetypes:
            a = {
                **a,
                "recommended_action": "waitlist",
                "action_reason": "wrong_lane",
            }
            waitlisted.append(a)
            continue
        by_arch.setdefault(arch, []).append(a)

    for arch, group in by_arch.items():
        slot_cap = slots_by.get(arch, 0)
        if arch == "unclassified":
            slot_cap = 0

        scored_group = []
        for a in group:
            if score_fn is score_applicant:
                sc = score_applicant(a, capacity, need_weights, weights, pool=pool, config=config)
            elif score_fn is score_snack_applicant:
                sc = score_snack_applicant(
                    a, capacity, need_weights, weights, pool=pool, config=config,
                )
            else:
                sc = score_fn(a, capacity, need_weights, pool=pool, config=config)
            dep_ts = _parse_deposit(a.get("deposit_applied_at"))
            a = {**a, "score": sc, "_deposit_ts": dep_ts}
            scored_group.append(a)

        if score_fn is score_snack_applicant:
            scored_group.sort(
                key=lambda x: (-snack_selection_rank(x), x["_deposit_ts"]),
            )
        else:
            scored_group.sort(key=lambda x: (-x["score"]["total"], x["_deposit_ts"]))

        taken = 0
        for a in scored_group:
            ex_group = EXCLUSIVITY_GROUPS.get(arch)
            if ex_group and ex_group in exclusivity_filled and taken >= slot_cap:
                a["recommended_action"] = "waitlist"
                a["action_reason"] = "exclusivity_full"
                waitlisted.append(a)
                continue
            if taken < slot_cap:
                a["recommended_action"] = "accept"
                a["action_reason"] = "menu_fit_rank"
                accepted.append(a)
                taken += 1
                if ex_group:
                    exclusivity_filled.add(ex_group)
            else:
                a["recommended_action"] = "waitlist"
                a["action_reason"] = "category_full"
                waitlisted.append(a)

    return accepted, waitlisted


def _select_snacks_coverage_first(
    classified: list[dict[str, Any]],
    capacity: dict[str, Any],
    need_weights: dict[str, float],
    config: dict[str, Any] | None = None,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """One vendor per treat archetype before duplicate archetypes (variety board)."""
    slots_by = capacity.get("slots_by_archetype", {})
    global_cap = capacity.get("snack_slots", 0)
    accepted: list[dict[str, Any]] = []
    waitlisted: list[dict[str, Any]] = []
    taken_by_arch: dict[str, int] = {}
    decided: set[str] = set()

    by_arch: dict[str, list[dict[str, Any]]] = {}
    for a in classified:
        arch = selection_archetype_id(a) or "unclassified"
        if arch not in SNACK_ARCHETYPE_IDS:
            waitlisted.append({
                **a,
                "recommended_action": "waitlist",
                "action_reason": "wrong_lane",
            })
            decided.add(a.get("id", ""))
            continue
        sc = score_snack_applicant(
            a, capacity, need_weights, pool=classified, config=config,
        )
        dep_ts = _parse_deposit(a.get("deposit_applied_at"))
        enriched = {**a, "score": sc, "_deposit_ts": dep_ts}
        by_arch.setdefault(arch, []).append(enriched)

    for group in by_arch.values():
        group.sort(key=lambda x: (-snack_selection_rank(x), x["_deposit_ts"]))

    # Pass 1 — best in each archetype (coverage board).
    for arch in sorted(SNACK_ARCHETYPE_IDS):
        group = by_arch.get(arch, [])
        if not group or len(accepted) >= global_cap:
            continue
        if slots_by.get(arch, 0) <= 0:
            continue
        pick = group[0]
        pick["recommended_action"] = "accept"
        pick["action_reason"] = "snack_coverage_first"
        accepted.append(pick)
        taken_by_arch[arch] = taken_by_arch.get(arch, 0) + 1
        decided.add(pick.get("id", ""))

    # Pass 2 — fill remaining per-archetype slots by ROI rank.
    for arch, group in by_arch.items():
        arch_cap = slots_by.get(arch, 0)
        for a in group:
            if a.get("id") in decided:
                continue
            if len(accepted) >= global_cap:
                a["recommended_action"] = "waitlist"
                a["action_reason"] = "snack_cap_full"
                waitlisted.append(a)
                continue
            if taken_by_arch.get(arch, 0) < arch_cap:
                a["recommended_action"] = "accept"
                a["action_reason"] = "snack_roi_rank"
                accepted.append(a)
                taken_by_arch[arch] = taken_by_arch.get(arch, 0) + 1
            else:
                a["recommended_action"] = "waitlist"
                a["action_reason"] = "category_full"
                waitlisted.append(a)

    return accepted, waitlisted


def select_roster(
    applicants: list[dict[str, Any]],
    capacity: dict[str, Any],
    config: dict[str, Any] | None = None,
) -> dict[str, Any]:
    config = config or {}
    need_weights = merge_need_weights(config)
    weights = config.get("scoring_weights")
    snack_cap = capacity.get("snack_slots", 0)

    open_prep_pool = [
        a for a in applicants
        if a.get("status") != "rejected" and is_open_prep_vendor(a)
    ]
    drinks_pool = [
        a for a in applicants
        if a.get("status") != "rejected" and is_drinks_vendor(a)
    ]
    snack_pool = [
        a for a in applicants
        if a.get("status") != "rejected" and is_snack_vendor(a)
    ]
    merchant_pool = [
        a for a in applicants
        if a.get("status") != "rejected" and is_merchant_vendor(a)
    ]

    open_prep_classified = [
        attach_recommended_menu(classify_applicant(a, config), need_weights)
        for a in open_prep_pool
    ]
    drinks_classified = [
        attach_recommended_menu(classify_applicant(a, config), need_weights)
        for a in drinks_pool
    ]
    meal_scoring_pool = open_prep_classified + drinks_classified

    open_prep_accepted, open_prep_waitlisted = _select_by_archetype(
        open_prep_classified, capacity, need_weights, weights, OPEN_PREP_ARCHETYPE_IDS,
        scoring_pool=meal_scoring_pool, config=config,
    )
    drinks_accepted, drinks_waitlisted = _select_by_archetype(
        drinks_classified, capacity, need_weights, weights, DRINK_ARCHETYPE_IDS,
        scoring_pool=meal_scoring_pool, config=config,
    )

    meal_accepted, meal_waitlisted = _ensure_need_coverage(
        open_prep_accepted + drinks_accepted,
        open_prep_waitlisted + drinks_waitlisted,
        need_weights,
    )
    open_prep_accepted = [a for a in meal_accepted if is_open_prep_vendor(a)]
    drinks_accepted = [a for a in meal_accepted if is_drinks_vendor(a)]
    open_prep_waitlisted = [a for a in meal_waitlisted if is_open_prep_vendor(a)]
    drinks_waitlisted = [a for a in meal_waitlisted if is_drinks_vendor(a)]

    snack_classified = [
        classify_applicant(a, config)
        for a in snack_pool
    ]
    snack_cfg = _snack_policy(capacity, config)
    if snack_cfg.get("coverage_first"):
        snack_accepted, snack_waitlisted = _select_snacks_coverage_first(
            snack_classified, capacity, need_weights, config=config,
        )
    else:
        snack_accepted, snack_waitlisted = _select_by_archetype(
            snack_classified,
            capacity,
            need_weights,
            weights,
            SNACK_ARCHETYPE_IDS,
            config=config,
            score_fn=score_snack_applicant,
        )

    manual_accepted = [a for a in applicants if a.get("manual_accepted_2026")]
    fielded_layout = layout_counts(manual_accepted)
    accepted = open_prep_accepted + drinks_accepted
    waitlisted = open_prep_waitlisted + drinks_waitlisted

    return {
        "accepted": accepted,
        "waitlisted": waitlisted,
        "open_prep_accepted": open_prep_accepted,
        "open_prep_waitlisted": open_prep_waitlisted,
        "drinks_accepted": drinks_accepted,
        "drinks_waitlisted": drinks_waitlisted,
        "snack_accepted": snack_accepted,
        "snack_waitlisted": snack_waitlisted,
        "merchants": [
            {
                **a,
                "recommended_action": "merchant",
                "action_reason": "merchant_exhibitor",
                "requires_tff_pre_pkg": merchant_requires_tff_pre_pkg(a),
            }
            for a in merchant_pool
        ],
        "capacity": capacity,
        "summary": {
            "accepted_count": len(accepted),
            "waitlisted_count": len(waitlisted),
            "open_prep_accepted_count": len(open_prep_accepted),
            "open_prep_waitlisted_count": len(open_prep_waitlisted),
            "drinks_accepted_count": len(drinks_accepted),
            "drinks_waitlisted_count": len(drinks_waitlisted),
            "snack_accepted_count": len(snack_accepted),
            "snack_waitlisted_count": len(snack_waitlisted),
            "merchant_pool_count": len(merchant_pool),
            "merchant_tff_count": len([a for a in merchant_pool if merchant_requires_tff_pre_pkg(a)]),
            "manual_2026_count": len(manual_accepted),
            "manual_2026_open_prep_count": len([a for a in manual_accepted if is_open_prep_vendor(a)]),
            "manual_2026_drinks_count": len([a for a in manual_accepted if is_drinks_vendor(a)]),
            "manual_2026_meal_count": len([a for a in manual_accepted if is_open_prep_vendor(a) or is_drinks_vendor(a)]),
            "manual_2026_snack_count": len([a for a in manual_accepted if is_snack_vendor(a)]),
            "manual_2026_merchant_count": len([a for a in manual_accepted if is_merchant_vendor(a)]),
            "manual_2026_merchant_tff_count": len([
                a for a in manual_accepted
                if is_merchant_vendor(a) and merchant_requires_tff_pre_pkg(a)
            ]),
            "fielded_layout": fielded_layout,
            "target_open_prep_slots": capacity.get("open_prep_slots", 0),
            "target_drink_slots": capacity.get("drink_slots", 0),
            "target_meal_slots": capacity.get("meal_slots", capacity.get("food_slots", 0)),
            "target_snack_slots": snack_cap,
            "target_food_slots": capacity.get("food_slots", 0),
        },
    }
