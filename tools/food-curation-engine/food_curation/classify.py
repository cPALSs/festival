"""Classify applicants — map signature items to archetypes."""

from __future__ import annotations

import re
from typing import Any

from food_curation.constants import (
    CATEGORY_KEYWORDS,
    ITEM_KEYWORDS,
    SIGNATURE_LIMITS,
    SNACK_ARCHETYPE_IDS,
)


def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", s.lower().strip())


# Cooked fair / open-prep items — must win before packaged_savory ("chips", etc.).
_COOKED_FAIR_ITEM_RULES: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"nachos?", re.I), "fast_handheld"),
    (re.compile(r"\bwings?\b", re.I), "fast_handheld"),
    (re.compile(r"fries", re.I), "fast_handheld"),
]


def classify_item(name: str) -> tuple[str | None, str]:
    """Return (archetype_id, category)."""
    n = _norm(name)
    for pat, archetype_id in _COOKED_FAIR_ITEM_RULES:
        if pat.search(n):
            cat = "snacks"
            for c, kws in CATEGORY_KEYWORDS.items():
                if any(k in n for k in kws):
                    cat = c
                    break
            return archetype_id, cat
    for archetype_id, keywords in ITEM_KEYWORDS:
        for kw in keywords:
            if kw in n:
                cat = "drinks"
                for c, kws in CATEGORY_KEYWORDS.items():
                    if any(k in n for k in kws):
                        cat = c
                        break
                if archetype_id in ("boba_milk_tea", "sugarcane_fruit_refresher"):
                    cat = "drinks"
                elif archetype_id in SNACK_ARCHETYPE_IDS:
                    cat = "snacks"
                else:
                    cat = cat if cat != "drinks" else "meals"
                return archetype_id, cat
    # fallback category guess
    for cat, kws in CATEGORY_KEYWORDS.items():
        if any(k in n for k in kws):
            return None, cat
    return None, "meals"


DRINK_PRIMARY_ARCHETYPES = frozenset({"boba_milk_tea", "sugarcane_fruit_refresher"})


def selection_archetype_id(applicant: dict[str, Any]) -> str | None:
    """Archetype bucket for roster selection.

    Staff ``primary_archetype_id`` (bottleneck item) wins over keyword inference.
    See Food Flow Model § Primary archetype = bottleneck item.
    """
    return applicant.get("primary_archetype_id") or applicant.get("inferred_primary_archetype_id")


_COMMODITY_PATTERNS = [
    re.compile(r"\b(bottle\s*)?water\b", re.I),
    re.compile(r"canned\s*soda", re.I),
    re.compile(r"soda/water", re.I),
    re.compile(r"^sodas?\.?$", re.I),
    re.compile(r"water\s*bottles?", re.I),
]

_SIDE_DRINK_PATTERNS = [
    re.compile(r"\bboba\b", re.I),
    re.compile(r"milk\s*tea", re.I),
    re.compile(r"bubble\s*tea", re.I),
    re.compile(r"pearl\s*tea", re.I),
    re.compile(r"\bcoffee\b", re.I),
    re.compile(r"ice\s*tea", re.I),
    re.compile(r"coconut\s*juice", re.I),
    re.compile(r"fruit\s*(infused\s*)?ice\s*tea", re.I),
    re.compile(r"fruit\s*refresher", re.I),
    re.compile(r"^thai\s*tea$", re.I),
]


def is_commodity_side_item(name: str, primary_archetype: str | None) -> bool:
    """Items vendors can sell but would not pick as festival signatures."""
    n = name.strip()
    if not n:
        return True
    for pat in _COMMODITY_PATTERNS:
        if pat.search(n):
            return True
    if primary_archetype not in DRINK_PRIMARY_ARCHETYPES:
        for pat in _SIDE_DRINK_PATTERNS:
            if pat.search(n):
                return True
    return False


def infer_primary_from_capability(
    capability: list[dict[str, Any]],
    override: str | None = None,
    *,
    vendor_class: str | None = None,
) -> str | None:
    if override:
        return override
    food_counts: dict[str, int] = {}
    drink_counts: dict[str, int] = {}
    meal_lane = vendor_class in (None, "open_prep", "drinks", "meal", "food")
    for item in capability:
        name = item.get("name", "")
        if is_commodity_side_item(name, None):
            continue
        arch = item.get("archetype_id") or classify_item(name)[0]
        if not arch:
            continue
        if meal_lane and arch in SNACK_ARCHETYPE_IDS:
            continue
        if arch in DRINK_PRIMARY_ARCHETYPES:
            drink_counts[arch] = drink_counts.get(arch, 0) + 1
        else:
            food_counts[arch] = food_counts.get(arch, 0) + 1
    if food_counts:
        return max(food_counts, key=food_counts.get)
    return max(drink_counts, key=drink_counts.get) if drink_counts else None


def infer_signature_items(
    capability: list[dict[str, Any]],
    booth_kind: str,
    *,
    primary_archetype: str | None = None,
    explicit_item_ids: list[str] | None = None,
) -> list[dict[str, Any]]:
    """
    Simulate Eventeny Q2 — pick top N signatures from capability (Q1).
    Excludes commodity sides (water/soda) and add-on drinks for non-drink primaries.
    """
    limit = signature_limit_for_booth(booth_kind)
    by_id = {i["item_id"]: i for i in capability if i.get("item_id")}

    if explicit_item_ids:
        return [by_id[iid] for iid in explicit_item_ids if iid in by_id][:limit]

    primary = infer_primary_from_capability(capability, primary_archetype)
    candidates = [
        i for i in capability
        if not is_commodity_side_item(i.get("name", ""), primary)
    ]
    if not candidates:
        candidates = list(capability)

    def rank(item: dict[str, Any]) -> tuple[int, int, int]:
        arch = item.get("archetype_id") or classify_item(item.get("name", ""))[0]
        primary_match = 1 if primary and arch == primary else 0
        food_item = 1 if item.get("category") in ("meals", "snacks") else 0
        return (primary_match, food_item, -capability.index(item))

    ranked = sorted(candidates, key=rank, reverse=True)
    return ranked[:limit]


def signature_limit_for_booth(booth_kind: str) -> int:
    bk = booth_kind.lower().replace(" ", "_")
    if "trailer" in bk:
        return SIGNATURE_LIMITS["food_trailer"]
    if "truck" in bk:
        return SIGNATURE_LIMITS["food_truck"]
    if "prepack" in bk:
        return SIGNATURE_LIMITS["prepack"]
    return SIGNATURE_LIMITS["open_cooking"]


def classify_applicant(applicant: dict[str, Any], config: dict[str, Any] | None = None) -> dict[str, Any]:
    """Classify signature items; validate against capability."""
    config = config or {}
    flags: list[str] = []
    capability = {i["item_id"]: i for i in applicant.get("capability_menu_items", [])}
    signatures = applicant.get("signature_menu_items", [])
    booth_kind = applicant.get("booth_kind", "open_cooking")
    limit = applicant.get("signature_limit") or signature_limit_for_booth(booth_kind)

    classified_sigs = []
    archetype_counts: dict[str, int] = {}

    for item in signatures:
        iid = item.get("item_id")
        if iid and iid not in capability:
            flags.append("SIGNATURE_NOT_IN_CAPABILITY")
        arch, cat = classify_item(item.get("name", ""))
        enriched = {**item, "archetype_id": arch, "category": item.get("category") or cat}
        classified_sigs.append(enriched)
        if arch:
            archetype_counts[arch] = archetype_counts.get(arch, 0) + 1

    if len(signatures) > limit:
        flags.append("SIGNATURE_OVER_LIMIT")

    primary = applicant.get("primary_archetype_id")
    vendor_class = applicant.get("vendor_class") or applicant.get("vendor_role")
    inferred_primary = infer_primary_from_capability(
        applicant.get("capability_menu_items", []),
        vendor_class=vendor_class,
    )
    if archetype_counts and inferred_primary:
        sig_primary = max(archetype_counts, key=archetype_counts.get)
        if primary and primary != inferred_primary:
            flags.append("MISMATCH")
        if sig_primary != inferred_primary and sig_primary in DRINK_PRIMARY_ARCHETYPES:
            flags.append("DRINK_SIDE_IN_SIGNATURES")
        primary = primary or inferred_primary
    elif archetype_counts:
        inferred_primary = max(archetype_counts, key=archetype_counts.get)
        if primary and primary != inferred_primary:
            flags.append("MISMATCH")
        primary = primary or inferred_primary
    else:
        primary = primary or inferred_primary

    food_capability = [
        i for i in applicant.get("capability_menu_items", [])
        if not is_commodity_side_item(i.get("name", ""), primary)
    ]
    if len(food_capability) > limit and not signatures:
        flags.append("SIGNATURES_REQUIRED")

    spread = len(set(i.get("archetype_id") for i in classified_sigs if i.get("archetype_id")))
    purity = 0.0
    if classified_sigs and primary:
        in_primary = sum(1 for i in classified_sigs if i.get("archetype_id") == primary)
        purity = in_primary / len(classified_sigs)

    cap_archetypes = set()
    for item in applicant.get("capability_menu_items", []):
        arch, _ = classify_item(item.get("name", ""))
        if arch:
            cap_archetypes.add(arch)

    return {
        **applicant,
        "signature_menu_items": classified_sigs,
        "inferred_primary_archetype_id": inferred_primary,
        "archetype_spread": spread,
        "primary_archetype_purity": purity,
        "capability_archetype_breadth": len(cap_archetypes),
        "classification_flags": list(set(flags)),
    }


def parse_menu_text(text: str, vendor_id: str) -> list[dict[str, Any]]:
    """Parse freeform menu description into capability items."""
    text = re.sub(r"^[^-]+-\s*", "", text, count=1)
    parts = re.split(r"[,•·\n/]+", text)
    items = []
    for i, part in enumerate(parts):
        name = part.strip()
        if not name or len(name) < 2:
            continue
        arch, cat = classify_item(name)
        items.append({
            "item_id": f"{vendor_id}-item-{i}",
            "name": name[:120],
            "category": cat,
            "archetype_id": arch,
            "allergens": [],
            "dietary_tags": [],
        })
    return items
