---
title: LNY date pattern analysis
asset_type: research
season: lny
status: draft
---

# Greater Sacramento LNY — multi-year date pattern analysis

**Purpose:** Decide how to estimate and *display* peer LNY dates from evidence, not from a single prior season.  
**Matrix dump:** [`lny-autumn-pattern-matrix.json`](lny-autumn-pattern-matrix.json)  
**Inventory:** [`lny-date-research-inventory.md`](lny-date-research-inventory.md)

**Official LNY Days:** 2024-02-10 (Sat) · 2025-01-29 (Wed) · 2026-02-17 (Tue) · 2027-02-06 (Sat).  
**LNY Saturday (on/after):** 2024-02-10 · 2025-02-01 · 2026-02-21 · 2027-02-06.

---

## 1. Coverage (after research backfill)

| event_id | Years held/historical | Sources | Quality |
|----------|----------------------|---------|---------|
| `cpalss-lny-capstone` | 2024, 2025, 2026 | CBS, Sactown Supermom, sheet | Strong |
| `creative-space-lny` | 2024, 2025, 2026 | Organizer site, Good Day Sac | Strong |
| `locke-cny` | 2024, 2025, 2026 | Pacifican, Lodi News, sheet | Strong |
| `scncca-lny` | 2025, 2026 | Vivant Health, festivalnet | Good |
| `arden-fair-lny` | 2025, 2026 | Chamber listing, sheet | Good |
| `fairytale-town-lny` | 2025, 2026 | KCRA roundup, Fairytale site | Good |
| `ca-is-my-home-lny` | 2025, 2026 | Sactown Supermom, sheet | Good |
| `chasons-crab-stadium-lny` | 2025, 2026 (+ makeup note) | IG / belocal; 2026 postponed | Good w/ caveat |
| `ari-lny` | 2024, 2026 | KCRA 2024; 2025 gap | Partial |
| `hook-reel-lny` | 2025 | IG roundup | Thin |
| Others (Iu Mien, Martyrs, Rice Bowl, Honor, Cache Creek, Rooftop) | 2026 only | Season flyer / sheet | Insufficient |

Dead ends this pass: firm 2024 Chason’s calendar day; ARI 2025; parish / Iu Mien / Rice Bowl / Honor / Cache Creek prior years.

---

## 2. Pattern matrix (selected)

Day offset = event lead − LNY Day. Weekend offset ≈ weeks from **LNY Saturday (on/after)** to event’s Saturday.

| event_id | Year | Date | DOW | DayΔ | WkΔ | Landed |
|----------|------|------|-----|------|-----|--------|
| `scncca-lny` | 2025 | Feb 8 | Sat | +10 | +1 | after |
| | 2026 | Feb 7 | Sat | −10 | −2 | before |
| `arden-fair-lny` | 2025 | Feb 1 | Sat | +3 | 0 | after |
| | 2026 | Feb 7 | Sat | −10 | −2 | before |
| `creative-space-lny` | 2024 | Jan 27 | Sat | −14 | −2 | before |
| | 2025 | Jan 25 | Sat | −4 | −1 | before |
| | 2026 | Feb 7 | Sat | −10 | −2 | before |
| `fairytale-town-lny` | 2025 | Feb 1 | Sat | +3 | 0 | after |
| | 2026 | Feb 15 | Sun | −2 | −1 | before |
| `locke-cny` | 2024 | Feb 18 | Sun | +8 | +1 | after |
| | 2025 | Feb 22 | Sat | +24 | +3 | after |
| | 2026 | Feb 14 | Sat | −3 | −1 | before |
| `ca-is-my-home-lny` | 2025 | Jan 25 | Sat | −4 | −1 | before |
| | 2026 | Feb 14 | Sat | −3 | −1 | before |
| `cpalss-lny-capstone` | 2024 | Feb 10 | Sat | **0** | 0 | **on** |
| | 2025 | Feb 1 | Sat | +3 | 0 | after |
| | 2026 | Feb 14 | Sat | −3 | −1 | before |
| `chasons-crab-stadium-lny` | 2025 | Feb 2 | Sun | +4 | 0 | after |
| | 2026 | Mar 1 | Sun | +12 | +1 | after (makeup) |

---

## 3. Verdicts

| event_id | Verdict | Notes |
|----------|---------|-------|
| `creative-space-lny` | **unstable dayΔ; soft “Sat before LNY”** | Always Sat before LNY; week count −1 or −2. Prefer DOW=Sat + before + tie-break `before`/`on_or_after` N/A |
| `scncca-lny` | **unstable / insufficient** | Flips before↔after LNY across 2025–26. Do not auto-estimate from LNY dayΔ |
| `arden-fair-lny` | **unstable / insufficient** | Same flip as SCNCCA cluster |
| `fairytale-town-lny` | **unstable DOW** | 2025 Sat after LNY; 2026 Sun before (capstone Day 2). Kids park — may track civic weekend more than LNY |
| `locke-cny` | **unstable** | After in 2024–25 with wild dayΔ; 2026 co-located with EGLNY Sat |
| `ca-is-my-home-lny` | **weak “Sat ~1w before LNY”** | Two years before LNY (~−3/−4 days). 2025 was Flower Market branding |
| `cpalss-lny-capstone` | **steward / park weekend** | Can land **on** LNY (2024). Not an estimate peer |
| `chasons-crab-stadium-lny` | **first Sun after LNY (preferred)** | 2025 matches; 2026 makeup breaks dayΔ — use product rule + `after`, not 2026 offset |
| Single-year peers | **insufficient** | Keep Estimated only with low-confidence gloss |

**Collision takeaway:** When LNY is midweek (2025–26), peers scatter before *and* after. When LNY is Saturday (2024, 2027), **on/after vs after** becomes a real product choice (EGLNY 2024 chose **on**).

---

## 4. Schema + display recommendation (LNY)

Do **not** use raw “copy prior Gregorian” or blind “same dayΔ as last year.”

### Fields (planning / estimate rows)

| Field | Values |
|-------|--------|
| `Estimate method` | `lny_weekend` · `first_dow_after_lny` · `first_dow_on_or_after_lny` · `before_lny_dow` · `capstone_relative` · `calendar_pattern` · `steward` · `insufficient` |
| `Estimate DOW` | `Sat` · `Sun` · `Fri` · … |
| `Estimate weekend offset` | integer vs LNY Saturday (nullable) |
| `Estimate tie-break` | `on_or_after` · `after` · `before` · `n/a` |
| `Pattern confidence` | `1yr` · `2yr_agree` · `2yr_conflict` · `3yr_mixed` |

### Suggested method seeds (after this memo)

- Chason’s → `first_dow_after_lny` · Sun · tie-break `after` · confidence `2yr_conflict` (makeup)  
- Creative Space → `before_lny_dow` · Sat · confidence `3yr_mixed`  
- SCNCCA / Arden Fair → `insufficient` until another year or organizer signal  
- Capstone → `steward`  

### Public gloss examples

- `Sat, Jan 30, 2027 (estimated Sat before LNY)`  
- `Sun, Feb 7, 2027 (estimated Sun after LNY)`  
- `Sat, Feb 6, 2027 (estimated Sat on/after LNY)` — only when method + tie-break say so  
- `Sat, Feb 7, 2026 (estimated; pattern unclear)` — conflict / insufficient  

Bare `(estimated)` is not enough once structured fields exist.

**Joint decision + display spec:** [`../research/season-date-estimate-schema-decision.md`](../research/season-date-estimate-schema-decision.md) · [`../research/public-estimated-date-display-spec.md`](../research/public-estimated-date-display-spec.md)

---

## 5. Open research

- SCNCCA / Arden 2024 dates  
- Fairytale 2024; Locke DOW policy  
- Confirm Chason’s 2024 evening date  
- ARI 2025  

Re-run matrix when those land.
