---
title: Competitive Landscape Schema
asset_type: schema
season: autumn
---

# Competitive Landscape Schema

**Live sheet:** [Greater Sacramento Autumn Season - Competitive Landscape](https://docs.google.com/spreadsheets/d/1Va0oCv09nyW98-JnWL9DuYYTsXG35cxjf_WqBZsySrA/edit?usp=drive_link)

Row 1 in the Sheet must match these headers exactly.

## Column dictionary

| Column | Meaning |
|--------|---------|
| Category | Lane — e.g. `Mid-Autumn / Moon / Lantern`, `Autumn Family Fair`, `Activity Comp (reference)` |
| Tier | Priority within category — `1` (direct), `2`, `3`, or `A`/`B`/`C` for family fairs |
| Event Name | Display name |
| Host / Organizer | Producing org |
| City | Primary city |
| Venue | Location detail |
| Typical / Recent Dates | Last known or planned dates |
| Duration | Hours or days |
| Admission | Free, ticketed, parking notes |
| Attendance (number or range) | Best honest number or range |
| Attendance source | `Field estimate`, `Organizer claim`, `CCSD`, `Internal planning`, etc. |
| Vendor count (approx) | Booth/vendor scale if known |
| Lunar aligned | Yes / Partial / No |
| Vietnamese focus | Yes / Partial / No |
| Kids / family center | Yes / Partial / No |
| Lantern moment | Yes / Partial / No — procession, release, making |
| MAF overlap | Relationship to cPALSs/NVCC/VACOS MAF — `Our event`, `Direct comp`, `Substitute`, `Reference only` |
| Notes for reviewers | Steering context, honesty gaps, ecosystem notes |
| Source URL | Primary citation |
| Data gap | What is still unknown or unverified |

## Enums

**MAF overlap (common values):** `Our event`, `Direct comp - same city`, `Direct comp - spectacle product`, `Direct comp - late September`, `Direct comp - lunar weekend`, `Substitute - October`, `Substitute - same city + ecosystem`, `Reference only`, `Low - commercial`, `Low - church program`

**Attendance source:** Always set when attendance is non-empty. Distinguish press/organizer claims from field reads.

## Data gap semantics

- Use **Data gap** for open questions — never leave a fake number in **Attendance** to fill silence
- `N/A - our event` when the row is coalition MAF planning
- `Historical reference only` for prior-year rows not in current comp set
- `Not autumn competitive set` for out-of-season reference rows (e.g. IKF)

## Future columns (deferred)

Scheduling tier, roll-up arc, R-tier, capstone event, weeks before capstone, recommended 2027 slot, collision flag, network member, relationship product — add to Sheet + this doc together when substance phase starts.
