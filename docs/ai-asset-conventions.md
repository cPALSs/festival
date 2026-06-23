---
title: AI-Readable Conventions
asset_type: conventions
season: cross
---

# AI-Readable Conventions

## Source of truth

| Data type | Canonical store | Repo holds |
|-----------|-----------------|------------|
| Tabular research (competitive landscape, etc.) | **Google Sheets** | [sheets-registry.json](../assets/sheets-registry.json), column schema |
| Graphs, calendars, kits (for now) | Repo JSON/Markdown | `assets/` |
| Private organizer notes | Staging folder | `assets/autumn/staging/` (not all published) |

Agents **read and write live sheets via MCP** (`google-sheets`). See [google-sheets-mcp.md](google-sheets-mcp.md).

## Sheet registry

Add a new spreadsheet to [assets/sheets-registry.json](../assets/sheets-registry.json):

```json
{
  "id": "slug",
  "title": "Human title",
  "spreadsheet_id": "from URL",
  "url": "https://docs.google.com/spreadsheets/d/.../edit",
  "season": "autumn | lny | cross",
  "schema": "path/to/schema.md",
  "tab": "Tab name or null"
}
```

## Stable IDs

- **Events:** `event_id` slug — `maf-2026`, `caaps-2025`, `gpf-2026`
- **Lanes:** `L1`–`L7` (moon, fall fair, lantern, ambient, etc.)
- **Arcs:** `arc-moon`, `arc-fall`, `arc-lantern`, `ambient`
- **Weekend slots:** `2027-wk-sep-26`

Prefer stable `event_id` when adding rows; update fields, do not rename IDs without explicit intent.

## YAML frontmatter

Markdown assets use:

```yaml
---
status: stub | draft | review | published
title: ...
asset_type: schema | playbook | case-study | guide
season: autumn | lny | cross
---
```

## Column dictionaries

Each canonical sheet has a schema doc (e.g. [competitive-landscape-schema.md](../assets/autumn/research/competitive-landscape-schema.md)). Sheet row 1 must match schema headers exactly.

## Rules as data

Calendar rules and graph schemas live in `assets/` as JSON + `schema.md` until migrated to Sheets.

## Simulation scenarios

YAML scenarios in `assets/autumn/simulations/scenarios/` reference `event_id` values from the live sheet.

## Tone and wording

Public pages use plain language. Sheet columns may use short enum labels (`Direct comp - same city`). Every enum needs a gloss in the schema and in [tone of voice](tone-of-voice.md).
