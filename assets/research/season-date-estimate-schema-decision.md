---
title: Season date estimate schema decision
asset_type: research
season: shared
status: draft
---

# Joint decision — LNY + Autumn date estimates

**Inputs:**  
- [`lny/research/lny-date-pattern-analysis.md`](../lny/research/lny-date-pattern-analysis.md)  
- [`autumn/research/autumn-date-pattern-analysis.md`](../autumn/research/autumn-date-pattern-analysis.md)  
- [`lny/research/lny-autumn-pattern-matrix.json`](../lny/research/lny-autumn-pattern-matrix.json)

**Out of scope here:** shipping sheet columns / site export (follow-up implementation).

---

## Decision summary

1. **One shared estimate vocabulary** for LNY and Autumn landscape **All** tabs.  
2. **Festival Saturday anchors** remain season-specific (LNY Saturday on/after LNY Day; MAF Saturday per existing Autumn prose) — **only for lunisolar-aligned products**.  
3. **Civil / calendar events are not lunisolar.** Use existing **`Lunar aligned` = No** (and Partial-with-calendar-note) to **forbid** `lny_weekend` / `maf_weekend` / `first_dow_*_festival` methods. Force `calendar_pattern` or `steward`. Example: **`gpf-elk-grove`** (Giant Pumpkin Festival) is early-October civic harvest — already `Lunar aligned = No` for 2024–2026; never estimate from Mid-Autumn Day.  
4. **Do not** estimate peers from a single prior Gregorian date or from a conflicting year.  
5. **`Estimate tie-break` is required** whenever preferred DOW can coincide with festival day: `on_or_after` | `after` | `before` | `n/a`.  
6. **Public season calendars** show resolved date **plus rule gloss** (not bare “(estimated)”). Gloss for civil events uses the calendar pattern (`first Oct weekend`), never `MAF−Nw` / `on/after LNY`.

### Research depth (this pass)

| Season | Years actively hunted | Deepest year landed | Notes |
|--------|----------------------|---------------------|-------|
| LNY | **2024–2026** held (+ 2027 planning already on sheet) | **2024** | ~2–3 seasons back from “now”; not a full archive dig to 2020s |
| Autumn | **2024–2025** gaps (+ verify 2026) | **2023** (CAAPS lantern only) | Most peers still 1–2 years; GPF backfilled 2024–2025 |

Deeper years (2022 and earlier) were **not** systematically searched. Re-open hunt when Pattern confidence stays `low` for high-priority peers.

---

## Columns to add (both sheets)

| Column | Type | Purpose |
|--------|------|---------|
| Estimate method | enum | How the planning date was produced |
| Estimate DOW | enum | Target weekday |
| Estimate weekend offset | int (nullable) | Weeks vs festival Saturday |
| Estimate tie-break | enum | `on_or_after` · `after` · `before` · `n/a` |
| Pattern confidence | enum | `high` · `medium` · `low` — **high** = same offset rule **3 years in a row**; **medium** = **2 in a row**; **low** = otherwise → **`prior_year_offset`** (last held year’s Δ vs festival) |

### Estimate method enum

`lny_weekend` · `maf_weekend` · `first_dow_after_festival` · `first_dow_on_or_after_festival` · `before_festival_dow` · `capstone_relative` · `calendar_pattern` · `steward` · `insufficient`

(`lny_weekend` / `maf_weekend` = weekend-offset from that season’s festival Saturday.)

---

## Autumn-specific

- **Keep** MAF Saturday definition and ± weekends as default for lunar-aligned rows with **medium or high** confidence (2+ year streak).  
- **Revise practice:** on conflict, switch method to `calendar_pattern` (do not force MAF−Nw).  
- Alias/merge CAIMH `event_id`s for series math.  
- Normalize non-ISO historical Dates to `YYYY-MM-DD` leads.

## LNY-specific

- Default is **not** “same dayΔ as last year” — 2025↔2026 flips (SCNCCA, Arden, Fairytale) prove it.  
- Seed: Chason’s = `first_dow_after_festival` + Sun + `after`; Creative Space = `before_festival_dow` + Sat; SCNCCA/Arden = `insufficient` until more data.  
- Capstone = `steward` (may land **on** LNY Day — 2024).

---

## Collision policy

| Tie-break | When festival DOW = preferred DOW |
|-----------|-----------------------------------|
| `on_or_after` | Use festival day itself |
| `after` | Skip to next preferred DOW after festival day |
| `before` | Prefer last preferred DOW strictly before festival day |

Document per event; do not infer silently when Pattern confidence is `low` due to conflict.

---

## Public display (locked direction)

Format:

```text
{Dow}, {Mon} {D}, {YYYY} (estimated {gloss}; {high|medium|low} confidence)
```

**Confidence:** high = same offset rule **3 years in a row**; medium = **2 in a row**; **low = otherwise → estimate from last held year’s offset** (dayΔ/weekendΔ vs festival).

Examples:

- `Sat, Feb 6, 2027 (estimated Sat on/after LNY; low confidence)`  
- `Sun, Feb 7, 2027 (estimated Sun after LNY; medium confidence)`  
- `Sat, Jan 30, 2027 (estimated Sat before LNY; low confidence)`  
- `Sat, Sep 19, 2026 (estimated Sat MAF−1w; high confidence)`  
- `Sat, Oct 3, 2026 (estimated first Oct weekend; medium confidence)`  
- `Sat, Feb 7, 2026 (estimated; pattern unclear; low confidence)` — no prior year only

Confirmed / tentative steward rows omit the estimated gloss or use `(tentative)` without a fake rule.

**Export:** [`export-eglny-season-events.mjs`](../../../scripts/export-eglny-season-events.mjs) / [`export-glf-season-events.mjs`](../../../scripts/export-glf-season-events.mjs) compose gloss from the new fields in a follow-up PR. Localhost review before push.

---

## Follow-up implementation checklist

1. Add columns + schema docs for both landscapes  
2. Backfill method/tie-break/confidence on planning rows from memos  
3. Re-estimate only where confidence allows; mark rest `insufficient`  
4. Wire export gloss strings  
5. Preview eglny + greatlantern locally → push when accepted  
