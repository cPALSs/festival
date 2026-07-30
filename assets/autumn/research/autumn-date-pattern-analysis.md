---
title: Autumn date pattern analysis
asset_type: research
season: autumn
status: draft
---

# Greater Sacramento Mid-Autumn — multi-year date pattern analysis

**Purpose:** Stress-test the Autumn schema’s **MAF Saturday ± weekends** estimator; recommend keep / revise / dual-anchor.  
**Matrix dump:** [`../lny/research/lny-autumn-pattern-matrix.json`](../lny/research/lny-autumn-pattern-matrix.json)  
**Inventory:** [`autumn-date-research-inventory.md`](autumn-date-research-inventory.md)  
**Schema under test:** [`market-landscape-schema.md`](market-landscape-schema.md)

**Lunar Mid-Autumn / MAF Saturday (schema):**

| Year | Lunar MAF | MAF Saturday |
|------|-----------|--------------|
| 2023 | Fri Sep 29 | Sat Sep 30 |
| 2024 | Tue Sep 17 | Sat Sep 14 |
| 2025 | Mon Oct 6 | Sat Oct 4 |
| 2026 | Fri Sep 25 | Sat Sep 26 |

---

## 1. Coverage

| event_id | Years | Notes |
|----------|-------|-------|
| `asm-nguyen-autumn-moon` | 2024, 2025 (+2026 est.) | Strong series |
| `riverside-umc-mid-autumn` | 2024, 2025 (+2026 est.) | Edition numbers on sheet |
| `caaps-lantern` | 2023, 2024*, 2025*, 2026 | *2024–25 on sheet with non-ISO dates in places — normalize |
| `sac-state-harvest-moon` | 2024 (backfill), 2025 | Good |
| `sf-supermarket-maf-rancho` | 2025 (+2026 est.) | Calendar October weekend |
| `gpf-elk-grove` | 2024, 2025 (+2026 plan) | Civic harvest — not lunar-primary |
| `cpalss-maf` | 2024; 2026 cancelled | Capstone |
| `ca-is-my-home-mid-autumn` / `ca-is-my-home-maf` | 2024, 2025, 2026 | **Split event_ids** — treat as one product; known calendar break |
| Many 2025-only comps | 1yr | Harvest / Halloween lane |

Backfill this pass: Sac State 2024, GPF 2024–25, CAAPS 2023, CAIMH 2024 Fri Sep 13.

---

## 2. Stress-test: MAF ± weekends

### Works reasonably

| event_id | Held | vs MAF Sat | Comment |
|----------|------|------------|---------|
| `sac-state-harvest-moon` | 2024 Sun Sep 15; 2025 Sun Sep 21 | ~MAF weekend / −2w | Schema example still plausible |
| `sf-supermarket-maf-rancho` | 2025 Oct 4–5 | MAF weekend 2025 | Schema already says prefer **calendar first October weekend** for 2026 |
| `gpf-elk-grove` | 2024 Oct 5–6; 2025 Oct 4–5 | Near early Oct | **Civil calendar** — `Lunar aligned = No`; never MAF-anchored |

### Gate: lunisolar vs civil

Before applying MAF/LNY weekend math, read **`Lunar aligned`**:

| Value | Estimate methods allowed |
|-------|--------------------------|
| **Yes** | `maf_weekend` / `lny_weekend` / `first_dow_*_festival` / `before_festival_dow` when years agree |
| **Partial** | Prefer notes; often `calendar_pattern` or soft lunar |
| **No** | **`calendar_pattern` or `steward` only** — GPF, many harvest/Halloween comps |

Do not let season-calendar membership imply lunisolar timing.

### Conflicts / breaks

| event_id | Issue |
|----------|--------|
| `ca-is-my-home-*` | 2024 Fri Sep 13 & 2025 Fri Sep 12 = **2nd-weekend-of-Sep Fridays**; **2026 Sun Sep 20** breaks that (schema already flags). Lunar weekend offset alone would mis-project |
| `asm-nguyen-autumn-moon` | 2024 Sat Sep 14 (MAF Sat); 2025 Sat Sep 20 (MAF−2w). Offset not stable |
| `caaps-lantern` | 2023 Sat Sep 30 (≈ MAF Sat); 2025 **Nov 1–2** (far from lunar); 2026 Sat Sep 19. Multi-year lunar offset **fails** — spectacle/schedule-driven |
| `riverside-umc-mid-autumn` | 2024 Sat Sep 14; 2025 Sep 27 — week shift; edition continuity ≠ fixed MAF−Nw |

**Verdict on current method:** Keep **MAF ± weekends** as *default for lunar-aligned Yes products with agreeing years*, but:

1. Require **`2yr_agree`** (or steward) before publishing a tight gloss.  
2. Prefer **calendar_pattern** when years conflict (CAIMH, SF Supermarket, GPF).  
3. Store **`Estimate tie-break`** for MAF Saturday itself (`on_or_after` already implied by schema prose — make it explicit).

---

## 3. Capstone-relative

`cpalss-maf` 2024 Fri–Sat Sep 20–21 was shortly after MAF Sat Sep 14. 2026 cancelled — no live peer-anchor. Do not force peers onto GLF weekend when lunar or calendar fits better.

---

## 4. Schema revision recommendation (Autumn)

| Keep | Change |
|------|--------|
| MAF Day + MAF Saturday definition | Add columns: `Estimate method`, `Estimate weekend offset`, `Estimate DOW`, `Estimate tie-break` (`on_or_after` \| `after` \| `before` \| `n/a`), `Pattern confidence` |
| Notes examples of offsets | Machine-readable fields > notes-only |
| Calendar-pattern escape hatch | Promote to first-class `Estimate method = calendar_pattern` with a short pattern string (e.g. `2nd Fri of Sep`, `first Oct weekend`) |
| Split CAIMH ids | Merge or alias `ca-is-my-home-maf` ↔ `ca-is-my-home-mid-autumn` for series math |

### Public gloss (greatlantern)

- `Sat, Sep 19, 2026 (estimated Sat MAF−1w)`  
- `Sun, Sep 20, 2026 (confirmed)` — no estimate gloss  
- `Sat, Oct 3, 2026 (estimated first Oct weekend)`  
- `Sat, Sep 12, 2026 (estimated; pattern unclear)` when confidence conflict  

---

## 5. Joint note with LNY

Same field vocabulary for both seasons (method / DOW / weekend offset / tie-break / confidence). Festival-specific anchors: **LNY Saturday** vs **MAF Saturday**. Display gloss tokens: `LNY` / `MAF` / `after` / `on/after` / `before` / `MAF−Nw` / `pattern unclear`.

See [`season-date-estimate-schema-decision.md`](../research/season-date-estimate-schema-decision.md) and [`public-estimated-date-display-spec.md`](../research/public-estimated-date-display-spec.md).
