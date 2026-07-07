"""Attendee need weights and tag normalization — shared by selection and gaps."""

from __future__ import annotations

from typing import Any

from food_curation.constants import AUDIENCE_PRESETS, NEED_TAG_ALIASES


def menu_items_for_scoring(applicant: dict[str, Any]) -> list[dict[str, Any]]:
    """Menu lines used for menu-fit, demographic, and need-tag scoring."""
    rec = applicant.get("recommended_menu_items")
    if rec:
        return rec
    return list(applicant.get("signature_menu_items") or [])


def normalize_need_tag(tag: str) -> str:
    return NEED_TAG_ALIASES.get(tag, tag)


def merge_need_weights(profile: dict[str, Any] | None) -> dict[str, float]:
    """Merge dietary + experience need weights from regional-need-profile.json."""
    if not profile:
        return {}
    merged: dict[str, float] = {}
    for key in ("dietary_need_weights", "experience_need_weights", "attendee_need_weights"):
        merged.update(profile.get(key) or {})
    preset = profile.get("audience_preset")
    if preset and preset in AUDIENCE_PRESETS:
        for tag, mult in AUDIENCE_PRESETS[preset].get("need_multipliers", {}).items():
            if tag in merged:
                merged[tag] *= mult
    return merged


def applicant_need_tags(applicant: dict[str, Any]) -> set[str]:
    tags: set[str] = set()
    for d in applicant.get("dietary", []):
        tags.add(normalize_need_tag(d))
    for item in menu_items_for_scoring(applicant):
        for t in item.get("dietary_tags", []):
            tags.add(normalize_need_tag(t))
    return tags
