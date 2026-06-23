# AGENTS.md — Festival Season Networks

Instructions for AI agents working with this repository.

## Phase notice

**Phase 0:** Most files are **stubs** (`status: stub` in frontmatter). Do not treat placeholder content as field research. Prefer explicit `TODO` markers over inference.

## Source of truth: Google Sheets

**Live tabular data lives in Google Sheets**, not in repo CSVs. The repo stores links, schemas, and guides.

| Registry | Path |
|----------|------|
| Sheet links + IDs | [assets/sheets-registry.json](assets/sheets-registry.json) |
| MCP setup | [docs/google-sheets-mcp.md](docs/google-sheets-mcp.md) |

**MCP:** Use the `google-sheets` MCP server (`google-sheet-mcp`) to read and update sheets. If MCP is unavailable, ask the user to run setup in `docs/google-sheets-mcp.md` — do not treat repo CSV as canonical.

### Autumn competitive landscape

Registry ID: `autumn-competitive-landscape` in [assets/sheets-registry.json](assets/sheets-registry.json)

| | |
|---|---|
| **Title** | Greater Sacramento Autumn Season - Competitive Landscape |
| **Spreadsheet ID** | `1Va0oCv09nyW98-JnWL9DuYYTsXG35cxjf_WqBZsySrA` |
| **URL** | https://docs.google.com/spreadsheets/d/1Va0oCv09nyW98-JnWL9DuYYTsXG35cxjf_WqBZsySrA/edit |
| **Tab** | `Greater Sacramento Autumn Season - Competitive Landscape` |
| **Schema** | [assets/autumn/research/competitive-landscape-schema.md](assets/autumn/research/competitive-landscape-schema.md) |

**No local CSV** — this sheet is the only canonical copy of autumn event rows. Read and write via MCP (`sheets_read_range`, `sheets_write_range`, `sheets_append_row`).

## Load order

1. **Sheets registry** — `assets/sheets-registry.json`
2. **Research (live)** — MCP read competitive landscape sheet → schema doc for column meanings
3. **Ecosystem graph** — `assets/autumn/graphs/ecosystem-graph.json` + `ecosystem-graph.schema.json` (until graph moves to Sheets)
4. **Calendar** — `assets/autumn/calendars/rules/calendar-rules.json` + `schema.md` + `2027-season-path-grid.md`
5. **Case studies** — `assets/case-studies/*.md`
6. **Playbooks & kits** — `assets/autumn/playbooks/`, `assets/autumn/group-activities/`, `assets/shared/group-activities/`
7. **Simulations** — `assets/autumn/simulations/PLANNING.md`, `scenarios/`, `plans/`

Human guides: `docs/` (GitHub Pages source).

## Principles (constraints)

- **P1** — Roll-up calendar: R0 warm-up → R1 bridge → R2 capstone → R3 afterglow (small post-capstone gatherings: banquets, thank-yous); avoid roll-up violations (e.g. second capstone in same lane)
- **P2** — Group-based attendance: named crews, home bases, not anonymous crowds
- **P3** — Right-sizing: capacity follows mobilized groups + field benchmarks
- **P4** — Stakeholder sustainability: vendors don't lose money; sponsors → patrons

## Stable ID conventions

- Events: `event_id` slug (e.g. `maf-2026`, `caaps-2025`)
- Lanes: `L1`–`L7`
- Arcs: `arc-moon`, `arc-fall`, `arc-lantern`, `ambient`
- Weekend slots: `2027-wk-sep-26`

See [docs/ai-asset-conventions.md](docs/ai-asset-conventions.md).

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
