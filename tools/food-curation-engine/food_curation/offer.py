"""Conditional offers and offer letters."""

from __future__ import annotations

from datetime import date
from typing import Any

from food_curation.classify import signature_limit_for_booth


def validate_offer_menu(
    applicant: dict[str, Any],
    offered_item_ids: list[str],
) -> list[str]:
    errors = []
    capability = {i["item_id"]: i for i in applicant.get("capability_menu_items", [])}
    limit = applicant.get("signature_limit") or signature_limit_for_booth(
        applicant.get("booth_kind", "open_cooking")
    )
    if len(offered_item_ids) > limit:
        errors.append(f"Offer exceeds signature limit ({limit})")
    for iid in offered_item_ids:
        if iid not in capability:
            errors.append(f"Item {iid} not in vendor capability")
    return errors


def validate_committed_menu(
    applicant: dict[str, Any],
    committed_item_ids: list[str],
) -> list[str]:
    """Vendor committed menu must be a subset of capability (same rules as offer)."""
    return validate_offer_menu(applicant, committed_item_ids)


def menu_items_for_publication(
    applicant: dict[str, Any],
    *,
    items_source: str = "offer_or_signature",
) -> list[dict[str, Any]]:
    """Guest-facing menu items — vendor committed list when recorded, else signatures."""
    if items_source == "capability":
        return applicant.get("capability_menu_items", [])
    offer = applicant.get("conditional_offer") or {}
    if offer.get("status") == "accepted" and offer.get("committed_menu_items"):
        return offer["committed_menu_items"]
    return applicant.get("signature_menu_items", [])


def build_offer_letter(
    applicant: dict[str, Any],
    festival_name: str,
    offered_item_ids: list[str],
    conditions: list[str] | None = None,
    accept_by: str | None = None,
) -> dict[str, Any]:
    capability = {i["item_id"]: i for i in applicant.get("capability_menu_items", [])}
    offered_items = [capability[iid] for iid in offered_item_ids if iid in capability]
    errors = validate_offer_menu(applicant, offered_item_ids)
    arch = applicant.get("inferred_primary_archetype_id") or applicant.get("primary_archetype_id", "")
    booth = applicant.get("booth_kind", "open_cooking")
    accept_date = accept_by or str(date.today())

    menu_lines = "\n".join(
        f"- {it['name']}" + (f" — ${it['price']}" if it.get("price") else "")
        for it in offered_items
    )
    cond_lines = "\n".join(f"- {c}" for c in (conditions or [
        "Focus prep and signage on the menu items listed above",
        "No specialty drinks if assigned hot food slot",
        "Signage must match registered business name",
    ]))

    letter = f"""We are pleased to offer **{applicant.get('business_name', 'Vendor')}** a **{arch.replace('_', ' ')}** / **{booth.replace('_', ' ')}** slot at **{festival_name}**.

**Highly recommended festival menu** (curated from your capability for roster mix and smart ingredient planning):
{menu_lines}

**Additional notes:**
{cond_lines}

Items must come from your listed capability. Additional items require written approval before we add them to the public menu.

This is our recommended focus for the weekend — it helps you buy for what guests will see online and reduces unused inventory. You may bring broader capability; we ask that you prioritize these items for prep and service.

After you accept, **confirm the items you will actually sell** (you may remove items from this list). **Only your confirmed items appear on the public festival food page** — our guest discovery layer before and during the event.

Accept by **{accept_date}** to proceed to booth fee payment. Decline releases your waitlist position.
"""

    return {
        "status": "draft" if errors else "draft",
        "offered_menu_items": offered_items,
        "offered_item_ids": offered_item_ids,
        "conditions": conditions or [],
        "archetype_slot": arch,
        "booth_kind": booth,
        "offer_letter_md": letter,
        "validation_errors": errors,
    }
