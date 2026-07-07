"""Live roster need coverage — guest-facing and vendor scarcity signals."""

from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Any

from food_curation.menu_enrichment import filter_onsite_menu_items
from food_curation.needs import merge_need_weights, normalize_need_tag
from food_curation.offer import menu_items_for_publication
from food_curation.vendor_taxonomy import is_merchant_vendor


def _published_items(
    applicant: dict[str, Any],
    *,
    items_source: str = "offer_or_signature",
) -> list[dict[str, Any]]:
    return filter_onsite_menu_items(
        menu_items_for_publication(applicant, items_source=items_source),
    )


def vendor_covers_need(
    applicant: dict[str, Any],
    need_id: str,
    *,
    vendor_level: bool = False,
    items_source: str = "offer_or_signature",
) -> bool:
    if vendor_level:
        return need_id in {normalize_need_tag(d) for d in applicant.get("dietary") or []}
    items = _published_items(applicant, items_source=items_source)
    for item in items:
        tags = {normalize_need_tag(t) for t in item.get("dietary_tags") or []}
        if need_id in tags:
            return True
    return False


def count_items_covering_need(
    applicant: dict[str, Any],
    need_id: str,
    *,
    vendor_level: bool = False,
    items_source: str = "offer_or_signature",
) -> int:
    items = _published_items(applicant, items_source=items_source)
    if not items:
        return 0
    if vendor_level:
        if not vendor_covers_need(applicant, need_id, vendor_level=True, items_source=items_source):
            return 0
        return len(items)
    return sum(
        1 for item in items
        if need_id in {normalize_need_tag(t) for t in item.get("dietary_tags") or []}
    )


def coverage_status(
    item_count: int,
    vendor_count: int,
    *,
    regional_pct: float,
) -> str:
    """gap | limited | well_served — from committed-menu coverage on accepted roster."""
    if item_count <= 0 and vendor_count <= 0:
        return "gap"
    if vendor_count <= 1 or item_count <= 2:
        return "limited"
    if regional_pct >= 0.06 and item_count <= 3:
        return "limited"
    return "well_served"


def roster_coverage_rows(
    roster: list[dict[str, Any]],
    need_profile: dict[str, Any],
    *,
    items_source: str = "offer_or_signature",
) -> list[dict[str, Any]]:
    need_weights = merge_need_weights(need_profile)
    catalog = need_profile.get("need_catalog") or []
    catalog_by_id = {entry["id"]: entry for entry in catalog if entry.get("id")}

    ordered_ids = (
        [c["id"] for c in catalog if c.get("id") in need_weights]
        if catalog
        else list(need_weights.keys())
    )

    meal_roster = [a for a in roster if not is_merchant_vendor(a)]
    rows: list[dict[str, Any]] = []

    for need_id in ordered_ids:
        entry = catalog_by_id.get(need_id, {})
        vendor_level = bool(entry.get("vendor_level"))
        item_count = 0
        vendor_count = 0
        for applicant in meal_roster:
            if vendor_covers_need(
                applicant, need_id, vendor_level=vendor_level, items_source=items_source,
            ):
                vendor_count += 1
            item_count += count_items_covering_need(
                applicant, need_id, vendor_level=vendor_level, items_source=items_source,
            )

        regional_pct = need_weights.get(need_id, 0.0)
        status = coverage_status(item_count, vendor_count, regional_pct=regional_pct)
        rows.append({
            "id": need_id,
            "label": entry.get("label") or need_id.replace("_", " ").title(),
            "vendor_level": vendor_level,
            "regional_pct": regional_pct,
            "item_count": item_count,
            "vendor_count": vendor_count,
            "status": status,
            "recruiting": status in ("gap", "limited") and regional_pct >= 0.05,
        })

    return rows


def coverage_summary(rows: list[dict[str, Any]], *, max_items: int = 6) -> str:
    """Short human-readable summary for menu header."""
    if not rows:
        return ""
    parts: list[str] = []
    for row in rows:
        if row["status"] == "gap" and row["regional_pct"] >= 0.05:
            parts.append(f"limited {row['label'].lower()} (recruiting)")
        elif row["status"] == "limited" and row["regional_pct"] >= 0.05:
            n = row["vendor_count"] if row["vendor_level"] else row["item_count"]
            unit = "vendor" if row["vendor_level"] else "option"
            suffix = "s" if n != 1 else ""
            parts.append(f"{n} {row['label'].lower()} {unit}{suffix}")
        elif row["status"] == "well_served" and row["regional_pct"] >= 0.05:
            n = row["vendor_count"] if row["vendor_level"] else row["item_count"]
            if n > 0:
                unit = "vendors" if row["vendor_level"] else "options"
                parts.append(f"{n} {row['label'].lower()} {unit}")
    if not parts:
        covered = [r for r in rows if r["item_count"] > 0 or r["vendor_count"] > 0]
        if covered:
            parts = [
                f"{r['item_count'] or r['vendor_count']} {r['label'].lower()}"
                for r in covered[:max_items]
            ]
    return " · ".join(parts[:max_items])


def publish_roster_coverage(
    roster: list[dict[str, Any]],
    need_profile: dict[str, Any],
    *,
    items_source: str = "offer_or_signature",
    computed_at: str | None = None,
) -> dict[str, Any]:
    rows = roster_coverage_rows(roster, need_profile, items_source=items_source)
    gaps = [r for r in rows if r["status"] == "gap" and r["regional_pct"] >= 0.05]
    limited = [r for r in rows if r["status"] == "limited" and r["regional_pct"] >= 0.05]
    return {
        "computed_at": computed_at or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "menu_basis": "committed" if items_source == "offer_or_signature" else items_source,
        "summary": coverage_summary(rows),
        "needs": rows,
        "gap_count": len(gaps),
        "limited_count": len(limited),
        "recruiting": [r["id"] for r in rows if r.get("recruiting")],
    }
