"""Vendor product SKU → engine fields (Eventeny apply path)."""

from __future__ import annotations

from typing import Any

# Maps catalog SKU id → vendor_class, default booth_fee (standard tier), setup hints.
VENDOR_SKU_DEFAULTS: dict[str, dict[str, Any]] = {
  # Lunar New Year 2027
    "LNY-VENDOR-FT": {"vendor_class": "open_prep", "booth_fee": 750, "setup_type": "open_food_truck"},
    "LNY-VENDOR-OC": {"vendor_class": "open_prep", "booth_fee": 750, "setup_type": "open_food_canopy"},
    "LNY-VENDOR-DR": {"vendor_class": "drinks", "booth_fee": 500},
    "LNY-VENDOR-SN": {"vendor_class": "snack", "booth_fee": 400, "setup_type": "prepack_booth"},
    "LNY-VENDOR-MF": {
        "vendor_class": "merchant",
        "booth_fee": 350,
        "setup_type": "prepack_booth",
        "requires_tff_pre_pkg": True,
    },
    "LNY-VENDOR-GEN": {"vendor_class": "merchant", "booth_fee": 500},
    "LNY-VENDOR-NP": {"vendor_class": "merchant", "booth_fee": 150},
    # Great Lantern Festival / MAF 2026
    "MAF-VENDOR-FT": {"vendor_class": "open_prep", "booth_fee": 370, "setup_type": "open_food_truck"},
    "MAF-VENDOR-OC": {"vendor_class": "open_prep", "booth_fee": 370, "setup_type": "open_food_canopy"},
    "MAF-VENDOR-DR": {"vendor_class": "drinks", "booth_fee": 150},
    "MAF-VENDOR-SN": {"vendor_class": "snack", "booth_fee": 125, "setup_type": "prepack_booth"},
    "MAF-VENDOR-MF": {
        "vendor_class": "merchant",
        "booth_fee": 150,
        "setup_type": "prepack_booth",
        "requires_tff_pre_pkg": True,
    },
    "MAF-VENDOR-GEN": {"vendor_class": "merchant", "booth_fee": 150},
    "MAF-VENDOR-NP": {"vendor_class": "merchant", "booth_fee": 85},
    # Legacy
    "MAF-VENDOR-PF": {"vendor_class": "snack", "booth_fee": 150, "setup_type": "prepack_booth"},
    "LNY-VENDOR-PF": {"vendor_class": "drinks", "booth_fee": 500, "setup_type": "prepack_booth"},
}

APPLY_VALUE_TO_SKU: dict[str, str] = {
    "food_truck": "LNY-VENDOR-FT",
    "open_cooking": "LNY-VENDOR-OC",
    "beverage_anchor": "LNY-VENDOR-DR",
    "snack_treat": "LNY-VENDOR-SN",
    "sealed_food_merchant": "LNY-VENDOR-MF",
    "general_exhibitor": "LNY-VENDOR-GEN",
    "nonprofit": "LNY-VENDOR-NP",
    "prepack_food": "MAF-VENDOR-SN",  # legacy MAF import → snack until re-tagged
}


def apply_sku_defaults(applicant: dict[str, Any], sku_id: str | None = None) -> dict[str, Any]:
    """Merge SKU defaults onto applicant record."""
    sku = sku_id or applicant.get("vendor_sku") or applicant.get("product_sku")
    if not sku:
        apply_val = applicant.get("eventeny_apply_value") or applicant.get("apply_question_value")
        if apply_val:
            sku = APPLY_VALUE_TO_SKU.get(str(apply_val))
    if not sku or sku not in VENDOR_SKU_DEFAULTS:
        return applicant
    defaults = VENDOR_SKU_DEFAULTS[sku]
    out = {**applicant, "vendor_sku": sku}
    if defaults.get("vendor_class") and not out.get("vendor_class"):
        out["vendor_class"] = defaults["vendor_class"]
        out["vendor_role"] = defaults["vendor_class"]
    if defaults.get("booth_fee") is not None and not out.get("booth_fee"):
        out["booth_fee"] = defaults["booth_fee"]
    if defaults.get("setup_type") and not out.get("setup_type"):
        out["setup_type"] = defaults["setup_type"]
    if defaults.get("requires_tff_pre_pkg"):
        out["requires_tff_pre_pkg"] = True
    return out
