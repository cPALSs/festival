---
title: Using Market Research
asset_type: guide
season: cross
---

# Using Market Research

## Why shared research

Greater Sacramento runs twenty-plus autumn programs and a dozen-plus LNY season events. Coalition planners should not each reinvent the comp set. One honest landscape per season — shared, forkable, peer-reviewable — reduces chaos and honesty gaps.

## Autumn — live data

**Source of truth:** [Greater Sacramento Autumn Season - Competitive Landscape](https://docs.google.com/spreadsheets/d/1Va0oCv09nyW98-JnWL9DuYYTsXG35cxjf_WqBZsySrA/edit?usp=drive_link) — edit **All**; browse **2026** / **2025**

| Resource | Path |
|----------|------|
| Sheet registry | [sheets-registry.json](../assets/sheets-registry.json) → `autumn-competitive-landscape` |
| Column schema | [competitive-landscape-schema.md](../assets/autumn/research/competitive-landscape-schema.md) |
| Narrative report | [greater-sac-autumn-season-report.md](../assets/autumn/research/greater-sac-autumn-season-report.md) |

## LNY — live data

**Source of truth:** [Greater Sacramento Lunar New Year Season - Competitive Landscape](https://docs.google.com/spreadsheets/d/1IB6beiKHC9R05r2o0imkh8MX_2u-qmhlVxTV3pxibs0/edit?usp=drive_link) — edit **All**; browse **2027** / **2026**

| Resource | Path |
|----------|------|
| Sheet registry | [sheets-registry.json](../assets/sheets-registry.json) → `lny-competitive-landscape` |
| Column schema | [competitive-landscape-schema.md](../assets/lny/research/competitive-landscape-schema.md) |
| Narrative report | [greater-sac-lny-season-report.md](../assets/lny/research/greater-sac-lny-season-report.md) |
| Season overview | [lny/overview.md](lny/overview.md) |

Seeded from the 2026 **Lunar New Year Season** flyer (12 events Jan 24–Mar 7).

## MCP setup

[google-sheets-mcp.md](google-sheets-mcp.md) — pass `spreadsheet` ID per registry entry when reading/writing.

## Occurrence rows

Each competitive landscape row is **one year of one event**. Filter `Season year` + `Row status` for current planning; filter `event_id` for history. Do not overwrite held rows when adding next year.

## Honest scale methodology

- Separate **organizer/press claims** from **field reads** and **internal planning**
- Use **Attendance source** column every time
- Log **Data gap** when a number is unknown — do not invent
- Planning band for MAF: **2,500 attendees** (not stranger-scale flyer math)

## Contributing

1. Request edit access to the sheet (or propose rows in a case study / issue)
2. Match columns in the schema doc; protect header row
3. For agent-assisted updates: ensure [Google Sheets MCP](google-sheets-mcp.md) is configured

See also [CONTRIBUTING-RESEARCH.md](../assets/autumn/research/CONTRIBUTING-RESEARCH.md).
