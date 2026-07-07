#!/usr/bin/env python3
"""Match prior-season vendor rosters to LNY 2026 applicant IDs."""

from __future__ import annotations

import json
import re
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHARED = ROOT.parent.parent
SEEDS = SHARED / "assets" / "shared" / "food-curation" / "seeds"
SOURCES_PATH = SEEDS / "vendor-festival-legacy-sources.json"
APPLICANTS_PATH = SEEDS / "lny-2026-applicants.json"
NAMES_PATH = SEEDS / "lny-2026-vendor-names.json"
OUT_PATH = SEEDS / "vendor-festival-legacy.json"


def _norm_name(s: str) -> str:
    s = (s or "").lower()
    s = re.sub(r"[_]+", " ", s)
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    s = re.sub(r"\bnew vendors?\b", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def _slug(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return s[:48] or "vendor"


def _sim(a: str, b: str) -> float:
    return SequenceMatcher(None, _norm_name(a), _norm_name(b)).ratio()


def _emails(raw: str | None) -> list[str]:
    if not raw or "@" not in raw:
        return []
    return [raw.strip().lower()]


def _applicant_emails(app: dict) -> set[str]:
    out: set[str] = set()
    prov = app.get("provenance") or {}
    for key in ("canonical_email", "zeffy_email", "kenrick_email"):
        out.update(_emails(prov.get(key)))
    return out


def _load_display_names() -> dict[str, str]:
    if not NAMES_PATH.exists():
        return {}
    raw = json.loads(NAMES_PATH.read_text())
    return {k: v for k, v in raw.items() if not k.startswith("_")}


def _build_lookup(applicants: list[dict], id_aliases: dict[str, list[str]]) -> dict[str, str]:
    """Map normalized name/email/slug -> applicant id."""
    display = _load_display_names()
    lookup: dict[str, str] = {}

    def add(key: str, app_id: str) -> None:
        k = key.strip().lower()
        if k:
            lookup[k] = app_id

    for app in applicants:
        app_id = app["id"]
        names = [app.get("business_name") or "", display.get(app_id, "")]
        for alias_list in id_aliases.get(app_id, []):
            names.append(alias_list)
        for name in names:
            if not name:
                continue
            add(_norm_name(name), app_id)
            add(_slug(name), app_id)
        for email in _applicant_emails(app):
            add(email, app_id)

    for app_id, aliases in id_aliases.items():
        for alias in aliases:
            add(_norm_name(alias), app_id)
            add(_slug(alias), app_id)

    return lookup


def _match_vendor(
    vendor: dict,
    lookup: dict[str, str],
    applicants: list[dict],
    threshold: float = 0.86,
) -> tuple[str | None, str]:
    email = (vendor.get("email") or "").strip().lower()
    if email and email in lookup:
        return lookup[email], "email"

    for name_key in ("name", "name_alt"):
        raw = vendor.get(name_key)
        if not raw:
            continue
        norm = _norm_name(raw)
        if norm in lookup:
            return lookup[norm], f"name:{name_key}"
        slug = _slug(raw)
        if slug in lookup:
            return lookup[slug], f"slug:{name_key}"

    best_id: str | None = None
    best_score = 0.0
    names = [vendor.get("name") or "", vendor.get("name_alt") or ""]
    for app in applicants:
        app_name = app.get("business_name") or ""
        for vn in names:
            if not vn:
                continue
            score = _sim(vn, app_name)
            if score > best_score:
                best_score = score
                best_id = app["id"]
    if best_id and best_score >= threshold:
        return best_id, f"fuzzy:{best_score:.2f}"
    return None, "unmatched"


def main() -> None:
    sources = json.loads(SOURCES_PATH.read_text())
    applicants = json.loads(APPLICANTS_PATH.read_text())["applicants"]
    id_aliases = sources.get("id_aliases") or {}
    lookup = _build_lookup(applicants, id_aliases)

    by_id: dict[str, dict] = {}
    unmatched: list[dict] = []

    for season, vendors in (sources.get("seasons") or {}).items():
        for vendor in vendors:
            app_id, method = _match_vendor(vendor, lookup, applicants)
            if not app_id:
                unmatched.append({"season": season, **vendor})
                continue
            entry = by_id.setdefault(app_id, {"seasons": [], "matches": []})
            if season not in entry["seasons"]:
                entry["seasons"].append(season)
            entry["matches"].append({
                "season": season,
                "source_name": vendor.get("name"),
                "method": method,
            })

    for app_id, entry in by_id.items():
        entry["seasons"].sort()
        entry["prior_count"] = len(entry["seasons"])

    out = {
        "meta": {
            **sources.get("meta", {}),
            "sources_file": SOURCES_PATH.name,
            "applicants_file": APPLICANTS_PATH.name,
            "matched_applicants": len(by_id),
            "unmatched_vendor_rows": len(unmatched),
        },
        "by_id": by_id,
        "unmatched": unmatched,
    }
    OUT_PATH.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")
    print(f"Wrote {OUT_PATH.name}: {len(by_id)} applicants with prior seasons")
    if unmatched:
        print(f"  {len(unmatched)} vendor rows unmatched (expected for vendors not in 2026 pool)")


if __name__ == "__main__":
    main()
