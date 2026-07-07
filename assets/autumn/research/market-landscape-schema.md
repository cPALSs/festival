---
title: Market Landscape Schema
asset_type: schema
season: autumn
---

# Market Landscape Schema

**Live sheet:** [Greater Sacramento Autumn Season - Market Landscape](https://docs.google.com/spreadsheets/d/1Va0oCv09nyW98-JnWL9DuYYTsXG35cxjf_WqBZsySrA/edit?usp=drive_link)

Row 1 in the Sheet must match these headers exactly.

## Sheet tabs

Tab order (left to right): **2026** · **2025** · **All**

| Tab | Role |
|-----|------|
| **2026** | **Read view** — all current-year rows on one tab, grouped by **Schedule confidence** section headers (Krewe Subunit Contacts pattern). Re-run `add-landscape-view-tabs.mjs` after editing **All**. |
| **2025** | Last held season — live `FILTER` formula |
| **All** | **Source of truth** — edit here only |

The **2026** tab uses colored section bands — **Confirmed** · **Tentative** · **Estimated** — with event rows sorted by **Dates** under each band. Do not edit **2026** directly; change **All** and refresh the view script.

**2025** and other year tabs (when added) use `FILTER` + `SORT` formulas; they refresh when **All** changes.

## Column dictionary

| Column | Meaning |
|--------|---------|
| Category | Lane — e.g. `Mid-Autumn / Moon / Lantern`, `Autumn Family Fair`, `Activity Comp (reference)` |
| Tier | Priority within category — `1` (direct), `2`, `3`, or `A`/`B`/`C` for family fairs |
| Event Name | Display name |
| **event_id** | Stable slug linking all years of the same event — e.g. `cpalss-maf`, `caaps-lantern` |
| **Season year** | Calendar year this row describes — `2025`, `2026`, `2027`, or `reference` |
| **Row status** | `planning` · `confirmed` · `held` · `historical` · `cancelled` · `reference` |
| **Schedule confidence** | **Confirmed** · **Tentative** · **Estimated** — required for current planning-year rows (see below) |
| **Confidence source** | `Steward confirmed` · `Public listing` · `Organizer conversation (pre-public)` · `Coalition internal` |
| **Confirmed by** | Calendar steward name when human-confirmed |
| **Confirmed date** | `YYYY-MM-DD` when steward confirmed |
| Host / Organizer | Coalition hosts — **VACOS, cPALSs, NVCC** (always all three, that order; VACOS leads MAF, cPALSs leads EGLNY) |
| City | Primary city |
| Venue | Location detail |
| **Dates** | **This occurrence only** — lead with `YYYY-MM-DD` (year tabs sort on this column); add day/time after |
| Duration | Hours or days |
| Admission | Free, ticketed, parking notes |
| Attendance (number or range) | Best honest number or range |
| Attendance source | `Field estimate`, `Organizer claim`, `CCSD`, `Internal planning`, etc. |
| Vendor count (approx) | Booth/vendor scale if known |
| Lunar aligned | Yes / Partial / No |
| Vietnamese focus | Yes / Partial / No |
| Kids / family center | Yes / Partial / No |
| Lantern moment | Yes / Partial / No — procession, release, making |
| MAF overlap | Relationship to VACOS/cPALSs/NVCC MAF — `Our event`, `Direct comp`, `Substitute`, `Reference only` |
| Notes for reviewers | Steering context, honesty gaps, ecosystem notes |
| Source URL | Primary citation |
| Data gap | What is still unknown or unverified |

## Enums

**MAF overlap (common values):** Short labels for the Sheet — see [tone of voice](../../../docs/tone-of-voice.md) for plain English.

| Sheet value | Plain language |
|-------------|----------------|
| `Our event` | Coalition Mid-Autumn we produce |
| `Direct comp - same city` | Direct competitor in the same city |
| `Direct comp - spectacle product` | Direct competitor with a different spectacle (e.g. installed silk lantern display) |
| `Direct comp - late September` | Direct competitor in the same late-September window |
| `Direct comp - lunar weekend` | Direct competitor on lunar Mid-Autumn weekend |
| `Substitute - October` | Families might choose this instead in October |
| `Substitute - same city + ecosystem` | Same city; shared vendors or audience |
| `Reference only` | Not in the autumn competitive set |
| `Low - commercial` | Commercial/ticketed; weak fair comparison |
| `Low - church program` | Church program; not a full street fair |

**Attendance source:** Always set when attendance is non-empty. Distinguish press/organizer claims from on-the-ground estimates.

## Occurrence rows (one row per year)

- **Do not overwrite** last year's row when next year's date is announced — add a row (or copy → edit → set prior row to `held`).
- **Latest season only when dated:** For the current planning year, **Estimated rows are allowed** with projected dates (see **How to estimate dates** below) + **Data gap** until organizer confirms.
- **Filter views** (recommended in Google Sheets):
  - **Current planning** — `Season year` = 2026 or 2027 · `Row status` = `planning` or `confirmed`
  - **Last held** — `Row status` = `held` · sort `Season year` descending
  - **By event** — filter `event_id` to see full history (e.g. `cpalss-maf`)

**Row status:**

| Value | When to use |
|-------|-------------|
| `planning` | Dates TBD or internal working row |
| `confirmed` | Public listing with firm dates |
| `held` | Event completed; attendance may be updated |
| `historical` | Prior-year archive; not in current comp set |
| `cancelled` | Announced then cancelled |
| `reference` | Out-of-season or out-of-region; not a calendar row |

**Schedule confidence** (current planning year — separate from row lifecycle):

| Value | When to use |
|-------|-------------|
| **Confirmed** | **Calendar steward** verified the date. Auto-signal: public listing (FB, Eventbrite, Sacramento365, organizer site). Steward may confirm **before** public post when organizer gave final date in conversation. |
| **Tentative** | Spoken to organizer; committed date but not finalized |
| **Estimated** | No organizer contact; date projected from prior held occurrence (see below). Apply only to **planning-year** rows — not `held` / `historical`. |

**Confidence source:** `Steward confirmed` · `Public listing` · `Organizer conversation (pre-public)` · `Coalition internal`

### How to estimate dates

Do **not** copy the prior Gregorian calendar date (e.g. “Sep 12 last year → Sep 12 this year”). Mid-Autumn moves on the solar calendar; weekend slots move with it.

**Anchor — lunar Mid-Autumn date** (15th day of the 8th lunar month) for the planning year.

**MAF Saturday** — Saturday nearest that lunar date: prefer the Saturday **on or after** when lunar falls Fri–Sun; prefer the Saturday **before** when lunar falls Mon–Thu.

| Year | Lunar MAF | MAF Saturday |
|------|-----------|--------------|
| 2025 | Mon Oct 6 | Sat Oct 4 |
| 2026 | Fri Sep 25 | Sat Sep 26 |

**Lunar-aligned events** (`Lunar aligned` = Yes, or Yes with a qualifier):

1. Take the most recent **held** occurrence for that `event_id`.
2. Weekend offset = `(event Saturday − prior-year MAF Saturday) / 7` (negative = before MAF).
3. Projected Saturday = `planning-year MAF Saturday + (offset × 7 days)`.
4. Keep the prior occurrence’s **day of week** and typical hours.
5. Record the offset in **Notes for reviewers** or **Data gap**, e.g. `Est. MAF −3 weekends (from 2025 Fri Sep 12)`.

**2026 examples — lunar-aligned (from 2025 held):**

| event_id | 2025 held | Offset | 2026 estimate |
|----------|-----------|--------|---------------|
| `sac-state-harvest-moon` | Sun Sep 21 | MAF −2 weekends | Sun Sep 13 |
| `riverside-umc-mid-autumn` | Sat Sep 27 | MAF −1 weekend | Sat Sep 19 |

**Non-lunar / calendar-pattern events** (`Lunar aligned` = No, or Partial with an explicit calendar pattern such as “first October weekend” or “2nd Friday of September”):

- Project from the prior-year **calendar** pattern (same month, same weekend-of-month, Nth weekday of month, late November, etc.).
- **Multi-year check:** if lunar offsets disagree across held years, prefer the calendar pattern.
- Examples:
  - SF Supermarket 2025 Oct 4–5 → 2026 first October weekend (Oct 3–4), not MAF weekend.
  - **CAIMH / District 56:** 2024 Fri Sep 13 (City; weekend before MAF) and 2025 Fri Sep 12 (CAIMH; MAF −3) — lunar offsets disagree; both land on the **2nd weekend of September** (likely **District 56 availability** more than lunar). Estimate 2026 **Fri Sep 11**, not MAF −3.

When in doubt for Mid-Autumn / Moon / Lantern rows **with consistent lunar offsets**, prefer **MAF ± weekends**. When offsets conflict year-to-year, prefer **calendar pattern**.

**Colleague shortcuts (June 2026):**

| Ask | Tab / section |
|-----|----------------|
| **MAF 2026 — confirmed** | **2026** → **Confirmed** band |
| **MAF 2026 — need outreach** | **2026** → **Estimated** band |
| **Autumn 2025 (last held)** | **2025** |

## Data gap semantics

- Use **Data gap** for open questions — never leave a fake number in **Attendance** to fill silence
- `N/A - our event` when the row is coalition MAF planning
- `Historical reference only` for prior-year rows not in current comp set
- `Not autumn competitive set` for out-of-season reference rows (e.g. IKF)

## Future columns (deferred)

Scheduling tier, roll-up arc, R-tier, capstone event, weeks before capstone, recommended slot, collision flag, network member flag, relationship product — add to Sheet + this doc together when substance phase starts.
