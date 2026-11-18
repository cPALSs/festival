#!/usr/bin/env python3
"""NWS-backed weather cancel/modify decision aid for outdoor festivals.

Fetches alerts + forecast from api.weather.gov (no API key). Prints JSON.
Humans own cancel calls — this only recommends a posture.

Examples:
  python3 nws_cancel_aid.py --venue venues/eglny-elk-grove.json
  python3 nws_cancel_aid.py --lat 38.4086 --lon -121.3716 --name "My Park"
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

BASE = "https://api.weather.gov"
HERE = Path(__file__).resolve().parent
DEFAULT_POLICY = HERE / "policy.defaults.json"
DEFAULT_UA = "festival-season-network-weather-cancel-aid (contact@cpalss.com)"


def get_json(url: str, user_agent: str) -> Any:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": user_agent, "Accept": "application/geo+json"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def mph_from_wind_speed(text: str | None) -> int | None:
    if not text:
        return None
    nums = []
    for tok in text.replace("mph", "").replace(",", " ").split():
        try:
            nums.append(int(tok))
        except ValueError:
            continue
    return max(nums) if nums else None


def classify(alerts: list[dict], periods: list[dict], policy: dict) -> dict[str, Any]:
    th = policy.get("thresholds") or {}
    wind_cancel = int(th.get("wind_cancel_mph", 25))
    pop_modified = int(th.get("modified_precip_chance_min", 70))
    treat_wind_adv = bool(th.get("treat_wind_advisory_as_cancel", True))
    treat_flood_adv = bool(th.get("treat_flood_advisory_as_modified", True))
    cancel_subs = [s.lower() for s in (th.get("cancel_event_substrings") or [])]
    warning_suffixes = [s.lower() for s in (th.get("warning_event_suffixes") or ["Warning"])]

    event_names = [a.get("event") or "" for a in alerts]
    severities = [a.get("severity") or "" for a in alerts]
    lower_blob = " | ".join(e.lower() for e in event_names)

    warning_events = [
        e for e in event_names if any(e.lower().endswith(suf) for suf in warning_suffixes)
    ]
    wind_advisory = any("wind" in e.lower() and "advisory" in e.lower() for e in event_names)
    flood_advisory = any("flood" in e.lower() and "advisory" in e.lower() for e in event_names)

    near = periods[:4] if periods else []
    max_wind = 0
    max_precip_chance = 0
    rainy_names: list[str] = []
    for p in near:
        w = mph_from_wind_speed(p.get("windSpeed"))
        if w is not None:
            max_wind = max(max_wind, w)
        pop = (p.get("probabilityOfPrecipitation") or {}).get("value")
        if isinstance(pop, (int, float)):
            max_precip_chance = max(max_precip_chance, int(pop))
        sf = (p.get("shortForecast") or "").lower()
        if any(k in sf for k in ("rain", "shower", "storm", "thunder")):
            rainy_names.append(p.get("name") or "?")

    reasons: list[str] = []
    posture = "clear"

    if any(k in lower_blob for k in cancel_subs) or warning_events:
        posture = "severe_cancel"
        reasons.append("NWS Warning-class or named severe hazard active for venue point")
    elif (treat_wind_adv and wind_advisory) or max_wind >= wind_cancel:
        posture = "severe_cancel"
        if wind_advisory:
            reasons.append(
                f"Wind Advisory (or stronger) — default cancel band is ≥{wind_cancel} mph / unsafe tents"
            )
        if max_wind >= wind_cancel:
            reasons.append(f"Near-term forecast wind up to ~{max_wind} mph (≥{wind_cancel} mph cancel band)")
    elif (treat_flood_adv and flood_advisory) or max_precip_chance >= pop_modified or rainy_names:
        posture = "modified"
        if flood_advisory:
            reasons.append("Flood Advisory — low-lying / poor drainage ponding risk")
        if max_precip_chance >= pop_modified:
            reasons.append(f"Precip chance up to {max_precip_chance}% in next periods")
        if rainy_names:
            reasons.append("Rain in near-term periods: " + ", ".join(rainy_names[:4]))
    else:
        reasons.append("No cancel-tier alerts; low near-term precip/wind signal")

    if any(s.lower() in ("extreme", "severe") for s in severities) and posture != "severe_cancel":
        posture = "severe_cancel"
        reasons.append("Alert severity Extreme/Severe")

    labels = policy.get("postures") or {}
    return {
        "posture": posture,
        "posture_label": labels.get(posture, posture),
        "reasons": reasons,
        "signals": {
            "active_events": event_names,
            "max_near_term_wind_mph": max_wind or None,
            "max_near_term_precip_chance": max_precip_chance or None,
            "rainy_periods": rainy_names,
        },
        "human_rule": (
            "Tool recommends posture only. Full cancel / early close = festival director "
            "+ incident command (or your org's equivalent). Do not publish cancel copy from automation alone."
        ),
        "policy_id": policy.get("id"),
    }


def load_json(path: Path) -> dict:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--venue", type=Path, help="Venue JSON (lat/lon/name/user_agent)")
    p.add_argument("--lat", type=float, help="Venue latitude")
    p.add_argument("--lon", type=float, help="Venue longitude")
    p.add_argument("--name", default="Outdoor festival venue", help="Venue display name")
    p.add_argument("--program", default="", help="Festival / program label")
    p.add_argument("--policy", type=Path, default=DEFAULT_POLICY, help="Policy thresholds JSON")
    p.add_argument("--user-agent", default=None, help="Override NWS User-Agent")
    return p.parse_args()


def main() -> int:
    args = parse_args()
    venue: dict[str, Any] = {}
    if args.venue:
        venue = load_json(args.venue.resolve())
    lat = args.lat if args.lat is not None else venue.get("lat")
    lon = args.lon if args.lon is not None else venue.get("lon")
    if lat is None or lon is None:
        print(
            json.dumps({"ok": False, "error": "Provide --venue or both --lat and --lon"}),
            file=sys.stderr,
        )
        return 2

    name = args.name if args.lat is not None else (venue.get("name") or args.name)
    program = args.program or venue.get("program") or ""
    ua = args.user_agent or venue.get("nws_user_agent") or DEFAULT_UA
    policy = load_json(args.policy.resolve())

    try:
        points = get_json(f"{BASE}/points/{lat},{lon}", ua)
        props = points["properties"]
        forecast_url = props["forecast"]
        grid = {
            "office": props.get("cwa"),
            "gridId": props.get("gridId"),
            "gridX": props.get("gridX"),
            "gridY": props.get("gridY"),
            "forecastZone": props.get("forecastZone"),
            "county": props.get("county"),
        }
        alerts_fc = get_json(f"{BASE}/alerts/active?point={lat},{lon}", ua)
        forecast = get_json(forecast_url, ua)
    except urllib.error.HTTPError as e:
        print(json.dumps({"ok": False, "error": f"HTTP {e.code}: {e.reason}"}), file=sys.stderr)
        return 1
    except Exception as e:  # noqa: BLE001
        print(json.dumps({"ok": False, "error": str(e)}), file=sys.stderr)
        return 1

    alerts: list[dict] = []
    for feat in alerts_fc.get("features") or []:
        p = feat.get("properties") or {}
        alerts.append(
            {
                "event": p.get("event"),
                "severity": p.get("severity"),
                "urgency": p.get("urgency"),
                "certainty": p.get("certainty"),
                "headline": p.get("headline"),
                "onset": p.get("onset"),
                "ends": p.get("ends"),
                "areaDesc": p.get("areaDesc"),
                "instruction": p.get("instruction"),
                "description": p.get("description"),
                "id": p.get("id"),
            }
        )

    periods = []
    for per in (forecast.get("properties") or {}).get("periods") or []:
        periods.append(
            {
                "name": per.get("name"),
                "startTime": per.get("startTime"),
                "endTime": per.get("endTime"),
                "isDaytime": per.get("isDaytime"),
                "temperature": per.get("temperature"),
                "temperatureUnit": per.get("temperatureUnit"),
                "windSpeed": per.get("windSpeed"),
                "windDirection": per.get("windDirection"),
                "shortForecast": per.get("shortForecast"),
                "detailedForecast": per.get("detailedForecast"),
                "probabilityOfPrecipitation": per.get("probabilityOfPrecipitation"),
            }
        )

    out = {
        "ok": True,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "venue": {
            "id": venue.get("id"),
            "name": name,
            "program": program,
            "lat": lat,
            "lon": lon,
        },
        "nws_grid": grid,
        "alerts": alerts,
        "forecast_periods": periods[:8],
        "classification": classify(alerts, periods, policy),
        "policy": {"id": policy.get("id"), "title": policy.get("title")},
    }
    json.dump(out, sys.stdout, indent=2)
    print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
