#!/usr/bin/env python3
"""Build LNY 2026 applicant seed — Zeffy raw form primary, Kenrick CSV reconcile."""

from __future__ import annotations

import csv
import json
import os
import re
import sys
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHARED = ROOT.parent.parent
sys.path.insert(0, str(ROOT))

from food_curation.classify import (  # noqa: E402
    classify_item,
    infer_signature_items,
    parse_menu_text,
    signature_limit_for_booth,
)
from food_curation.constants import BOOTH_KIND_MAP  # noqa: E402
from food_curation.menu_enrichment import enrich_menu_items, load_label_overrides  # noqa: E402
from food_curation.vendor_taxonomy import apply_vendor_taxonomy, infer_setup_type  # noqa: E402

CPALSS = ROOT.parents[3]
XLSX_PATH = (
    CPALSS
    / "Projects - Lunar New Year/2026/Business Development"
    / "2026 Lunar New Year Tet Festival & Parade — Vendor_7-5-2026.xlsx"
)
CSV_PATH = (
    CPALSS
    / "Projects - Lunar New Year/2026/Finance & Administration/Vendor Reconciliation"
    / "2026 LNY vendor list/food vendor-Table 1.csv"
)
OUT_DIR = SHARED / "assets" / "shared" / "food-curation" / "seeds"
OVERRIDES_PATH = OUT_DIR / "lny-2026-overrides.json"
VENDOR_NAMES_PATH = OUT_DIR / "lny-2026-vendor-names.json"
CLEANUP_PATH = OUT_DIR / "lny-2026-menu-cleanup.json"
ALIASES_PATH = OUT_DIR / "lny-2026-email-aliases.json"
RESOLUTIONS_PATH = OUT_DIR / "lny-2026-reconciliation-resolutions.json"
SOCIAL_PATH = OUT_DIR / "lny-2026-social.json"
ANOMALIES_PATH = OUT_DIR / "lny-2026-reconciliation-anomalies.json"

DEFAULT_OVERRIDES = {
    "bobette-tea": {"primary_archetype_id": "boba_milk_tea", "vietnamese_anchor": False},
    "boba-meet-up": {"primary_archetype_id": "boba_milk_tea"},
    "zummi-food-llc": {
        "primary_archetype_id": "fast_handheld",
        "vietnamese_anchor": True,
        "elk_grove_based": True,
    },
    "zummi-food": {
        "primary_archetype_id": "fast_handheld",
        "vietnamese_anchor": True,
        "elk_grove_based": True,
    },
    "pizza-lovers-sacramento": {"elk_grove_based": True, "business_city": "Elk Grove"},
    "d-t-kitchen": {"primary_archetype_id": "noodle_wok_soup", "weak_brand": True},
    "bowli-bowli": {"primary_archetype_id": "rice_plates_bowls", "weak_brand": True},
    "sugarcane-hut": {"primary_archetype_id": "sugarcane_fruit_refresher"},
    "ray-s-kitchen": {"primary_archetype_id": "rice_plates_bowls", "dietary": ["halal_certified"]},
    "boba-bros": {"primary_archetype_id": "boba_milk_tea", "vendor_class": "drinks"},
    "brewtik-coffee-and-tea": {"primary_archetype_id": "boba_milk_tea", "vendor_class": "drinks"},
}

FOOD_TICKET_RE = re.compile(r"food|prepackaged food|pre-packaged food", re.I)


def _slug(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return s[:48] or "vendor"


def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").lower()).strip()


def _sim(a: str, b: str) -> float:
    return SequenceMatcher(None, _norm(a), _norm(b)).ratio()


def _emails(raw: str) -> list[str]:
    if not raw or "@" not in raw:
        return []
    parts = re.split(r"\s+and\s+|\s*&\s*|,|;", raw, flags=re.I)
    return [p.strip().lower() for p in parts if "@" in p]


def _business_name(desc: str) -> str:
    m = re.match(r"^([A-Z0-9][A-Za-z0-9'&\s\.]+?)\s*[-–—]", desc)
    if m:
        return m.group(1).strip()
    return desc.split("-")[0].strip()[:60]


def _booth_kind(permit_type: str, size: str) -> str:
    """Legacy booth_kind — prefer setup_type via vendor_taxonomy."""
    from food_curation.vendor_taxonomy import setup_type_to_booth_kind

    return setup_type_to_booth_kind(infer_setup_type(permit_type, size))


def _booth_kind_from_zeffy(ticket: str, setup: str, kenrick_kind: str | None) -> str:
    if kenrick_kind:
        return kenrick_kind
    from food_curation.vendor_taxonomy import setup_type_to_booth_kind

    return setup_type_to_booth_kind(infer_setup_type("", "", zeffy_ticket=ticket, zeffy_setup=setup))


def _capability_from_cleanup(vendor_id: str, rows: list[dict]) -> list[dict]:
    items = []
    for i, row in enumerate(rows):
        name = row["name"]
        arch, cat = classify_item(name)
        items.append({
            "item_id": f"{vendor_id}-item-{i}",
            "name": name[:120],
            "category": row.get("category") or cat,
            "archetype_id": arch,
            "allergens": [],
            "dietary_tags": [],
        })
    return items


def _capability_from_menu_text(menu_text: str, vendor_id: str, business_name: str) -> list[dict]:
    text = menu_text.strip()
    if not text:
        return []
    if " - " not in text and len(text) < 200:
        text = f"{business_name} - {text}"
    return parse_menu_text(text, vendor_id)


def _load_aliases() -> dict[str, list[str]]:
    if not ALIASES_PATH.exists():
        return {}
    raw = json.loads(ALIASES_PATH.read_text())
    out: dict[str, list[str]] = {}
    for key, val in raw.items():
        if key.startswith("_"):
            continue
        emails = _emails(key) or [key.lower()]
        aliases = val if isinstance(val, list) else [val]
        for e in emails:
            out[e] = [a.lower() for a in aliases]
    return out


def _venv_python() -> Path:
    return ROOT / ".venv" / "bin" / "python"


def _running_in_tool_venv() -> bool:
    return Path(sys.prefix).resolve() == (ROOT / ".venv").resolve()


def _reexec_in_tool_venv() -> None:
    """Re-run this script with the local tool venv when openpyxl is missing."""
    if _running_in_tool_venv():
        return
    venv_py = _venv_python()
    if not venv_py.is_file():
        return
    os.execv(str(venv_py), [str(venv_py), *sys.argv])


def load_zeffy_rows() -> tuple[list[dict], list[dict]]:
    try:
        import openpyxl
    except ImportError as exc:
        _reexec_in_tool_venv()
        raise SystemExit(
            "openpyxl not found. Run ./scripts/build_lny_2026_seed.sh "
            "(creates .venv and installs requirements.txt)"
        ) from exc

    wb = openpyxl.load_workbook(XLSX_PATH, read_only=True, data_only=True)
    ws = wb["Export"]
    food_rows = []
    all_rows = []
    for r in ws.iter_rows(min_row=2, values_only=True):
        if not r or not any(r):
            continue
        ticket = (r[4] or "").strip()
        row = {
            "business_name": (r[5] or "").strip(),
            "email": (r[2] or "").strip().lower(),
            "ticket": ticket,
            "ticket_no": str(r[3] or ""),
            "menu_text": (r[8] or "").strip(),
            "status": (r[18] or "").strip(),
            "setup": (r[10] or "").strip() if len(r) > 10 else "",
            "generator": (r[9] or "").strip() if len(r) > 9 else "",
            "slug": _slug((r[5] or "").strip()),
            "is_food_ticket": bool(FOOD_TICKET_RE.search(ticket)),
        }
        all_rows.append(row)
        if row["is_food_ticket"]:
            food_rows.append(row)
    return food_rows, all_rows


def load_kenrick_rows() -> list[dict]:
    rows = []
    with CSV_PATH.open(newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader, None)
        for row in reader:
            if len(row) < 8:
                continue
            assignment = row[2].strip() if len(row) > 2 else ""
            if not assignment or assignment.lower().startswith("2nd"):
                continue
            desc = row[7].strip() if len(row) > 7 else ""
            if not desc or desc.lower() in ("2nd 10x20 space", "2nd 10x10 space"):
                continue
            biz = _business_name(desc)
            vid = _slug(biz)
            if vid == "2nd-10x10-space":
                continue
            permit = row[8].strip() if len(row) > 8 else ""
            size = row[10].strip() if len(row) > 10 else ""
            rows.append({
                "id": vid,
                "assignment": assignment,
                "business_name": biz,
                "email_raw": row[4].strip() if len(row) > 4 else "",
                "emails": _emails(row[4].strip() if len(row) > 4 else ""),
                "menu_text": re.sub(r"^[^-]+-\s*", "", desc, count=1).strip(),
                "full_desc": desc,
                "permit": permit,
                "size": size,
                "setup_type": infer_setup_type(permit, size),
                "booth_kind": _booth_kind(permit, size),
                "contact": row[3].strip() if len(row) > 3 else "",
            })
    return rows


def _find_zeffy(
    kenrick: dict,
    zeffy_food: list[dict],
    zeffy_all: list[dict],
    aliases: dict[str, list[str]],
) -> tuple[dict | None, dict | None]:
    """Return (food_ticket_row, any_ticket_row_by_email)."""
    search = set(kenrick["emails"])
    for e in list(search):
        search.update(aliases.get(e, []))
        # Kenrick hotmail vs Zeffy gmail typo pattern
        local = e.split("@")[0]
        for z in zeffy_all:
            if z["email"].split("@")[0] == local:
                search.add(z["email"])

    food_match = None
    any_match = None
    for z in zeffy_all:
        if z["email"] in search:
            any_match = z
            if z["is_food_ticket"]:
                food_match = z
    if food_match:
        return food_match, any_match

    best = None
    best_score = 0.0
    for z in zeffy_food:
        score = _sim(z["business_name"], kenrick["business_name"])
        if score > best_score:
            best_score = score
            best = z
    if best_score >= 0.82:
        return best, any_match or best
    return None, any_match


def _load_resolutions() -> dict:
    if not RESOLUTIONS_PATH.exists():
        return {}
    raw = json.loads(RESOLUTIONS_PATH.read_text())
    return {k: v for k, v in raw.items() if not k.startswith("_")}


def _load_vendor_names() -> dict[str, str]:
    if not VENDOR_NAMES_PATH.exists():
        return {}
    raw = json.loads(VENDOR_NAMES_PATH.read_text())
    return {k: v for k, v in raw.items() if not k.startswith("_") and isinstance(v, str)}


def _resolve_business_name(
    vid: str,
    default: str,
    vendor_names: dict[str, str],
    vendor_cleanup: dict,
    ovr: dict,
) -> str:
    if vid in vendor_names:
        return vendor_names[vid]
    if vendor_cleanup.get("business_name"):
        return vendor_cleanup["business_name"]
    if ovr.get("business_name"):
        return ovr["business_name"]
    return (default or "").strip()


def _finalize_menus(
    app: dict,
    vendor_cleanup: dict,
    ovr: dict,
) -> None:
    """Clean labels, infer dietary tags, refresh signatures from enriched capability."""
    cap = enrich_menu_items(
        app["capability_menu_items"],
        app["id"],
        app.get("dietary") or [],
    )
    app["capability_menu_items"] = cap
    explicit_sig = vendor_cleanup.get("signature_item_ids") or ovr.get("signature_item_ids")
    app["signature_menu_items"] = infer_signature_items(
        cap,
        app["booth_kind"],
        primary_archetype=app.get("primary_archetype_id") or ovr.get("primary_archetype_id"),
        explicit_item_ids=explicit_sig,
    )


def _append_capability(cap: list[dict], vendor_id: str, rows: list[dict]) -> list[dict]:
    cap = list(cap)
    existing = {_norm(i["name"]) for i in cap}
    idx = len(cap)
    for row in rows:
        name = row["name"]
        if _norm(name) in existing:
            continue
        arch, cat = classify_item(name)
        iid = row.get("item_id") or f"{vendor_id}-item-s{idx}"
        cap.append({
            "item_id": iid,
            "name": name[:120],
            "category": row.get("category") or cat,
            "archetype_id": arch,
            "allergens": [],
            "dietary_tags": [],
        })
        existing.add(_norm(name))
        idx += 1
    return cap


def _canonical_email(k: dict, z: dict | None, resolutions: dict) -> str:
    for canonical, _ in resolutions.get("canonical_email", {}).items():
        kemails = set(k.get("emails", []))
        if z and z.get("email"):
            kemails.add(z["email"])
        aliases = resolutions.get("canonical_email", {})
        for key, val in aliases.items():
            if kemails & set([key.lower()] + [a.lower() for a in (val if isinstance(val, list) else [val])]):
                return key.lower()
    if z and z.get("email"):
        return z["email"]
    return k.get("email_raw", "")


def _build_applicant_from_zeffy(
    z: dict,
    *,
    status: str,
    application_outcome: str,
    overrides: dict,
    cleanup: dict,
    primary_archetype_id: str | None = None,
) -> dict | None:
    if not z.get("menu_text"):
        return None
    vid = z["slug"]
    booth_kind = _booth_kind_from_zeffy(z["ticket"], z.get("setup", ""), None)
    cap = _capability_from_menu_text(z["menu_text"], vid, z["business_name"])
    if not cap:
        return None
    ovr = dict(overrides.get(vid, {}))
    if primary_archetype_id:
        ovr["primary_archetype_id"] = primary_archetype_id
    limit = signature_limit_for_booth(booth_kind)
    app = {
        "id": vid,
        "business_name": z["business_name"],
        "booth_label": None,
        "booth_kind": booth_kind,
        "deposit_applied_at": None,
        "capability_menu_items": cap,
        "signature_menu_items": [],
        "signature_limit": limit,
        "primary_archetype_id": ovr.get("primary_archetype_id"),
        "dietary": ovr.get("dietary", []),
        "booth_fee": 750 if booth_kind != "prepack" else 500,
        "status": status,
        "manual_accepted_2026": False,
        "application_outcome": application_outcome,
        "signatures_simulated_q2": True,
        "provenance": {
            "menu_source": "zeffy",
            "zeffy_email": z["email"],
            "zeffy_status": z.get("status"),
            "kenrick_email": None,
            "pool": "extra_cap_decline_or_withdrew",
        },
    }
    if ovr:
        merge = {k2: v for k2, v in ovr.items() if k2 != "signature_item_ids"}
        app.update(merge)
    _finalize_menus(app, cleanup.get(vid, {}), ovr)
    return apply_vendor_taxonomy(
        app,
        cleanup=cleanup.get(vid, {}),
        zeffy_ticket=z.get("ticket", ""),
        zeffy_setup=z.get("setup", ""),
    )


def build_seed() -> tuple[list[dict], list[dict]]:
    overrides = DEFAULT_OVERRIDES
    if OVERRIDES_PATH.exists():
        overrides = {**DEFAULT_OVERRIDES, **json.loads(OVERRIDES_PATH.read_text())}

    cleanup = {}
    if CLEANUP_PATH.exists():
        raw = json.loads(CLEANUP_PATH.read_text())
        cleanup = {k: v for k, v in raw.items() if not k.startswith("_")}
    load_label_overrides(cleanup)
    vendor_names = _load_vendor_names()

    resolutions = _load_resolutions()
    exclude_ids = set(resolutions.get("exclude_vendor_ids", []))
    force_menu = resolutions.get("force_menu_source", {})

    aliases = _load_aliases()
    zeffy_food, zeffy_all = load_zeffy_rows()
    zeffy_by_email = {z["email"]: z for z in zeffy_all}
    kenrick_rows = load_kenrick_rows()
    anomalies: list[dict] = []
    used_zeffy: set[str] = set()

    applicants = []
    for k in kenrick_rows:
        vid = k["id"]
        if vid in exclude_ids:
            continue

        z, z_any = _find_zeffy(k, zeffy_food, zeffy_all, aliases)
        if z:
            used_zeffy.add(z["email"])

        menu_source = "kenrick"
        menu_text = k["menu_text"]
        business_name = k["business_name"]

        if force_menu.get(vid) == "kenrick":
            menu_text = k["menu_text"]
            menu_source = "kenrick_resolved"
        elif z and z["menu_text"]:
            menu_text = z["menu_text"]
            menu_source = "zeffy"
        elif z_any and z_any.get("menu_text"):
            menu_text = z_any["menu_text"]
            menu_source = "zeffy_non_food_ticket"

        if z and _sim(z["business_name"], k["business_name"]) < 0.75:
            anomalies.append({
                "severity": "info",
                "type": "name_mismatch",
                "resolved": True,
                "booth": k["assignment"],
                "kenrick_name": k["business_name"],
                "zeffy_name": z["business_name"],
                "action": "Using Kenrick business name for fielded vendor.",
            })
        elif not z and not z_any:
            anomalies.append({
                "severity": "info",
                "type": "kenrick_only",
                "resolved": True,
                "booth": k["assignment"],
                "business_name": k["business_name"],
                "action": "Paper-form application — Kenrick menu authoritative (staff approved).",
            })

        if (
            z
            and k["menu_text"]
            and z["menu_text"]
            and _sim(z["menu_text"], k["menu_text"]) < 0.45
            and force_menu.get(vid) != "kenrick"
            and vid not in cleanup
        ):
            anomalies.append({
                "severity": "info",
                "type": "menu_mismatch",
                "resolved": vid in ("boba-meet-up", "bobette-tea"),
                "booth": k["assignment"],
                "business_name": business_name,
                "menu_used": menu_source,
                "action": "Resolved per lny-2026-reconciliation-resolutions.json",
            })

        vendor_cleanup = cleanup.get(vid, {})
        ovr = overrides.get(vid, {})
        business_name = _resolve_business_name(
            vid,
            business_name,
            vendor_names,
            vendor_cleanup,
            ovr,
        )
        if vendor_cleanup.get("capability_menu_items"):
            cap = _capability_from_cleanup(vid, vendor_cleanup["capability_menu_items"])
            menu_source = "cleanup_resolved"
        else:
            cap = _capability_from_menu_text(menu_text, vid, business_name)

        if vendor_cleanup.get("append_capability_items"):
            cap = _append_capability(cap, vid, vendor_cleanup["append_capability_items"])

        if not cap and k["menu_text"]:
            cap = _capability_from_menu_text(k["menu_text"], vid, business_name)
            menu_source = "kenrick_fallback"

        booth_kind = k["booth_kind"]
        limit = signature_limit_for_booth(booth_kind)

        email = _canonical_email(k, z or z_any, resolutions)

        app = {
            "id": vid,
            "business_name": business_name,
            "booth_label": k["assignment"],
            "booth_kind": booth_kind,
            "deposit_applied_at": None,
            "capability_menu_items": cap,
            "signature_menu_items": [],
            "signature_limit": limit,
            "primary_archetype_id": None,
            "dietary": [],
            "booth_fee": 750 if booth_kind != "prepack" else 500,
            "status": "submitted",
            "manual_accepted_2026": True,
            "signatures_simulated_q2": True,
            "provenance": {
                "menu_source": menu_source,
                "zeffy_email": (z or z_any or {}).get("email"),
                "zeffy_status": (z or z_any or {}).get("status"),
                "kenrick_email": k["email_raw"],
                "canonical_email": email,
                "kenrick_contact": k["contact"],
            },
        }
        if vid in overrides:
            merge = {k2: v for k2, v in overrides[vid].items() if k2 != "signature_item_ids"}
            app.update(merge)
        social_vendors = _load_social_vendors()
        social_entry = social_vendors.get(vid)
        if social_entry:
            if social_entry.get("instagram_handle"):
                app["instagram_handle"] = social_entry["instagram_handle"]
            if "instagram_followers" in social_entry:
                app["instagram_followers"] = social_entry["instagram_followers"]
        if vendor_cleanup.get("primary_archetype_id"):
            app["primary_archetype_id"] = vendor_cleanup["primary_archetype_id"]
        _finalize_menus(app, vendor_cleanup, ovr)
        app = apply_vendor_taxonomy(
            app,
            cleanup=vendor_cleanup,
            permit=k.get("permit", ""),
            size=k.get("size", ""),
            zeffy_ticket=(z or z_any or {}).get("ticket", ""),
            zeffy_setup=(z or z_any or {}).get("setup", ""),
        )
        applicants.append(app)

    seen_extra: set[str] = set()
    for spec in resolutions.get("extra_pool", []):
        email = spec["zeffy_email"].lower()
        if spec.get("dedupe_by_email") and email in seen_extra:
            continue
        z = zeffy_by_email.get(email)
        if not z:
            continue
        seen_extra.add(email)
        used_zeffy.add(email)
        app = _build_applicant_from_zeffy(
            z,
            status=spec["status"],
            application_outcome=spec["application_outcome"],
            overrides=overrides,
            cleanup=cleanup,
            primary_archetype_id=spec.get("primary_archetype_id"),
        )
        if app:
            if spec.get("primary_archetype_id"):
                app["primary_archetype_id"] = spec["primary_archetype_id"]
            vid = app["id"]
            app["business_name"] = _resolve_business_name(
                vid,
                app["business_name"],
                vendor_names,
                cleanup.get(vid, {}),
                overrides.get(vid, {}),
            )
            applicants.append(app)

    social_vendors = _load_social_vendors()
    if social_vendors:
        _apply_social_to_applicants(applicants, social_vendors)

    for z in zeffy_food:
        if z["email"] in used_zeffy:
            continue
        anomalies.append({
            "severity": "medium",
            "type": "zeffy_only_unresolved",
            "business_name": z["business_name"],
            "email": z["email"],
            "action": "Not in seed — review if needed.",
        })

    return applicants, anomalies


def _apply_social_to_applicants(applicants: list[dict], vendors: dict) -> int:
    """Merge lny-2026-social.json fields into applicant records."""
    updated = 0
    for app in applicants:
        entry = vendors.get(app.get("id"))
        if not entry:
            continue
        handle = entry.get("instagram_handle")
        if handle:
            app["instagram_handle"] = handle
        if "instagram_followers" in entry:
            app["instagram_followers"] = entry["instagram_followers"]
        updated += 1
    return updated


def _load_social_vendors() -> dict:
    if not SOCIAL_PATH.exists():
        return {}
    return json.loads(SOCIAL_PATH.read_text()).get("vendors") or {}


def _write_anomalies_md(anomalies: list[dict], path: Path) -> None:
    lines = [
        "# LNY 2026 vendor data — reconciliation anomalies",
        "",
        "Primary source: Zeffy export `2026 Lunar New Year Tet Festival & Parade — Vendor_7-5-2026.xlsx`",
        "Reconcile: Kenrick `food vendor-Table 1.csv` (booth assignment, field roster)",
        "",
        "**Policy:** Zeffy raw form primary; Kenrick reconciles booth assignment. Staff resolutions: `lny-2026-reconciliation-resolutions.json`.",
        "",
        f"Open anomalies: **{len([a for a in anomalies if not a.get('resolved')])}** · Resolved/info: **{len([a for a in anomalies if a.get('resolved')])}**",
        "",
    ]
    by_type: dict[str, list[dict]] = {}
    for a in anomalies:
        by_type.setdefault(a["type"], []).append(a)

    titles = {
        "menu_mismatch": "Menu mismatch (Zeffy vs Kenrick)",
        "name_mismatch": "Business name mismatch",
        "kenrick_only": "Kenrick field vendor — no Zeffy match",
        "zeffy_only": "Zeffy food application — not on Kenrick field roster",
        "setup_mismatch": "Booth setup / ticket type mismatch",
        "zeffy_canceled": "Zeffy canceled but Kenrick fielded",
    }
    for typ, items in sorted(by_type.items()):
        lines.append(f"## {titles.get(typ, typ)} ({len(items)})")
        lines.append("")
        for a in items:
            booth = a.get("booth", "—")
            name = a.get("business_name") or a.get("kenrick_name") or "?"
            lines.append(f"### {booth} — {name}")
            lines.append(f"- **Severity:** {a.get('severity')}")
            for key in sorted(a.keys()):
                if key in ("type", "severity", "action", "business_name", "booth", "kenrick_name"):
                    continue
                val = a[key]
                if val:
                    lines.append(f"- **{key.replace('_', ' ').title()}:** {val}")
            lines.append(f"- **Suggested action:** {a.get('action', 'Review')}")
            lines.append("")
    path.write_text("\n".join(lines))


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    applicants, anomalies = build_seed()
    out = OUT_DIR / "lny-2026-applicants.json"
    meta = {
        "source_primary": str(XLSX_PATH),
        "source_reconcile": str(CSV_PATH),
        "resolutions": str(RESOLUTIONS_PATH),
        "vendor_names": str(VENDOR_NAMES_PATH),
        "count": len(applicants),
        "fielded_2026": len([a for a in applicants if a.get("manual_accepted_2026")]),
        "pool_total": len(applicants),
        "signatures_note": "Q1=capability · Q2=simulated signatures · see resolutions file",
    }
    out.write_text(json.dumps({"meta": meta, "applicants": applicants}, indent=2))
    ANOMALIES_PATH.write_text(json.dumps({"count": len(anomalies), "items": anomalies}, indent=2))
    _write_anomalies_md(anomalies, OUT_DIR / "lny-2026-reconciliation-anomalies.md")
    print(f"Wrote {len(applicants)} applicants to {out}")
    print(f"Wrote {len(anomalies)} anomalies to {ANOMALIES_PATH.name}")


if __name__ == "__main__":
    main()
