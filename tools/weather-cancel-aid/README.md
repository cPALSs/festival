# Weather cancel aid (NWS)

Open-source **decision aid** for outdoor festival cancel / modify calls. Pulls live National Weather Service alerts + forecast for a venue point and maps them to a recommended **posture** (`clear` · `modified` · `severe_cancel`).

**Humans cancel.** Automation and AI agents should not publish public/vendor cancel notices without a named director / incident-command lock.

MIT — part of [Festival Season Network](https://github.com/cPALSs/festival) · site guide: [festival.cpalss.com/weather-cancel-aid.html](https://festival.cpalss.com/weather-cancel-aid.html)

## Quick start

```bash
cd tools/weather-cancel-aid
python3 nws_cancel_aid.py --venue venues/eglny-elk-grove.json
```

Or any US lat/lon:

```bash
python3 nws_cancel_aid.py --lat 38.4086 --lon -121.3716 --name "Elk Grove Regional Park"
```

No API key. `api.weather.gov` requires a descriptive `User-Agent` (set in venue JSON or `--user-agent`).

## Outputs

JSON on stdout:

| Field | Meaning |
|-------|---------|
| `alerts` | Active NWS products for the point |
| `forecast_periods` | Near-term grid forecast |
| `classification.posture` | `clear` · `modified` · `severe_cancel` |
| `classification.reasons` | Why that posture |

Tune thresholds in [`policy.defaults.json`](policy.defaults.json) or pass `--policy your-policy.json`.

## Venue presets

| File | Venue |
|------|--------|
| [`venues/eglny-elk-grove.json`](venues/eglny-elk-grove.json) | Elk Grove Regional Park (EGLNY worked example) |

Add your park as another JSON under `venues/` and open a PR.

## Worked example

Sacramento-valley storm day (Flood Advisory + Wind Advisory):  
[`examples/2026-11-18-sacramento-valley-storm.md`](examples/2026-11-18-sacramento-valley-storm.md)

## Agent use

After `git clone https://github.com/cPALSs/festival.git`:

1. Run `nws_cancel_aid.py` for the venue (do not invent forecasts).
2. Draft a short decision-aid brief from `classification` + active headlines.
3. Escalate to festival director + IC only; wait for human send approval before public copy.

See root [AGENTS.md](../../AGENTS.md).

## Not included

- Auto-cancel, auto-SMS, or auto-social posts
- Non-US weather providers (NWS CONUS / territories only)
- Legal advice — thresholds are starting defaults, not AHJ or insurance requirements
