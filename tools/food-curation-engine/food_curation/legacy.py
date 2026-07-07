"""Festival legacy scoring — prior LNY / MAF appearances."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

_ENGINE_ROOT = Path(__file__).resolve().parents[1]
_DEFAULT_LEGACY_PATH = (
    _ENGINE_ROOT.parent.parent
    / "assets/shared/food-curation/seeds/vendor-festival-legacy.json"
)


def prior_season_count(applicant: dict[str, Any]) -> int:
    legacy = applicant.get("festival_legacy") or {}
    if "prior_count" in legacy:
        try:
            return max(0, int(legacy["prior_count"]))
        except (TypeError, ValueError):
            pass
    seasons = legacy.get("seasons") or []
    return len(seasons)


def legacy_score_from_count(count: int) -> float:
    """Tiered 0–1 score from distinct prior festival seasons (LNY + MAF)."""
    if count <= 0:
        return 0.0
    if count == 1:
        return 0.4
    if count == 2:
        return 0.7
    return 1.0


def legacy_score(applicant: dict[str, Any]) -> float:
    return legacy_score_from_count(prior_season_count(applicant))


def attach_vendor_legacy(
    applicants: list[dict[str, Any]],
    legacy_by_id: dict[str, Any] | None = None,
    *,
    legacy_path: Path | None = None,
) -> list[dict[str, Any]]:
    """Merge vendor-festival-legacy.json entries onto applicant records."""
    if legacy_by_id is None:
        path = legacy_path or _DEFAULT_LEGACY_PATH
        if not path.is_file():
            return [dict(a) for a in applicants]
        legacy_by_id = json.loads(path.read_text()).get("by_id") or {}

    out: list[dict[str, Any]] = []
    for app in applicants:
        entry = legacy_by_id.get(app.get("id", ""))
        merged = dict(app)
        if entry:
            merged["festival_legacy"] = {
                "seasons": entry["seasons"],
                "prior_count": entry["prior_count"],
                "matches": entry.get("matches", []),
            }
        else:
            merged.pop("festival_legacy", None)
        out.append(merged)
    return out
