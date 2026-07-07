"""Eventeny CSV import — normalize to applicant schema."""

from __future__ import annotations

import csv
import io
import json
import re
from typing import Any

from food_curation.classify import parse_menu_text, signature_limit_for_booth
from food_curation.vendor_skus import apply_sku_defaults

EVENTENY_FORM_MENU_HELP = (
    "Eventeny: list your full capability menu in the first menu question (water/soda are fine — "
    "ignored for scoring). The signatures question is optional when you have five or fewer "
    "food items — only needed when you list more than five and must choose which to highlight."
)

# Back-compat alias used across staff UI and improvements tasks.
EVENTENY_FORM_HELP = EVENTENY_FORM_MENU_HELP

EVENTENY_ELK_GROVE_BUSINESS_QUESTION = (
    "Do you consider your business part of the Elk Grove business community?"
)

EVENTENY_ELK_GROVE_BUSINESS_HELP = (
    "Eventeny — Elk Grove business community (self-report): answer Yes if you identify your "
    "business with Elk Grove — for example a shop or kitchen in city limits, a food truck that "
    "is based in or regularly serves Elk Grove, or a vendor who considers Elk Grove your "
    "primary market. Honest best answer; not verified. Maps to elk_grove_based for a small "
    "policy preference boost and City post-event vendor community counts."
)

ELK_GROVE_CSV_COLUMNS = (
    "Elk Grove Business Community",
    "Elk Grove Business",
    "Elk Grove Based",
    "Business in Elk Grove",
    "Elk Grove business location",
)


def parse_eventeny_yes_no(value: str | None) -> bool | None:
    if value is None or not str(value).strip():
        return None
    v = str(value).strip().lower()
    if v in ("yes", "y", "true", "1"):
        return True
    if v in ("no", "n", "false", "0"):
        return False
    return None


def _first_row_value(row: dict[str, str], *keys: str) -> str | None:
    for key in keys:
        val = row.get(key)
        if val is not None and str(val).strip():
            return str(val).strip()
    return None


def _slug(s: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s[:48] or "vendor"


def import_eventeny_csv(text: str) -> list[dict[str, Any]]:
    """Best-effort Eventeny export → applicants. Expects custom columns when present."""
    reader = csv.DictReader(io.StringIO(text))
    applicants = []
    for row in reader:
        name = row.get("Company Name") or row.get("Business Name") or row.get("Name", "")
        if not name:
            continue
        vid = _slug(name)
        menu_raw = row.get("Menu") or row.get("Capability Menu") or ""
        cap = []
        if menu_raw.strip().startswith("["):
            try:
                cap = json.loads(menu_raw)
            except json.JSONDecodeError:
                cap = parse_menu_text(menu_raw, vid)
        else:
            cap = parse_menu_text(menu_raw, vid) if menu_raw else []

        sig_raw = row.get("Signature Items") or ""
        sig_ids = [s.strip() for s in sig_raw.split(";") if s.strip()]
        signatures = [c for c in cap if c["item_id"] in sig_ids] if sig_ids else cap[:5]

        booth = row.get("Vendor Type") or row.get("Booth Kind") or "open_cooking"
        sku_id = row.get("Vendor SKU") or row.get("Product SKU") or row.get("SKU")
        setup_type = row.get("Setup Type") or row.get("setup_type")
        vendor_class = row.get("Vendor Class") or row.get("vendor_class")
        elk_raw = _first_row_value(row, *ELK_GROVE_CSV_COLUMNS)
        elk_flag = parse_eventeny_yes_no(elk_raw)
        business_city = _first_row_value(row, "Business City", "City", "business_city")
        business_zip = _first_row_value(row, "Business ZIP", "ZIP", "Zip", "business_zip")

        applicant: dict[str, Any] = {
            "id": vid,
            "business_name": name.strip(),
            "deposit_applied_at": row.get("Deposit Date") or row.get("Payment Date"),
            "booth_kind": booth,
            "capability_menu_items": cap,
            "signature_menu_items": signatures,
            "signature_limit": signature_limit_for_booth(booth),
            "primary_archetype_id": row.get("Food Subcategory"),
            "dietary": [t.strip() for t in (row.get("Dietary") or "").split(";") if t.strip()],
            "status": "submitted",
            "eventeny_status": row.get("Status", "Submitted"),
        }
        if sku_id:
            applicant["vendor_sku"] = sku_id.strip()
        if setup_type:
            applicant["setup_type"] = setup_type.strip()
        if vendor_class:
            applicant["vendor_class"] = vendor_class.strip()
            applicant["vendor_role"] = vendor_class.strip()
        applicant = apply_sku_defaults(applicant)
        if elk_flag is not None:
            applicant["elk_grove_based"] = elk_flag
        if business_city:
            applicant["business_city"] = business_city
        if business_zip:
            applicant["business_zip"] = business_zip
        applicants.append(applicant)
    return applicants
