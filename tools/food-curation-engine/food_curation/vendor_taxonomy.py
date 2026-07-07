"""Vendor taxonomy — setup (layout) vs class (selection caps).

**Food vendor classes** (food curation engine — three lanes):
- ``open_prep`` — plates, handhelds, BBQ
- ``drinks`` — live-prep beverages
- ``snack`` — optional onsite treats

**Merchants** (outside food caps — Eventeny merch / exhibitor program):
- ``merchant`` — apparel, crafts, sealed take-home food, etc.
- Sealed take-home **food** is a merchant special case requiring **TFF PRE-PKG**
  (``requires_tff_pre_pkg`` flag on the applicant record).

Legacy ``take_home`` normalizes to ``merchant``.
"""

from __future__ import annotations

import re
from typing import Any

from food_curation.classify import DRINK_PRIMARY_ARCHETYPES, classify_item
from food_curation.constants import OPEN_PREP_ARCHETYPE_IDS
from food_curation.menu_enrichment import (
    filter_onsite_menu_items,
    is_snack_packaged_item,
    is_takehome_merchant_item,
)

SETUP_TYPES = (
    "open_food_truck",
    "open_food_trailer",
    "open_food_canopy",
    "prepack_booth",
)

VENDOR_CLASSES = ("open_prep", "drinks", "snack")

MERCHANT_CLASS = "merchant"

SETUP_LABELS = {
    "open_food_canopy": "Canopy + equipment",
    "open_food_truck": "Truck",
    "open_food_trailer": "Trailer",
    "prepack_booth": "Canopy-only",
}

VENDOR_CLASS_LABELS = {
    "open_prep": "Open prep food",
    "drinks": "Drinks",
    "snack": "Snack (optional)",
    "merchant": "Merchant / exhibitor",
    # Legacy display
    "take_home": "Merchant (take-home food)",
    "meal": "Open prep food",
    "food": "Open prep food",
}

VENDOR_CLASS_LEGACY = {
    "food": "open_prep",
    "take_home": "merchant",
    "merchant": "merchant",
}

# ``meal`` is resolved by inference — not a direct map target.
VENDOR_CLASS_INFER = frozenset({"meal"})

SETUP_LEGACY_ALIASES = {
    "open_cooking": "open_food_canopy",
    "food_truck": "open_food_truck",
    "food_trailer": "open_food_trailer",
}

_LIVE_PREP = re.compile(
    r"\b("
    r"sugarcane|mocktails?|aguas\s*frescas|boba|milk\s*tea|bubble\s*tea|"
    r"matcha|fruit\s*refresher|calamansi|fresh[\s-]?pressed|espresso|"
    r"smoothie|lemonade|vietnamese\s*coffee|refresher"
    r")\b",
    re.I,
)

_SNACK_TREAT = re.compile(
    r"\b("
    r"popcorn|kettle\s*corn|cotton\s*candy|caramel\s*corn|cheddar\s*corn|"
    r"snow\s*cone|shaved\s*ice|halo[\s-]?halo|ube\s*sago|buko\s*pandan"
    r")\b",
    re.I,
)


def normalize_setup_type(setup: str | None) -> str:
    if not setup:
        return "open_food_canopy"
    return SETUP_LEGACY_ALIASES.get(setup, setup)


def normalize_vendor_class(vendor_class: str | None) -> str:
    if not vendor_class:
        return "open_prep"
    if vendor_class in VENDOR_CLASS_INFER:
        return vendor_class
    return VENDOR_CLASS_LEGACY.get(vendor_class, vendor_class)


def setup_label(setup: str | None) -> str:
    return SETUP_LABELS.get(normalize_setup_type(setup), setup or "")


def vendor_class_label(vendor_class: str | None) -> str:
    vc = normalize_vendor_class(vendor_class)
    return VENDOR_CLASS_LABELS.get(vc, vc)


def capability_is_live_prep(capability: list[dict[str, Any]]) -> bool:
    for item in capability:
        name = item.get("name", "")
        if is_takehome_merchant_item(name):
            continue
        if _LIVE_PREP.search(name):
            return True
    return False


def capability_is_snack_only(capability: list[dict[str, Any]]) -> bool:
    """All onsite items are optional packaged snacks/treats — not meal or drink service."""
    onsite = filter_onsite_menu_items(capability)
    if not onsite:
        return False
    for item in onsite:
        name = item.get("name", "")
        if capability_is_live_prep([item]):
            return False
        if not (is_snack_packaged_item(name) or _SNACK_TREAT.search(name)):
            return False
    return True


def capability_is_drinks_vendor(capability: list[dict[str, Any]]) -> bool:
    """Drink-anchor vendor — has drink archetype items, no open-prep meal archetypes."""
    onsite = filter_onsite_menu_items(capability)
    if not onsite:
        return False
    has_drink_arch = False
    has_meal_arch = False
    for item in onsite:
        name = item.get("name", "")
        if is_takehome_merchant_item(name):
            continue
        if is_snack_packaged_item(name) or _SNACK_TREAT.search(name):
            continue
        arch, cat = classify_item(name)
        if arch in DRINK_PRIMARY_ARCHETYPES:
            has_drink_arch = True
        elif arch in OPEN_PREP_ARCHETYPE_IDS:
            has_meal_arch = True
        elif cat == "meals" and not _LIVE_PREP.search(name):
            has_meal_arch = True
    return has_drink_arch and not has_meal_arch


def infer_setup_type(
    permit: str = "",
    size: str = "",
    *,
    zeffy_ticket: str = "",
    zeffy_setup: str = "",
    capability: list[dict[str, Any]] | None = None,
) -> str:
    pt = (permit or "").strip().upper()
    sz = (size or "").strip().upper()
    blob = f"{zeffy_ticket} {zeffy_setup}".upper()
    cap = capability or []

    if pt == "MFF":
        return "open_food_truck"
    if "PRE-PKG" in pt or pt == "TFF PRE-PKG":
        setup = "prepack_booth"
    elif pt in ("TFF PREP", "MEV"):
        if "TRAILER" in sz or "TRAILER" in blob:
            setup = "open_food_trailer"
        elif "TRUCK" in sz:
            setup = "open_food_truck"
        else:
            setup = "open_food_canopy"
    elif "TRAILER" in sz or "TRAILER" in blob:
        setup = "open_food_trailer"
    elif "TRUCK" in sz or "FOOD TRUCK" in blob:
        setup = "open_food_truck"
    elif "PRE-PKG" in blob or "PREPACKAGED" in blob:
        setup = "prepack_booth"
    elif "OPEN" in blob or "COOKING" in blob or "MEV" in blob or "PREP" in blob:
        setup = "open_food_canopy"
    else:
        setup = "open_food_canopy"

    if setup == "prepack_booth" and capability_is_live_prep(cap):
        if "TRAILER" in sz or "TRAILER" in blob:
            return "open_food_trailer"
        if "TRUCK" in sz or pt == "MFF" or "FOOD TRUCK" in blob:
            return "open_food_truck"
        return "open_food_canopy"

    return normalize_setup_type(setup)


def setup_type_to_booth_kind(setup_type: str) -> str:
    setup = normalize_setup_type(setup_type)
    if setup == "prepack_booth":
        return "prepack"
    if setup == "open_food_truck":
        return "food_truck"
    if setup == "open_food_trailer":
        return "food_trailer"
    return "open_cooking"


def infer_vendor_class(
    applicant: dict[str, Any],
    cleanup: dict[str, Any] | None = None,
) -> str:
    cleanup = cleanup or {}
    if cleanup.get("take_home_only") or cleanup.get("merchant_only"):
        return MERCHANT_CLASS
    if cleanup.get("snack_only"):
        return "snack"
    explicit = (
        cleanup.get("vendor_class")
        or cleanup.get("vendor_role")
        or applicant.get("vendor_class")
        or applicant.get("vendor_role")
    )
    if explicit in VENDOR_CLASS_LEGACY:
        return VENDOR_CLASS_LEGACY[explicit]
    if explicit and explicit not in VENDOR_CLASS_INFER and explicit in VENDOR_CLASSES:
        return explicit
    if explicit == MERCHANT_CLASS:
        return MERCHANT_CLASS

    cap = applicant.get("capability_menu_items") or []
    if not cap:
        return "open_prep"

    onsite = filter_onsite_menu_items(cap)
    if not onsite:
        return MERCHANT_CLASS

    if all(is_takehome_merchant_item(i.get("name", "")) for i in cap):
        return MERCHANT_CLASS

    if capability_is_snack_only(cap):
        return "snack"

    if capability_is_drinks_vendor(cap):
        return "drinks"

    setup = normalize_setup_type(applicant.get("setup_type", ""))
    if setup == "prepack_booth" and any(
        is_snack_packaged_item(i.get("name", "")) or _SNACK_TREAT.search(i.get("name", ""))
        for i in onsite
    ):
        return "snack"

    return "open_prep"


def apply_vendor_taxonomy(
    applicant: dict[str, Any],
    *,
    cleanup: dict[str, Any] | None = None,
    permit: str = "",
    size: str = "",
    zeffy_ticket: str = "",
    zeffy_setup: str = "",
) -> dict[str, Any]:
    cleanup = cleanup or {}
    cap = applicant.get("capability_menu_items") or []
    setup = normalize_setup_type(cleanup.get("setup_type")) if cleanup.get("setup_type") else infer_setup_type(
        permit,
        size,
        zeffy_ticket=zeffy_ticket,
        zeffy_setup=zeffy_setup,
        capability=cap,
    )
    if setup not in SETUP_TYPES:
        setup = "open_food_canopy"

    vendor_class = infer_vendor_class({**applicant, "setup_type": setup}, cleanup)
    booth_kind = setup_type_to_booth_kind(setup)

    out: dict[str, Any] = {
        **applicant,
        "setup_type": setup,
        "vendor_class": vendor_class,
        "vendor_role": vendor_class,
        "booth_kind": booth_kind,
    }
    if vendor_class == MERCHANT_CLASS:
        out["requires_tff_pre_pkg"] = merchant_requires_tff_pre_pkg(out, cleanup)
        if out["requires_tff_pre_pkg"] and setup not in ("prepack_booth",):
            out["setup_type"] = "prepack_booth"
            out["booth_kind"] = "prepack"
    return out


def merchant_requires_tff_pre_pkg(
    applicant: dict[str, Any],
    cleanup: dict[str, Any] | None = None,
) -> bool:
    """Sealed take-home food merchants need TFF PRE-PKG (not general merch/crafts)."""
    cleanup = cleanup or {}
    if cleanup.get("requires_tff_pre_pkg") is not None:
        return bool(cleanup["requires_tff_pre_pkg"])
    if cleanup.get("take_home_only") or cleanup.get("merchant_take_home"):
        return True
    if not is_merchant_vendor(applicant):
        return False
    cap = applicant.get("capability_menu_items") or []
    return any(is_takehome_merchant_item(i.get("name", "")) for i in cap)


def booth_kind_to_setup_type(booth_kind: str) -> str:
    bk = (booth_kind or "").lower().replace(" ", "_")
    if bk == "prepack":
        return "prepack_booth"
    if bk == "food_trailer":
        return "open_food_trailer"
    if bk == "food_truck":
        return "open_food_truck"
    return "open_food_canopy"


def layout_counts(applicants: list[dict[str, Any]]) -> dict[str, int]:
    setup: dict[str, int] = {s: 0 for s in SETUP_TYPES}
    vclass: dict[str, int] = {c: 0 for c in VENDOR_CLASSES}
    for a in applicants:
        st = normalize_setup_type(a.get("setup_type") or booth_kind_to_setup_type(a.get("booth_kind", "")))
        if st in setup:
            setup[st] += 1
        vc = a.get("vendor_class") or a.get("vendor_role") or "open_prep"
        if vc == "meal" or vc == "food":
            vc = "open_prep"
        elif vc in ("merchant", "take_home"):
            continue  # merchants tracked separately from food lanes
        if vc in vclass:
            vclass[vc] += 1
    merchant_count = sum(
        1 for a in applicants
        if is_merchant_vendor(a)
    )
    return {"setup_type": setup, "vendor_class": vclass, "merchant_count": merchant_count}


def is_open_prep_vendor(applicant: dict[str, Any]) -> bool:
    vc = applicant.get("vendor_class") or applicant.get("vendor_role") or "open_prep"
    if vc in ("meal", "food"):
        return True
    return normalize_vendor_class(vc) == "open_prep"


def is_drinks_vendor(applicant: dict[str, Any]) -> bool:
    return normalize_vendor_class(applicant.get("vendor_class") or applicant.get("vendor_role")) == "drinks"


def is_meal_vendor(applicant: dict[str, Any]) -> bool:
    """Legacy — open prep + drinks (full feeding program, excludes snack + take-home)."""
    return is_open_prep_vendor(applicant) or is_drinks_vendor(applicant)


def is_snack_vendor(applicant: dict[str, Any]) -> bool:
    return normalize_vendor_class(applicant.get("vendor_class") or applicant.get("vendor_role")) == "snack"


def is_merchant_vendor(applicant: dict[str, Any]) -> bool:
    """Merch / exhibitor — outside food curation caps (includes sealed take-home food)."""
    vc = applicant.get("vendor_class") or applicant.get("vendor_role")
    if vc in (MERCHANT_CLASS, "take_home"):
        return True
    return normalize_vendor_class(vc) == MERCHANT_CLASS


def is_take_home_vendor(applicant: dict[str, Any]) -> bool:
    """Legacy alias — use :func:`is_merchant_vendor`."""
    return is_merchant_vendor(applicant)


def is_food_vendor(applicant: dict[str, Any]) -> bool:
    """Legacy — open prep vendors only."""
    return is_open_prep_vendor(applicant)


def counts_for_guest_menu(applicant: dict[str, Any]) -> bool:
    """Open prep + drinks + snack on guest menu; merchants excluded."""
    if is_merchant_vendor(applicant):
        return False
    vc = applicant.get("vendor_class") or applicant.get("vendor_role") or "open_prep"
    if vc in ("meal", "food"):
        return True
    return normalize_vendor_class(vc) in ("open_prep", "drinks", "snack")
