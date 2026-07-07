"""Publish guest-safe public menu JSON."""

from __future__ import annotations

from datetime import date
from typing import Any

from food_curation.constants import FILTER_FACETS
from food_curation.menu_enrichment import filter_onsite_menu_items
from food_curation.offer import menu_items_for_publication
from food_curation.roster_coverage import publish_roster_coverage
from food_curation.vendor_taxonomy import is_merchant_vendor


def publish_public_menu(
    roster: list[dict[str, Any]],
    festival_name: str,
    published_at: str | None = None,
    *,
    items_source: str = "offer_or_signature",
    need_profile: dict[str, Any] | None = None,
) -> dict[str, Any]:
    vendors = []
    for a in roster:
        if is_merchant_vendor(a):
            continue
        if a.get("conditional_offer", {}).get("status") not in ("committed", "accepted"):
            if not a.get("manual_accepted_2026") and a.get("recommended_action") != "accept":
                continue
        items = filter_onsite_menu_items(
            menu_items_for_publication(a, items_source=items_source),
        )
        if not items:
            continue
        pub_items = []
        for it in items:
            pub_items.append({
                "name": it.get("name"),
                "price": it.get("price"),
                "category": it.get("category", "meals"),
                "allergens": it.get("allergens", []),
                "dietary_tags": it.get("dietary_tags", []),
                "dietary_warnings": it.get("dietary_warnings", []),
            })
        vendors.append({
            "id": a.get("id"),
            "name": a.get("business_name"),
            "booth_label": a.get("booth_label"),
            "booth_kind": a.get("booth_kind"),
            "dietary": a.get("dietary", []),
            "items": pub_items,
        })

    result: dict[str, Any] = {
        "festival": festival_name,
        "published_at": published_at or str(date.today()),
        "disclaimer": (
            "Menu subject to change. Filters reflect vendor self-report — not medical advice."
        ),
        "vendors": vendors,
        "filter_facets": FILTER_FACETS,
    }
    if need_profile:
        result["roster_coverage"] = publish_roster_coverage(
            roster,
            need_profile,
            items_source=items_source,
        )
    return result
