---
title: Public estimated-date display spec
asset_type: research
season: shared
status: draft
---

# Public estimated-date display — eglny + greatlantern

**Parent decision:** [`season-date-estimate-schema-decision.md`](season-date-estimate-schema-decision.md) · [`offset-tracking-schema-recommendation.md`](offset-tracking-schema-recommendation.md)

## Format

```text
{ShortDow}, {ShortMonth} {Day}, {Year} (estimated {rule gloss}; {confidence} confidence)
```

Optional hours stay after the year when present on the sheet, before the parentheses:

```text
Sat, Feb 14, 2027 noon-4 PM (estimated Sat before LNY; medium confidence)
```

When the rule itself is unclear:

```text
Sat, Feb 7, 2027 (estimated; pattern unclear; low confidence)
```

## Confidence (public)

Derived from how many **consecutive held years** the **same offset rule** matched (same method + Preferred DOW + tie-break + festival weekend offset or calendar pattern — not merely “same DOW”).

| Public label | Rule |
|--------------|------|
| **high confidence** | Offset rule matches **three years in a row** |
| **medium confidence** | Offset rule matches **two years in a row** (but not three) |
| **low confidence** | Everything else — one year only, non-consecutive agree, conflict, makeup year. **Estimate = last held year’s offset** (dayΔ or weekendΔ vs festival) applied to this year’s festival day; then optional Preferred DOW snap. |

Always show the confidence clause on Estimated rows. Do not upgrade to high/medium on steward guesswork without the streak.

**Low-confidence gloss:** Still describe the projected rule from last year (e.g. `Sat before LNY`), not `pattern unclear`, whenever a prior held year exists. Use `pattern unclear` only when there is **no** prior year to copy an offset from.

## Rule gloss tokens

| Gloss | When |
|-------|------|
| `Sat on/after LNY` | festival weekend / on_or_after; DOW Sat; season LNY |
| `Sun after LNY` | first DOW after; DOW Sun; season LNY |
| `Sat before LNY` | last DOW before; DOW Sat; season LNY |
| `Sat on/after MAF` | same for Autumn / MAF Saturday |
| `Sat MAF−1w` | festival_weekend; offset −1; DOW Sat |
| `Sat MAF+2w` | festival_weekend; offset +2 |
| `first Oct weekend` | calendar_pattern (civil; e.g. GPF) |
| `pattern unclear` | no prior held year to project from |

## Examples

- `Sat, Feb 6, 2027 (estimated Sat on/after LNY; low confidence)` — low ⇒ date from **last year’s** offset  
- `Sun, Feb 7, 2027 (estimated Sun after LNY; medium confidence)`  
- `Sat, Sep 19, 2026 (estimated Sat MAF−1w; high confidence)`  
- `Sat, Oct 3, 2026 (estimated first Oct weekend; medium confidence)`  
- `Sat, Feb 7, 2027 (estimated; pattern unclear; low confidence)` — only if no prior held year  

## Non-goals

- Do not show raw day offsets like `LNY−10` on the public site  
- Do not imply confirmation when Schedule confidence is Estimated  
- Do not omit confidence on Estimated rows  
