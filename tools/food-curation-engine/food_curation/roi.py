"""Vendor ROI estimates."""

from __future__ import annotations

from typing import Any


def vendor_roi(
    accepted: list[dict[str, Any]],
    capacity: dict[str, Any],
    avg_ticket: float = 15.0,
    viability_mult: float = 3.0,
) -> list[dict[str, Any]]:
    results = []
    slots_by = capacity.get("slots_by_archetype", {})
    total_orders = capacity.get("total_orders", 0)
    rows = {r["id"]: r for r in capacity.get("rows", [])}

    by_arch: dict[str, list] = {}
    for a in accepted:
        arch = a.get("inferred_primary_archetype_id") or a.get("primary_archetype_id") or "unknown"
        by_arch.setdefault(arch, []).append(a)

    for arch, vendors in by_arch.items():
        row = rows.get(arch)
        share = row["order_share"] if row else 0.05
        slots = max(slots_by.get(arch, 1), len(vendors))
        pool = total_orders * share * avg_ticket
        per_vendor = pool / slots
        for a in vendors:
            fee = a.get("booth_fee", 750)
            viable = per_vendor >= fee * viability_mult
            results.append({
                "id": a.get("id"),
                "business_name": a.get("business_name"),
                "archetype_id": arch,
                "expected_gross": round(per_vendor, 0),
                "booth_fee": fee,
                "viable": viable,
                "viability_threshold": fee * viability_mult,
            })
    return results
