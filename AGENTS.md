# AGENTS.md — Festival Season Networks

Instructions for AI agents working with this repository.

**Clone this repo.** Agents use the git tree (`assets/`, schemas, `AGENTS.md`) — not the rendered GitHub Pages HTML. Humans read [cpalss.github.io/festival-network](https://cpalss.github.io/festival-network/).

## Phase notice

**Phase 0:** Most files are **stubs** (`status: stub` in frontmatter). Do not treat placeholder content as field research. Prefer explicit `TODO` markers over inference.

## Source of truth: Google Sheets

**Live tabular data lives in Google Sheets**, not in repo CSVs. The repo stores links, schemas, and guides.

| Registry | Path |
|----------|------|
| Sheet links + IDs | [assets/sheets-registry.json](assets/sheets-registry.json) |
| MCP setup | [docs/google-sheets-mcp.md](docs/google-sheets-mcp.md) |

**MCP:** Use the `google-sheets` MCP server (`google-sheet-mcp`) to read and update sheets. If MCP is unavailable, ask the user to run setup in `docs/google-sheets-mcp.md` — do not treat repo CSV as canonical.

## Google Drive + Docs (sponsorship packets)

**Per-festival** folder and document IDs live in each project's `drive-registry.json` — see [drive-registry index](assets/drive-registry.json). Generic templates: `scripts/content/sponsorship-packet-standard.md`, post-event report templates.

**MCP:** Use the `google-drive` MCP server for sponsorship packet edits. Dollar amounts sync from each project's `festival_registry.json`.

### LNY market landscape

Registry ID: `lny-market-landscape` in [assets/sheets-registry.json](assets/sheets-registry.json)

| | |
|---|---|
| **Title** | Greater Sacramento Lunar New Year Season - Market Landscape |
| **Spreadsheet ID** | `1IB6beiKHC9R05r2o0imkh8MX_2u-qmhlVxTV3pxibs0` |
| **URL** | https://docs.google.com/spreadsheets/d/1IB6beiKHC9R05r2o0imkh8MX_2u-qmhlVxTV3pxibs0/edit |
| **Tab (data)** | `All` |
| **View tabs** | `2027`, `2026` (newest first) |
| **Schema** | [assets/lny/research/market-landscape-schema.md](assets/lny/research/market-landscape-schema.md) |

Seeded from the 2026 **Lunar New Year Season** flyer (12 events Jan 24–Mar 7) plus ecosystem reference rows. **No local CSV.**

### Autumn market landscape

Registry ID: `autumn-market-landscape` in [assets/sheets-registry.json](assets/sheets-registry.json)

| | |
|---|---|
| **Title** | Greater Sacramento Autumn Season - Market Landscape |
| **Spreadsheet ID** | `1Va0oCv09nyW98-JnWL9DuYYTsXG35cxjf_WqBZsySrA` |
| **URL** | https://docs.google.com/spreadsheets/d/1Va0oCv09nyW98-JnWL9DuYYTsXG35cxjf_WqBZsySrA/edit |
| **Tab (data)** | `All` |
| **View tabs** | `2026`, `2025` (newest first) |
| **Schema** | [assets/autumn/research/market-landscape-schema.md](assets/autumn/research/market-landscape-schema.md) |

**No local CSV** — this sheet is the only canonical copy of autumn event rows. Read and write via MCP (`sheets_read_range`, `sheets_write_range`, `sheets_append_row`).

## Load order

1. **Sheets registry** — `assets/sheets-registry.json`
2. **Research (live)** — MCP read market landscape sheet (lny or autumn) → schema doc for column meanings
3. **Ecosystem graph** — `assets/lny/graphs/ecosystem-graph.json` or `assets/autumn/graphs/ecosystem-graph.json` + schema (until graph moves to Sheets)
4. **Calendar** — `assets/autumn/calendars/rules/calendar-rules.json` + `schema.md` + `2027-season-path-grid.md`
5. **Case studies** — `assets/case-studies/*.md`
6. **Playbooks & kits** — `assets/autumn/playbooks/`, `assets/autumn/group-activities/`, `assets/shared/group-activities/`, `assets/shared/playbooks/`
7. **Simulations** — `assets/autumn/simulations/PLANNING.md`, `scenarios/`, `plans/`

Human guides: `docs/` (published as GitHub Pages for people; agents may read the same markdown from the clone).

## File catalog

Paths below are for agents after `git clone` — not surfaced on GitHub Pages.

### LNY

| Asset | Path |
|-------|------|
| Landscape schema | `assets/lny/research/market-landscape-schema.md` |
| Season report | `assets/lny/research/greater-sac-lny-season-report.md` |
| Ecosystem graph | `assets/lny/graphs/ecosystem-graph.json` |
| Playbooks / kits | `assets/lny/playbooks/`, `assets/lny/group-activities/` |

### Autumn

| Asset | Path |
|-------|------|
| Landscape schema | `assets/autumn/research/market-landscape-schema.md` |
| Season report | `assets/autumn/research/greater-sac-autumn-season-report.md` |
| Ecosystem graph | `assets/autumn/graphs/ecosystem-graph.json` |
| Graph schema | `assets/autumn/graphs/ecosystem-graph.schema.json` |
| Calendar rules | `assets/autumn/calendars/rules/calendar-rules.json` |
| 2027 season path | `assets/autumn/calendars/2027-season-path-grid.md` |
| Roll-up arcs | `assets/autumn/calendars/rollup-arcs.md` |
| Playbooks | `assets/autumn/playbooks/` |
| Group kits | `assets/autumn/group-activities/` |
| Simulations | `assets/autumn/simulations/PLANNING.md` |

### Cross-season

| Asset | Path |
|-------|------|
| Case studies | `assets/case-studies/` |
| Shared kits | `assets/shared/group-activities/` |
| Shared playbooks | `assets/shared/playbooks/` — [child audience index](assets/shared/playbooks/child-cohort-product-design.md) → `docs/child-audience/` topic pages |

## Principles (constraints)

- **P1** — Roll-up calendar: R0 warm-up → R1 bridge → R2 capstone → R3 afterglow (small post-capstone gatherings: banquets, thank-yous); avoid roll-up violations (e.g. second capstone in same lane)
- **P2** — Group-based attendance: named crews, home bases, not anonymous crowds
- **P3** — Right-sizing: capacity follows mobilized groups + field benchmarks
- **P4** — Stakeholder sustainability: vendors don't lose money; sponsors → patrons

## Stable ID conventions

- **Season naming:** Together → **Lunar New Year & Autumn Festivals** (LNY always before Autumn when listing both); alone → LNY / EGLNY or Autumn / Mid-Autumn / MAF ([tone of voice](docs/tone-of-voice.md))
- **Events:** `event_id` slug on every landscape row — e.g. `cpalss-maf`, `cpalss-lny-capstone`, `caaps-lantern`
- **Occurrences:** one row per `event_id` + `Season year`; use `Row status` (`planning`, `held`, `historical`, …)
- **Schedule confidence** (autumn landscape): `Confirmed` · `Tentative` · `Estimated` — steward-verified; see [autumn market-research.md](docs/autumn/market-research.md). **Estimated** lunar-aligned dates use **MAF Saturday ± N weekends** from the prior held occurrence (not same Gregorian date); non-lunar rows keep calendar patterns — [schema](assets/autumn/research/market-landscape-schema.md)
- **Stakeholder involvement:** Community Activity Calendar → **Stakeholder event involvement** tab; sync via `scripts/sync-stakeholder-involvements.mjs`
- **Lanes:** `L1`–`L7`
- Arcs: `arc-moon`, `arc-fall`, `arc-lantern`, `ambient`
- Weekend slots: `2027-wk-sep-26`

See [docs/ai-asset-conventions.md](docs/ai-asset-conventions.md) and [docs/content-patterns.md](docs/content-patterns.md) for table layout in published guides.

## Graph edge types

`sponsors`, `performs_at`, `vends_at`, `organizes`, `hosts_at`, `roll_up_path`, `shared_patron_pool`

## Harmony goal

Merge **market research** (structure) + **observations** (relationships) in the ecosystem graph to support **ecosystem harmony** — aligned season for events and stakeholders.

## Simulations (when substance exists)

- Calendar what-if → `scenarios/*.yaml`
- Right-sizing → `playbooks/right-sizing.md`
- Graph harmony → `scenarios/graph-harmony-*.yaml` (deferred)

## Staging (cPALSs)

Private organizer notes may live in `assets/autumn/staging/organizer-context/` — not all content is published.
