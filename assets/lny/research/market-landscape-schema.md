---
title: Market Landscape Schema
asset_type: schema
season: lny
---

# Market Landscape Schema — Lunar New Year Season

**Live sheet:** [Greater Sacramento Lunar New Year Season - Market Landscape](https://docs.google.com/spreadsheets/d/1IB6beiKHC9R05r2o0imkh8MX_2u-qmhlVxTV3pxibs0/edit?usp=drive_link)

Row 1 in the Sheet must match these headers exactly.

## Scope

**Greater Sacramento** — Sacramento, Elk Grove, South Sac, Folsom, Rancho Cordova, West Sacramento, Davis, Woodland, Lincoln, Locke, Brooks (Cache Creek). **January–March** window around Lunar New Year (late Jan through early Mar).

**Not in scope:** Bay Area, SoCal, or May AAPI Heritage Month events — use `Reference only` or `Ecosystem (not LNY calendar)` rows when cited for vendor/sponsor attention.

## Sheet tabs

Tab order (left to right): **2027** · **2026** · **All**

| Tab | Role |
|-----|------|
| **2027** | Live view — all rows where `Season year` = 2027 |
| **2026** | Live view — all rows where `Season year` = 2026 (last held season) |
| **All** | **Source of truth** — edit here only |

Year tabs are `FILTER` formulas; they refresh when **All** changes. Do not edit year tabs directly.

## Column dictionary

| Column | Meaning |
|--------|---------|
| Category | Lane — e.g. `Vietnamese Tết / Family Fair`, `Chinese New Year / Spring Festival`, `Pan-Asian / Chamber`, `Church / Parish Tết`, `Ticketed Concert / Casino`, `Mardi Gras / Adjacent Season`, `Iu Mien / Ethnic Heritage`, `Ecosystem (not LNY calendar)`, `Reference / Out of region` |
| Tier | Priority within category — `1` (direct capstone comp), `2`, `3`, or `A`/`B`/`C` for reference rows |
| Event Name | Display name |
| **event_id** | Stable slug — e.g. `cpalss-lny-capstone`, `scncca-lny`, `ca-is-my-home-mid-autumn` |
| **Season year** | Calendar year — `2026`, `2027`, or `reference` |
| **Row status** | `planning` · `confirmed` · `held` · `historical` · `cancelled` · `reference` |
| Host / Organizer | Coalition hosts — **VACOS, cPALSs, NVCC** (always all three, that order; cPALSs leads EGLNY, VACOS leads MAF) |
| City | Primary city |
| Venue | Location detail |
| **Dates** | **This occurrence only** — lead with `YYYY-MM-DD`; year tabs sort on this column |
| Duration | Hours or days |
| Admission | Free, ticketed, parking notes |
| Attendance (number or range) | Best honest number or range |
| Attendance source | `Field estimate`, `Organizer claim`, `CCSD`, `Internal planning`, etc. |
| Vendor count (approx) | Booth/vendor scale if known |
| Lunar aligned | Yes / Partial / No |
| Vietnamese focus | Yes / Partial / No |
| Kids / family center | Yes / Partial / No |
| Parade / spectacle moment | Yes / Partial / No — parade, lion dance, second line, mall stage |
| LNY overlap | Relationship to VACOS/cPALSs/NVCC capstone — see enums below |
| Notes for reviewers | Steering context, honesty gaps, ecosystem notes |
| Source URL | Primary citation |
| Data gap | What is still unknown or unverified |

## Enums

**LNY overlap (common values):** Short labels for the Sheet — see [tone of voice](../../docs/tone-of-voice.md) for plain English.

| Sheet value | Plain language |
|-------------|----------------|
| `Our event` | Coalition capstone we produce |
| `Direct comp - same day capstone` | Direct competitor on capstone Saturday |
| `Direct comp - same weekend cluster` | Direct competitor the same pre-capstone weekend |
| `Direct comp - same city` | Direct competitor in the same city |
| `Season network member` | Part of the season calendar; not a capstone fight |
| `Twin season - bridge product` | Adjacent season (e.g. Mardi Gras) that can extend the story |
| `Ecosystem partner` | Shared vendors, media, or audience — coordinate, don't collide |
| `Low - ticketed concert` | Different product (ticketed); weak attendance comparison |
| `Substitute - free civic` | Different free weekend option for families |
| `Reference only` | Out of region or out of season — context only |

**Attendance source:** Always set when attendance is non-empty. Distinguish press/organizer claims from on-the-ground estimates and CCSD.

## Occurrence rows (one row per year)

Same rules as [Autumn schema](../autumn/research/market-landscape-schema.md#occurrence-rows-one-row-per-year). **No 2027 rows until dates are known** — the **2027** tab is empty until then.

**Colleague shortcuts (June 2026):**

| Ask | Tab |
|-----|-----|
| **LNY 2027 (EGLNY)** | **2027** — `cpalss-lny-capstone` · tentative **Feb 13–14** |
| **LNY 2026 (last held)** | **2026** |

## Data gap semantics

- Use **Data gap** for open questions — never leave a fake number in **Attendance** to fill silence
- `N/A - our event` when the row is coalition Elk Grove capstone planning
- `Not LNY season competitive set` for out-of-window ecosystem rows (e.g. AAPI Night Market in May)
- `Out of region` for Bay Area / national ceiling comps

## Season flyer linkage

The 2026 **Lunar New Year Season** one-pager (orange–magenta gradient calendar) listed 12 dated events Jan 24–Mar 7 with cPALSs capstone centered Feb 14–15. Those rows are seeded in the Sheet; source file was not preserved in repo — **this Sheet is now the canonical event list**.

## Future columns (deferred)

Scheduling tier, roll-up arc, R-tier, capstone event, weeks before capstone, recommended slot, collision flag, network member flag, relationship product — add to Sheet + this doc together when substance phase starts.
