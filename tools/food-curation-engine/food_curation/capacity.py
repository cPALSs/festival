"""Capacity planning — four lanes: open prep, drinks, snacks, take-home."""

from __future__ import annotations

import math
from copy import deepcopy
from typing import Any

from food_curation.constants import (
    AUDIENCE_PRESETS,
    DRINK_ARCHETYPES,
    DRINK_VENDOR_DEFAULTS,
    OPEN_PREP_ARCHETYPES,
    SNACK_ARCHETYPES,
    SNACK_VENDOR_DEFAULTS,
)


def _normalize_shares(archetypes: list[dict[str, Any]]) -> None:
    total = sum(a["order_share"] for a in archetypes)
    if total <= 0:
        return
    for a in archetypes:
        a["order_share"] /= total


def _archetype_rows_from_constants(tuples: list[tuple]) -> list[dict[str, Any]]:
    rows = []
    for row in tuples:
        aid, label, share, tph, kind, fee, min_slots, examples = row
        rows.append({
            "id": aid,
            "label": label,
            "order_share": share,
            "throughput_hr": tph,
            "booth_kind": kind,
            "fee": fee,
            "min_slots": min_slots,
            "examples": examples,
        })
    return rows


def archetypes_from_constants() -> list[dict[str, Any]]:
    """All archetypes (open prep + drinks) — legacy helper."""
    return _archetype_rows_from_constants(OPEN_PREP_ARCHETYPES + DRINK_ARCHETYPES)


def _apply_audience_preset(
    open_prep: list[dict[str, Any]],
    drinks: list[dict[str, Any]],
    preset: str | None,
    base_food_buy_rate: float,
    base_drink_buy_rate: float,
) -> tuple[float, float]:
    food_buy_rate = base_food_buy_rate
    drink_buy_rate = base_drink_buy_rate
    if not preset or preset not in AUDIENCE_PRESETS:
        return food_buy_rate, drink_buy_rate
    cfg = AUDIENCE_PRESETS[preset]
    food_buy_rate = min(0.95, base_food_buy_rate + cfg.get("food_buy_rate_delta", 0))
    drink_buy_rate = min(0.95, base_drink_buy_rate + cfg.get("drink_buy_rate_delta", 0))
    mults = cfg.get("share_multipliers", {})
    for a in open_prep + drinks:
        m = mults.get(a["id"], 1.0)
        a["order_share"] *= m
    _normalize_shares(open_prep)
    _normalize_shares(drinks)
    return food_buy_rate, drink_buy_rate


def _lane_capacity(
    archetypes: list[dict[str, Any]],
    total_orders: float,
    hours_total: float,
    lane: str,
) -> tuple[list[dict[str, Any]], int, float, dict[str, int]]:
    rows: list[dict[str, Any]] = []
    lane_slots = 0
    lane_capacity = 0.0
    slots_by_archetype: dict[str, int] = {}

    for a in archetypes:
        share = a["order_share"]
        tph = a["throughput_hr"]
        min_slots = a.get("min_slots", 0)
        orders = total_orders * share
        cap_per_slot = tph * hours_total
        slots_math = orders / cap_per_slot if cap_per_slot else 0
        slots = max(math.ceil(slots_math) if orders > 0 else 0, min_slots)
        capacity = slots * cap_per_slot
        utilization = orders / capacity if capacity else 0
        row = {
            **a,
            "lane": lane,
            "orders": orders,
            "cap_per_slot": cap_per_slot,
            "slots_math": slots_math,
            "slots": slots,
            "capacity": capacity,
            "utilization": utilization,
        }
        rows.append(row)
        slots_by_archetype[a["id"]] = slots
        lane_slots += slots
        lane_capacity += capacity

    return rows, lane_slots, lane_capacity, slots_by_archetype


def _snack_rows_from_constants(tuples: list[tuple]) -> list[dict[str, Any]]:
    rows = []
    for row in tuples:
        aid, label, share, max_slots, kind, fee, min_slots, examples = row
        rows.append({
            "id": aid,
            "label": label,
            "vendor_share": share,
            "max_slots": max_slots,
            "booth_kind": kind,
            "fee": fee,
            "min_slots": min_slots,
            "examples": examples,
        })
    return rows


def _allocate_snack_slots(
    archetypes: list[dict[str, Any]],
    total: int,
    *,
    coverage_first: bool = False,
) -> dict[str, int]:
    """Split total snack vendor slots across treat archetypes."""
    if total <= 0:
        return {a["id"]: 0 for a in archetypes}

    if coverage_first:
        slots = {a["id"]: 0 for a in archetypes}
        ordered = sorted(archetypes, key=lambda a: -a["vendor_share"])
        remaining = total
        while remaining > 0:
            progress = False
            for a in ordered:
                if remaining <= 0:
                    break
                cap = a.get("max_slots", 99)
                if slots[a["id"]] < cap:
                    slots[a["id"]] += 1
                    remaining -= 1
                    progress = True
            if not progress:
                break
        return slots

    ideals = {a["id"]: total * a["vendor_share"] for a in archetypes}
    floors = {aid: int(math.floor(val)) for aid, val in ideals.items()}
    assigned = sum(floors.values())
    remainder = total - assigned

    if remainder > 0:
        ranked = sorted(
            ((ideals[aid] - floors[aid], aid) for aid in floors),
            reverse=True,
        )
        for _, aid in ranked:
            if remainder <= 0:
                break
            cap = next(a["max_slots"] for a in archetypes if a["id"] == aid)
            if floors[aid] >= cap:
                continue
            floors[aid] += 1
            remainder -= 1

    for a in archetypes:
        floors[a["id"]] = min(floors[a["id"]], a.get("max_slots", 99))
        floors[a["id"]] = max(floors[a["id"]], a.get("min_slots", 0))

    return floors


def _snack_lane_capacity(
    archetypes: list[dict[str, Any]],
    total_snack_slots: int,
    snack_buyers: float,
    *,
    coverage_first: bool = False,
) -> tuple[list[dict[str, Any]], dict[str, int]]:
    slot_map = _allocate_snack_slots(
        archetypes, total_snack_slots, coverage_first=coverage_first,
    )
    rows: list[dict[str, Any]] = []
    slots_by_archetype: dict[str, int] = {}

    for a in archetypes:
        slots = slot_map.get(a["id"], 0)
        buyers = snack_buyers * a["vendor_share"]
        row = {
            **a,
            "lane": "snacks",
            "orders": buyers,
            "buyers_est": buyers,
            "slots": slots,
            "utilization": (buyers / (slots * 550)) if slots else 0,
        }
        rows.append(row)
        slots_by_archetype[a["id"]] = slots

    return rows, slots_by_archetype


def capacity_plan(
    config: dict[str, Any],
) -> dict[str, Any]:
    """
    Attendance → order demand → slots per lane and archetype.

    Lanes:
    - **open_prep** — meal throughput (handhelds, plates, noodles, BBQ)
    - **drinks** — beverage anchor throughput (boba, sugarcane/aguas)
    - **snacks** — optional treat vendors (vendor-count cap)

    Merchants (sealed take-home food, apparel, crafts) are outside this model.
    """
    attendance = int(config.get("attendance", 6000))
    food_buy_rate = float(config.get("food_buy_rate", 0.40))
    items_per_buyer = float(config.get("items_per_buyer", 1.1))
    hours_per_day = float(config.get("hours_per_day", 6))
    days = int(config.get("festival_days", 2))
    preset = config.get("audience_preset")

    drink_cfg = {**DRINK_VENDOR_DEFAULTS, **(config.get("drink_vendors") or {})}
    drink_buy_rate = float(drink_cfg.get("drink_buy_rate", 0.30))
    drink_items_per_buyer = float(drink_cfg.get("items_per_buyer", 1.0))

    open_prep = deepcopy(config.get("open_prep_archetypes") or _archetype_rows_from_constants(OPEN_PREP_ARCHETYPES))
    drinks = deepcopy(config.get("drink_archetypes") or _archetype_rows_from_constants(DRINK_ARCHETYPES))
    _normalize_shares(open_prep)
    _normalize_shares(drinks)
    food_buy_rate, drink_buy_rate = _apply_audience_preset(
        open_prep, drinks, preset, food_buy_rate, drink_buy_rate,
    )

    snack_cfg = {**SNACK_VENDOR_DEFAULTS, **(config.get("snack_vendors") or {})}
    snack_buy_rate = float(snack_cfg.get("snack_buy_rate", 0.10))
    buyers_per = float(snack_cfg.get("buyers_per_vendor_weekend", 550))
    max_snack = int(snack_cfg.get("max_vendors", 6))
    snack_buyers = attendance * snack_buy_rate
    snack_slots_demand = max(
        0, math.ceil(snack_buyers / buyers_per) if buyers_per else 0,
    )
    coverage_first = bool(snack_cfg.get("coverage_first", False))
    coverage_floor = int(snack_cfg.get("coverage_floor_slots", 0))
    if coverage_first and coverage_floor > 0:
        snack_slots = min(max_snack, max(snack_slots_demand, coverage_floor))
    else:
        snack_slots = min(max_snack, snack_slots_demand)

    snack_policy = {
        "coverage_first": coverage_first,
        "coverage_floor_slots": coverage_floor,
        "slots_demand": snack_slots_demand,
        "viability_mult": float(snack_cfg.get("viability_mult", 2.0)),
        "booth_fee": int(snack_cfg.get("booth_fee", 400)),
    }

    hours_total = hours_per_day * days
    open_prep_orders = attendance * food_buy_rate * items_per_buyer
    drink_orders = attendance * drink_buy_rate * drink_items_per_buyer

    open_rows, open_prep_slots, open_capacity, open_slots_by = _lane_capacity(
        open_prep, open_prep_orders, hours_total, "open_prep",
    )
    drink_rows, drink_slots, drink_capacity, drink_slots_by = _lane_capacity(
        drinks, drink_orders, hours_total, "drinks",
    )

    snack_archetypes = deepcopy(
        config.get("snack_archetypes") or _snack_rows_from_constants(SNACK_ARCHETYPES),
    )
    snack_rows, snack_slots_by = _snack_lane_capacity(
        snack_archetypes, snack_slots, snack_buyers, coverage_first=coverage_first,
    )

    rows = open_rows + drink_rows + snack_rows
    slots_by_archetype = {**open_slots_by, **drink_slots_by, **snack_slots_by}
    total_orders = open_prep_orders + drink_orders
    total_capacity = open_capacity + drink_capacity
    food_slots = open_prep_slots + drink_slots

    return {
        "attendance": attendance,
        "audience_preset": preset,
        "food_buy_rate": food_buy_rate,
        "drink_buy_rate": drink_buy_rate,
        "snack_buy_rate": snack_buy_rate,
        "snack_buyers_est": snack_buyers,
        "snack_slots": snack_slots,
        "snack_slots_demand": snack_slots_demand,
        "snack_policy": snack_policy,
        "open_prep_orders": open_prep_orders,
        "drink_orders": drink_orders,
        "total_orders": total_orders,
        "hours_total": hours_total,
        "open_prep_slots": open_prep_slots,
        "drink_slots": drink_slots,
        "open_slots": open_prep_slots,
        "prepack_slots": drink_slots,
        "meal_slots": food_slots,
        "food_slots": food_slots,
        "open_prep_capacity": open_capacity,
        "drink_capacity": drink_capacity,
        "total_capacity": total_capacity,
        "open_prep_utilization": open_prep_orders / open_capacity if open_capacity else 0,
        "drink_utilization": drink_orders / drink_capacity if drink_capacity else 0,
        "fleet_utilization": total_orders / total_capacity if total_capacity else 0,
        "rows": rows,
        "open_prep_rows": open_rows,
        "drink_rows": drink_rows,
        "snack_rows": snack_rows,
        "slots_by_archetype": slots_by_archetype,
        "attendance_extrapolation": attendance > 20000,
    }


def compute_food_flow(attendance: int, **kwargs: Any) -> dict[str, Any]:
    """Thin wrapper for budget script compatibility."""
    config = {
        "attendance": attendance,
        "food_buy_rate": kwargs.get("buy_rate", 0.40),
        "items_per_buyer": kwargs.get("items_per_buyer", 1.1),
        "hours_per_day": kwargs.get("hours_per_day", 6),
        "festival_days": kwargs.get("days", 2),
    }
    return capacity_plan(config)
