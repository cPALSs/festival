# Food Curation Engine

Composition-first food vendor curation for cPALSs festivals.

## Layout

- `food_curation/` — Python core (capacity, classify, select, gaps, ROI, offers, publish)
- `staff-app/` — Local staff SPA (curation + conditional offers)
- `public-menu/` — Guest food menu SPA
- `scripts/build_lny_2026_seed.sh` — LNY 2026 backtest seed (Zeffy xlsx + Kenrick CSV; auto venv)
- `scripts/build_lny_2026_seed.py` — Python implementation (called by the shell wrapper)
- `tests/` — Unit tests

## Quick start

```bash
cd "Festival Network/shared/tools/food-curation-engine"
python3 -m unittest tests/test_engine.py -v
python3 scripts/compare_py_js_scores.py   # Python ↔ JS score + selection parity
./scripts/build_lny_2026_seed.sh
python3 -m http.server 8765 --directory staff-app
```

Presets and seeds: `Festival Network/shared/assets/shared/food-curation/`

Rebuild LNY 2026 backtest seed (simulates Eventeny Q1 capability + Q2 signature split). First run creates `.venv` and installs `openpyxl` from `requirements.txt`:

```bash
./scripts/build_lny_2026_seed.sh
```

Equivalent: `python3 scripts/build_lny_2026_seed.py` after the venv exists (the script re-execs into `.venv` when `openpyxl` is missing).

Manual menu fixes for bad CSV parses: `seeds/lny-2026-menu-cleanup.json`

## Python API

```python
from food_curation import capacity_plan, classify_applicant, select_roster, gap_analysis, publish_public_menu

config = {"attendance": 6000, "food_buy_rate": 0.40, "items_per_buyer": 1.1}
cap = capacity_plan(config)
result = select_roster(applicants, cap, need_profile)
```
