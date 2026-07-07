"""Engine-recommended festival menu — best N capability items for menu-fit scoring."""

from __future__ import annotations

from typing import Any

from food_curation.classify import (
    classify_item,
    infer_primary_from_capability,
    is_commodity_side_item,
    selection_archetype_id,
    signature_limit_for_booth,
)
from food_curation.needs import normalize_need_tag

# Diminishing returns when the same need tag or archetype appears on multiple items.
MENU_FIT_TAG_REPEAT_MULT = (1.0, 0.5, 0.25)
MENU_FIT_ARCHETYPE_REPEAT_MULT = (1.0, 0.5, 0.25)
MENU_FIT_ARCHETYPE_BONUS = 0.1
MENU_FIT_VENDOR_CERT_MULT = 3.0
MENU_FIT_ITEM_TAG_MULT = 2.0


def _repeat_multiplier(count: int, schedule: tuple[float, ...]) -> float:
    return schedule[min(count, len(schedule) - 1)]


def _menu_fit_marginal_item(
    item: dict[str, Any],
    need_weights: dict[str, float],
    tag_counts: dict[str, int],
    archetype_counts: dict[str, int],
) -> float:
    delta = 0.0
    for tag in item.get("dietary_tags") or []:
        key = normalize_need_tag(tag)
        weight = need_weights.get(key, 0)
        if weight <= 0:
            continue
        mult = _repeat_multiplier(tag_counts.get(key, 0), MENU_FIT_TAG_REPEAT_MULT)
        delta += weight * MENU_FIT_ITEM_TAG_MULT * mult
    arch = item.get("archetype_id")
    if arch:
        mult = _repeat_multiplier(archetype_counts.get(arch, 0), MENU_FIT_ARCHETYPE_REPEAT_MULT)
        delta += MENU_FIT_ARCHETYPE_BONUS * mult
    return delta


def _apply_menu_fit_item_counts(
    item: dict[str, Any],
    tag_counts: dict[str, int],
    archetype_counts: dict[str, int],
) -> None:
    for tag in item.get("dietary_tags") or []:
        key = normalize_need_tag(tag)
        tag_counts[key] = tag_counts.get(key, 0) + 1
    arch = item.get("archetype_id")
    if arch:
        archetype_counts[arch] = archetype_counts.get(arch, 0) + 1


def menu_fit_from_items(
    items: list[dict[str, Any]],
    need_weights: dict[str, float],
    *,
    vendor_dietary: list[str] | None = None,
) -> float:
    """Menu-fit raw score for a set of items (capped at 1.0). Vendor certs count once each."""
    score = 0.0
    tag_counts: dict[str, int] = {}
    archetype_counts: dict[str, int] = {}
    for item in items:
        score += _menu_fit_marginal_item(item, need_weights, tag_counts, archetype_counts)
        _apply_menu_fit_item_counts(item, tag_counts, archetype_counts)
    for cert in vendor_dietary or []:
        score += need_weights.get(normalize_need_tag(cert), 0) * MENU_FIT_VENDOR_CERT_MULT
    return min(score, 1.0)


def item_menu_fit_contribution(
    item: dict[str, Any],
    need_weights: dict[str, float],
    *,
    tag_counts: dict[str, int] | None = None,
    archetype_counts: dict[str, int] | None = None,
) -> float:
    """Marginal menu-fit contribution for one item given prior selections."""
    return _menu_fit_marginal_item(
        item,
        need_weights,
        tag_counts or {},
        archetype_counts or {},
    )


def _enrich_capability_item(item: dict[str, Any]) -> dict[str, Any]:
    arch, cat = classify_item(item.get("name", ""))
    return {
        **item,
        "archetype_id": item.get("archetype_id") or arch,
        "category": item.get("category") or cat,
    }


def recommend_menu_items(
    capability: list[dict[str, Any]],
    booth_kind: str,
    need_weights: dict[str, float],
    *,
    primary_archetype: str | None = None,
) -> list[dict[str, Any]]:
    """Greedy pick: up to signature_limit items maximizing diminishing menu-fit gain."""
    if not capability or not need_weights:
        return []

    limit = signature_limit_for_booth(booth_kind)
    primary = primary_archetype or infer_primary_from_capability(capability)

    candidates: list[dict[str, Any]] = []
    for raw in capability:
        item = _enrich_capability_item(raw)
        if is_commodity_side_item(item.get("name", ""), primary):
            continue
        candidates.append(item)
    if not candidates:
        candidates = [_enrich_capability_item(i) for i in capability]

    selected: list[dict[str, Any]] = []
    tag_counts: dict[str, int] = {}
    archetype_counts: dict[str, int] = {}
    pool = list(candidates)

    while len(selected) < limit and pool:
        best_item = max(
            pool,
            key=lambda i: item_menu_fit_contribution(
                i, need_weights, tag_counts=tag_counts, archetype_counts=archetype_counts,
            ),
        )
        best_delta = item_menu_fit_contribution(
            best_item, need_weights, tag_counts=tag_counts, archetype_counts=archetype_counts,
        )
        if best_delta <= 0 and selected:
            break
        selected.append(best_item)
        _apply_menu_fit_item_counts(best_item, tag_counts, archetype_counts)
        pool.remove(best_item)

    return selected


def attach_recommended_menu(
    applicant: dict[str, Any],
    need_weights: dict[str, float],
) -> dict[str, Any]:
    """Attach engine-recommended menu and derived brand-focus stats."""
    capability = applicant.get("capability_menu_items") or []
    if not capability or not need_weights:
        return applicant

    primary = selection_archetype_id(applicant) or infer_primary_from_capability(
        capability,
        applicant.get("primary_archetype_id"),
    )
    recommended = recommend_menu_items(
        capability,
        applicant.get("booth_kind", "open_cooking"),
        need_weights,
        primary_archetype=primary,
    )
    arches = [i.get("archetype_id") for i in recommended if i.get("archetype_id")]
    spread = len(set(arches))
    purity = 0.0
    if recommended and primary:
        purity = sum(1 for a in arches if a == primary) / len(recommended)

    return {
        **applicant,
        "recommended_menu_items": recommended,
        "recommended_archetype_spread": spread,
        "recommended_primary_archetype_purity": purity,
    }
