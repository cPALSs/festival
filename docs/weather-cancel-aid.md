---
title: Weather Risk Monitor
layout: default
---

Outdoor festivals need a **cancel / modify call** when NWS products hit the venue — without pretending software can make the call alone.

**Weather Risk Monitor** (open-source cancel aid) pulls live **National Weather Service** alerts and forecast for a GPS point and recommends a **posture**:

| Posture | Meaning |
|---------|---------|
| **clear** | Proceed; keep monitoring |
| **modified** | Continue with protections (ponding watch; pause rides/inflatables in active rain) |
| **severe_cancel** | Director + incident command should huddle for cancel or early close |

**Humans cancel.** Do not auto-post public or vendor cancel notices from a cron job or agent without a named lock.

## Try it

Clone the open-source repo and run the script (no API key):

```bash
git clone https://github.com/cPALSs/festival.git
cd festival/tools/weather-cancel-aid
python3 nws_cancel_aid.py --venue venues/eglny-elk-grove.json
```

Any US venue:

```bash
python3 nws_cancel_aid.py --lat YOUR_LAT --lon YOUR_LON --name "Your park"
```

- Tool + policy defaults: [github.com/cPALSs/festival/tree/main/tools/weather-cancel-aid](https://github.com/cPALSs/festival/tree/main/tools/weather-cancel-aid)
- Worked example (Flood + Wind Advisory day): [2026-11-18 Sacramento Valley storm](https://github.com/cPALSs/festival/blob/main/tools/weather-cancel-aid/examples/2026-11-18-sacramento-valley-storm.md)

## Default thresholds (forkable)

Starting defaults (tune in `policy.defaults.json`):

- **Cancel-band:** NWS Warnings, Wind Advisory (or forecast wind ≥ **25 mph**), thunderstorm / flash-flood style hazards
- **Modified:** Flood Advisory, high near-term precip chance, light rain language without cancel-tier wind
- **Clear:** otherwise

These track common outdoor Tết practice in Greater Sacramento; they are **not** legal, AHJ, or insurance advice. Replace with your own policy JSON.

## For AI agents

After clone, start at [AGENTS.md](https://github.com/cPALSs/festival/blob/main/AGENTS.md). Agents must run the script (or paste live NWS JSON) — never invent forecasts — and draft a decision-aid brief only.

## Related on this site

- [Homepage toolkit](/)
- [Auspicious Date Picker](auspicious-date-picker.html)
- [Food Menu Curator](food-menu-curator.html)
- [Plan with AI](plan-with-ai.html)
