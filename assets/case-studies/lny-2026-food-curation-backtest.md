# LNY 2026 food curation backtest

**Status:** Case study · Festival Network  
**Engine:** [food-curation-engine](../../../../../tools/food-curation-engine/)  
**Seed:** [lny-2026-applicants.json](../assets/shared/food-curation/seeds/lny-2026-applicants.json)

---

## Setup

| Input | Value |
|-------|-------|
| Attendance | 6,000 (CCSD 2026 range) |
| Audience preset | `family_general` |
| Applicant pool | **34** applicants (**31** fielded 2026 + **3** cap-decline/waitlist pool) |
| Menu model | **Q1** = Zeffy raw when matched · **Q2** = simulated signatures · [resolutions](../assets/shared/food-curation/seeds/lny-2026-reconciliation-resolutions.json) |
| Gold label | 31 marked `manual_accepted_2026` |

---

## Results

| Metric | Manual 2026 | Engine @ 6K |
|--------|-------------|-------------|
| Food vendor slots filled | **33** | **12** accept |
| Target capacity model | — | **13** slots |
| Fleet utilization (model) | oversupplied | ~67% |
| Modeled avg gross/booth | ~$1,110 | higher per slot (fewer vendors) |

The engine recommends **~13 food slots** vs **33 actual** — consistent with [LNY 2026 Lessons](https://github.com/cPALSs/cPALSs/blob/main/Programs/Lunar%20New%20Year/2027/Business%20Development/LNY%202026%20Lessons%20%26%20Booth%20Caps.md) oversupply analysis.

---

## Category duplicates eliminated

2026 manual roster had multiple vendors in the same archetype (e.g. **3 boba-class**: Bobette Tea, Boba Meet Up, Bowli Bowli drinks). Engine caps **boba_milk_tea** at **1 slot** (exclusivity) — waitlists the rest.

Similar compression for rice plates, noodle/soup, and BBQ categories where 8+ applicants competed for 2–3 slots.

---

## Brand focus examples

### Zummi Food LLC (strong brand — engine accept)

- Focused Vietnamese signatures: bánh mì, bún, garlic noodles, coffee
- Single archetype spread; 2026’s **only VN food truck** — profitable per owner check-in
- Engine: **accept** for fast handheld / VN anchor preference

### D&T Kitchen (weak brand — engine waitlist)

- Capability spans Korean corn dogs, pad thai, noodle soup, boba, BBQ ribs, papaya salad
- High archetype spread across signatures
- Engine: **waitlist** — prefer second focused noodle vendor when slot opens, not expanded menu

---

## Conditional offer workflow (2027+)

2026 had no structured offers. The engine adds:

1. Vendor proposes **capability** + **signature** items at apply (Eventeny Q1/Q2)
2. Committee sends **conditional offer** listing exact dishes from capability
3. **Public menu** publishes accepted offer only — [demo vendor-attributed menu](../assets/shared/food-curation/seeds/demo-food-menu.json)

---

## Run locally

```bash
cd "Operations/Festival Network/shared/tools/food-curation-engine"
python3 scripts/run_engine.py \
  --applicants ../../assets/shared/food-curation/seeds/lny-2026-applicants.json \
  --attendance 6000 --output /tmp/backtest.json
python3 -m http.server 8765 --directory staff-app
# Preset: LNY 2026 backtest
```

---

*Last updated: July 2026*
