---
title: Getting Started
layout: default
---

# Getting Started

## Clone or fork

```bash
git clone https://github.com/cPALSs/festival-network.git
cd festival-network
```

Public site: [cpalss.github.io/festival-network](https://cpalss.github.io/festival-network/)

Staging home in cPALSs monorepo: `Festival Network/` (this folder is published to the repo above)

## Source of truth

**Live research data is in Google Sheets.** The repo stores links, schemas, and guides.

| What | Where |
|------|--------|
| Sheet registry (links + IDs) | [assets/sheets-registry.json](../assets/sheets-registry.json) |
| Autumn competitive landscape | [Open in Google Sheets](https://docs.google.com/spreadsheets/d/1Va0oCv09nyW98-JnWL9DuYYTsXG35cxjf_WqBZsySrA/edit?usp=drive_link) |
| MCP setup for Cursor | [google-sheets-mcp.md](google-sheets-mcp.html) |
| AI entry | [AGENTS.md](../AGENTS.md) |

Shared Drive layout: **`Festival Network / Research`** (not Marketing) for market research sheets.

## Find assets

| Layer | Location |
|-------|----------|
| Human guides | `docs/` (this site) |
| Sheet registry + schemas | `assets/sheets-registry.json`, `assets/**/schema*` |
| Machine-readable (non-sheet) | `assets/` — graphs, calendars, kits |
| AI entry | [AGENTS.md](../AGENTS.md) |

## Load order (for AI)

1. Sheets registry → 2. MCP read live sheet → 3. Graph → 4. Calendar → 5. Case studies → 6. Playbooks & kits

## Asset catalog

### Autumn

| Asset | Location |
|-------|----------|
| **Competitive landscape (live)** | [Google Sheet](https://docs.google.com/spreadsheets/d/1Va0oCv09nyW98-JnWL9DuYYTsXG35cxjf_WqBZsySrA/edit?usp=drive_link) |
| Landscape schema | [competitive-landscape-schema.md](../assets/autumn/research/competitive-landscape-schema.md) |
| Season report | [greater-sac-autumn-season-report.md](../assets/autumn/research/greater-sac-autumn-season-report.md) |
| Ecosystem graph | [ecosystem-graph.json](../assets/autumn/graphs/ecosystem-graph.json) |
| Graph schema | [ecosystem-graph.schema.json](../assets/autumn/graphs/ecosystem-graph.schema.json) |
| Calendar rules | [calendar-rules.json](../assets/autumn/calendars/rules/calendar-rules.json) |
| 2027 season path | [2027-season-path-grid.md](../assets/autumn/calendars/2027-season-path-grid.md) |
| Roll-up arcs | [rollup-arcs.md](../assets/autumn/calendars/rollup-arcs.md) |
| Playbooks | [playbooks/](../assets/autumn/playbooks/) |
| Group kits | [group-activities/](../assets/autumn/group-activities/) |
| Simulations | [simulations/PLANNING.md](../assets/autumn/simulations/PLANNING.md) |

### Cross-season

| Asset | File |
|-------|------|
| Case studies | [case-studies/](../assets/case-studies/) |
| Shared kits | [shared/group-activities/](../assets/shared/group-activities/) |

### LNY (stub)

| Asset | File |
|-------|------|
| Overview | [lny/overview.html](lny/overview.html) |
| Assets | [assets/lny/](../assets/lny/) |

## Next steps

- [Google Sheets MCP setup](google-sheets-mcp.html)
- [Plan with AI](plan-with-ai.html)
- [Research guide](research.html)
- [Contribute](contribute.html)
