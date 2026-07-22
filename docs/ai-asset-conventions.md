---
title: AI-Readable Conventions
asset_type: conventions
season: cross
---

# AI-readable conventions

**AI-readable** means an agent can `git clone` this repository and work from structured files — `AGENTS.md`, `assets/sheets-registry.json`, schemas, JSON graphs, markdown kits — without scraping GitHub Pages. **Human-friendly** copy lives in `docs/` and is published at [festival.cpalss.com](https://festival.cpalss.com/).

## Source of truth

| Data type | Canonical store | Repo holds |
|-----------|-----------------|------------|
| Tabular research (market landscape, etc.) | **Google Sheets** | [sheets-registry.json](https://github.com/cPALSs/festival/blob/main/assets/sheets-registry.json), column schema |
| Graphs, calendars, kits (for now) | Repo JSON/Markdown | `assets/` |
| Private organizer notes | Staging folder | `assets/autumn/staging/` (not all published) |

Agents **read and write live sheets via MCP** (`google-sheets`). See [google-sheets-mcp.html](google-sheets-mcp.html).

## Public site links

GitHub Pages publishes `docs/` only. On human-facing pages:

- Link to other site pages with **`.html`** (e.g. [research.html](research.html)).
- Link to repo files with **GitHub blob/tree URLs** on [cPALSs/festival](https://github.com/cPALSs/festival) — not relative `../assets/` paths.
- Do **not** link to coalition-internal monorepo paths (private cPALSs repo, `Operations/Board Desk/`, project folders) — name them in plain text instead.

## Sheet registry

Add a new spreadsheet to [assets/sheets-registry.json](https://github.com/cPALSs/festival/blob/main/assets/sheets-registry.json):

```json
{
  "id": "slug",
  "title": "Human title",
  "spreadsheet_id": "from URL",
  "url": "https://docs.google.com/spreadsheets/d/.../edit",
  "season": "lny | autumn | cross",
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
season: lny | autumn | cross
---
```

## Column dictionaries

Each canonical sheet has a schema doc (e.g. [market-landscape-schema.md](https://github.com/cPALSs/festival/blob/main/assets/autumn/research/market-landscape-schema.md)). Sheet row 1 must match schema headers exactly.

## Rules as data

Calendar rules and graph schemas live in `assets/` as JSON + `schema.md` until migrated to Sheets.

## Simulation scenarios

YAML scenarios in `assets/autumn/simulations/scenarios/` reference `event_id` values from the live sheet.

## Tone and wording

Public pages use plain language. When both seasons appear together, say **Lunar New Year & Autumn Festivals** ([tone of voice](tone-of-voice.html)). Sheet columns may use short enum labels (`Direct comp - same city`). Every enum needs a gloss in the schema and in [tone of voice](tone-of-voice.html).

## Markdown layout

Published `docs/` pages use a narrow column (especially with the on-page TOC). Before adding tables, follow [content patterns](content-patterns.html) — record blocks and two-column summaries instead of 4+ prose columns; `{: .table-scroll}` for true matrices.
