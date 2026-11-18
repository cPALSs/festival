# Worked example — 2026-11-18 Sacramento Valley storm

**Venue:** Elk Grove Regional Park (`eglny-elk-grove` preset)  
**Captured:** ~2026-11-18 14:40 America/Los_Angeles  
**Not a festival weekend** — saved so other organizers can see how Flood + Wind products map to postures.

## Live products (that day)

| Product | Severity | Notes |
|---------|----------|--------|
| Flood Advisory | Minor | Excessive rainfall; ponding in low-lying / poor-drainage areas (Sacramento County in the polygon) |
| Wind Advisory | Moderate | S/SE 20–30 mph, **gusts up to 55 mph** |

Near-term forecast: rain with precip chance ~100% afternoon; sustained winds in period strings ~16–23 mph SSE.

## Classification

**Posture:** `severe_cancel`

Why: **Wind Advisory** maps to the default cancel band (≥25 mph / unsafe tents). Flood Advisory alone would usually be `modified`; paired with Wind Advisory it stays cancel-band.

Reproduce:

```bash
python3 nws_cancel_aid.py --venue venues/eglny-elk-grove.json
```

(Alerts will differ on later days — this file is a historical snapshot of the mapping logic.)
