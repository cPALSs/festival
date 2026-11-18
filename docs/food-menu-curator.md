---
title: Food Menu Curator
layout: default
---

Composition-first **food vendor curation** for outdoor festivals: capacity by attendance, need-profile scoring, gap analysis, conditional offers, and a guest-facing menu publish path.

Fork the engine — do not treat one festival’s roster as a universal recipe.

## Open-source tool

```bash
git clone https://github.com/cPALSs/festival.git
cd festival/tools/food-curation-engine
python3 -m unittest tests/test_engine.py -v
```

- Engine + staff SPA: [github.com/cPALSs/festival/tree/main/tools/food-curation-engine](https://github.com/cPALSs/festival/tree/main/tools/food-curation-engine)
- Presets & seeds: [assets/shared/food-curation](https://github.com/cPALSs/festival/tree/main/assets/shared/food-curation)
- LNY 2026 backtest case study: [lny-2026-food-curation-backtest.md](https://github.com/cPALSs/festival/blob/main/assets/case-studies/lny-2026-food-curation-backtest.md)

## Naming & public menus

- [Food menu item naming guidelines](lny/food-menu-item-naming-guidelines.html) — guest-facing dish names
- Eventeny apply-time patterns (LNY 2027): [vendor platform migration notes](lny/lny-2027-vendor-platform-eventeny-migration.html)

## Related

- [Market Landscape](research.html) — season context for vendor demand
- [Auspicious Date Picker](auspicious-date-picker.html) — weekend choice before vendor lock
- [Weather Risk Monitor](weather-cancel-aid.html) — rain/wind posture on festival days
