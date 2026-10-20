---
title: Offset tracking schema recommendation
asset_type: research
season: shared
status: draft
---

# Offset tracking — schema recommendation

**Based on:** multi-year held series in [`lny-autumn-pattern-matrix.json`](../lny/research/lny-autumn-pattern-matrix.json) (research depth ~2023/2024–2026).  
**Parent decision sketch:** [`season-date-estimate-schema-decision.md`](season-date-estimate-schema-decision.md)

---

## What the data says

### Lunisolar day-offset is almost never stable

Across multi-year **held** peers, **zero** events kept a constant dayΔ from LNY/MAF Day. WeekendΔ vs festival Saturday was stable for **one** LNY peer only (`ca-is-my-home-lny`, both years ≈ MAF/LNY Sat −1w). Everything else mixed before/after, DOW, or both.

| Implication | Do not | Do |
|-------------|--------|-----|
| Estimating next year | Store “last year’s dayΔ” as the rule | Store a **rule class** + preferred DOW + tie-break |
| Explaining last year | Ignore observed geometry | **Compute** observed dayΔ / weekendΔ from `Dates` (diagnostic) |
| Civil harvest (GPF) | Apply MAF math | Gate on lunisolar flag → calendar pattern only |

### Lunisolar vs civil is load-bearing

[`Lunar aligned`](../autumn/research/market-landscape-schema.md) already exists (`Yes` / `Partial` / `No`). GPF is correctly **`No`**. Season membership ≠ lunar timing. Any offset schema must **keep this field** and use it as a hard gate before festival-relative methods.

### Preferred DOW is stabler than offsets

Examples: Creative Space always **Sat** (before LNY, week count varies); Chason’s always **Sun** (after LNY; 2026 makeup broke dayΔ); SCNCCA/Arden always **Sat** but flip before↔after. Schema should treat **DOW + side-of-festival** as primary for lunisolar products, not a single integer day offset.

### On / after / before collisions are real

EGLNY 2024 landed **on** LNY Day (Sat). 2027 LNY is again Saturday — products that say “Saturday of LNY” need an explicit **`on_or_after` vs `after` vs `before`** tie-break.

---

## Recommended schema

Two layers on the same **All** tab (both seasons):

### A. Keep / tighten (existing)

| Column | Role |
|--------|------|
| **`Lunar aligned`** | **Keep.** `Yes` · `Partial` · `No` (+ short qualifier in cell OK). Gate for all festival-relative estimates. |
| **`Dates`** | Occurrence fact. Always ISO lead `YYYY-MM-DD`. |
| **`Schedule confidence`** | `Confirmed` · `Intended` · `Tentative` · `Estimated` (planning year). |
| **`event_id`** | Series key across years. |

**Tighten enums for `Lunar aligned` (optional cleanup, same column):**

| Value | Meaning |
|-------|---------|
| `Yes` | Schedules relative to LNY Day / Mid-Autumn Day (or that festival’s Saturday) |
| `Partial` | Mixed / soft lunar (use Notes or `Calendar pattern`) |
| `No` | Civil / Gregorian / civic calendar only (GPF, many harvest/Halloween comps) |

### B. Add — rule fields (planning rows; copy forward on new year)

These describe **how we estimate**, not last year’s raw geometry.

| Column | Type | Required when | Purpose |
|--------|------|---------------|---------|
| **`Timing basis`** | enum | always (default from Lunar aligned) | `lunisolar` · `civil_calendar` · `capstone` · `steward` · `unknown` |
| **`Estimate method`** | enum | planning + Estimated | See below |
| **`Preferred DOW`** | `Sat`/`Sun`/`Fri`/… or blank | lunisolar methods | Target weekday |
| **`Festival weekend offset`** | int or blank | `*_weekend` methods | Weeks vs **festival Saturday** (−1 = week before) |
| **`Tie-break`** | `on_or_after` · `after` · `before` · `n/a` | when Preferred DOW can hit festival day | Collision policy |
| **`Calendar pattern`** | short text | `Timing basis = civil_calendar` or method `calendar_pattern` | e.g. `first Oct weekend`, `2nd Fri of Sep` |
| **`Pattern confidence`** | enum | planning Estimated | Sheet: `high` · `medium` · `low` (see public mapping) |

**Public confidence mapping** (consecutive held years where the **same offset rule** matches):

| Sheet / public | Streak |
|----------------|--------|
| `high` | **3 years in a row** |
| `medium` | **2 years in a row** (not 3) |
| `low` | otherwise |

**`Timing basis` vs `Lunar aligned`:**  
- `Lunar aligned = No` ⇒ `Timing basis = civil_calendar` (or steward).  
- `Lunar aligned = Yes` ⇒ default `lunisolar`.  
- Capstone rows ⇒ `capstone` / `steward` even if lunar-themed.

### Estimate method enum (gated)

| Method | Allowed if | Resolves date by |
|--------|------------|------------------|
| `festival_weekend` | lunisolar | Festival Sat + `Festival weekend offset`, land on `Preferred DOW`, apply `Tie-break` |
| `first_dow_after_festival` | lunisolar | First Preferred DOW **strictly after** festival day |
| `first_dow_on_or_after_festival` | lunisolar | First Preferred DOW on/after festival day |
| `last_dow_before_festival` | lunisolar | Last Preferred DOW **before** festival day |
| `capstone_relative` | rare | Same weekend / ±Nw as our capstone (explicit, not default) |
| `calendar_pattern` | civil or Partial | Parse/apply `Calendar pattern` string |
| `prior_year_offset` | lunisolar **or** civil when confidence is **low** | Take **most recent held** occurrence: compute dayΔ (or weekendΔ for weekend products) vs that year’s festival day / festival Saturday; apply the same Δ to this year’s festival anchor; then snap to Preferred DOW if set (nearest), else keep computed date |
| `steward` | any | Human-set `Dates`; no auto |
| `insufficient` | no prior held year | No date to project; public gloss `pattern unclear; low confidence` |

**Low confidence default:** If Pattern confidence is `low` and at least one held prior year exists, **`Estimate method` = `prior_year_offset`** (not a multi-year rule). Medium/high keep the stable rule methods above.

Drop separate `lny_weekend` / `maf_weekend` names — one `festival_weekend` plus season context (sheet already is LNY or Autumn).

### C. Stored vs computed offsets

| | |
|--|--|
| **Do not** hand-edit a permanent “day offset rule” for medium/high** | Those use method + DOW + tie-break (+ weekend offset) |
| **Do** compute last year’s observed Δ for `prior_year_offset` | Regenerated from prior held `Dates` — fine as script output or ephemeral |

**Optional diagnostic columns (not hand-edited SoT):**  
`Observed dayΔ` / `Observed weekendΔ` / `Observed landed` from `Dates` + that year’s festival day.

---

## Gate logic (implement once)

```text
if Lunar aligned == No OR Timing basis == civil_calendar:
  if Pattern confidence in {medium, high}:
    apply calendar_pattern
  else if prior held year exists:
    method = prior_year_offset   # last year's civil/festival geometry as applicable
  else:
    method = insufficient
elif Pattern confidence in {medium, high}:
  apply Estimate method + Preferred DOW + Tie-break + Festival weekend offset
elif prior held year exists:
  method = prior_year_offset     # last year's dayΔ (or weekendΔ) vs festival
else:
  method = insufficient
```

---

## Seeds from this research (examples)

| event_id | Lunar aligned | Timing basis | Method | DOW | Tie-break | Pattern / offset | Confidence |
|----------|---------------|--------------|--------|-----|-----------|------------------|------------|
| `gpf-elk-grove` | No | civil_calendar | calendar_pattern | Sat | n/a | `first Oct weekend` (tune) | medium |
| `chasons-crab-stadium-lny` | Yes/Partial | lunisolar | prior_year_offset | Sun | after | from 2026 held Δ (makeup) or prefer steward note | low |
| `creative-space-lny` | Yes | lunisolar | prior_year_offset *or* last_dow_before if treated medium | Sat | before | last year Δ if low | low / medium |
| `scncca-lny` | Yes | lunisolar | prior_year_offset | Sat | n/a | 2026 dayΔ vs LNY | low |
| `ca-is-my-home-lny` | Yes | lunisolar | festival_weekend | Sat | before | offset −1 | medium |
| `cpalss-lny-capstone` | Yes | steward | steward | Sat | on_or_after OK | — | steward |
| `sf-supermarket-maf-rancho` | No/Partial | civil_calendar | calendar_pattern | — | n/a | `first Oct weekend` | medium if 2yr |

---

## Public gloss

```text
(estimated {rule}; {high|medium|low} confidence)
```

- Medium/high: rule from stable method — `(estimated Sat MAF−1w; high confidence)`  
- **Low:** still show a short rule derived from **last year’s offset** (e.g. `(estimated Sat before LNY; low confidence)`), not bare `pattern unclear`, when a prior year exists  
- No prior year: `(estimated; pattern unclear; low confidence)`  

**Streak rule:** high = same offset rule **3 years in a row**; medium = **2 in a row**; low = otherwise → **project with last year’s offset**.

Spec: [`public-estimated-date-display-spec.md`](public-estimated-date-display-spec.md)

---

## Minimal ship set

If column budget is tight, ship in this order:

1. Keep **`Lunar aligned`** (already live) — enforce gate in export/estimate scripts  
2. **`Timing basis`** + **`Estimate method`** + **`Preferred DOW`** + **`Tie-break`**  
3. **`Calendar pattern`** (civil) + **`Festival weekend offset`** (lunisolar weekend method)  
4. **`Pattern confidence`** (`high` / `medium` / `low`) — low ⇒ `prior_year_offset`  
5. Public gloss in export scripts  

Do not hand-maintain a permanent day-offset column; compute prior-year Δ when confidence is low.
