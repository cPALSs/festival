---
title: Plan with AI
asset_type: guide
season: cross
---

# Plan with AI

For agents: **clone the repo** first. GitHub Pages is for humans; agents work from the repository files.

## Load AGENTS.md

Point your agent at [AGENTS.md](https://github.com/cPALSs/festival-network/blob/main/AGENTS.md). Load [sheets-registry.json](https://github.com/cPALSs/festival-network/blob/main/assets/sheets-registry.json) first.

**Requires:** [Google Sheets MCP](google-sheets-mcp.html) configured in Cursor (`.cursor/mcp.json`).

## Load order

1. `assets/sheets-registry.json`
2. MCP → read market landscape sheet
3. `market-landscape-schema.md` for column meanings
4. Graph → calendar → case studies → playbooks

## Example prompts

```
List tabs in the LNY market landscape spreadsheet.

Read all rows from the market landscape sheet. Summarize capstone overlap for EGLNY 2027.

List tabs in the autumn market landscape spreadsheet.

Read all rows from the market landscape sheet. Summarize MAF overlap categories.

Add a row for [event]: field read attendance ~X, source = field estimate, data gap = [gap].

Which events collide with MAF 2026 lunar weekend? Cross-check calendar rules.

Update the Notes for reviewers cell for CAAPS with [observation].
```

## Probabilistic planning

Use simulation YAML under `assets/autumn/simulations/scenarios/` once populated. Sheet data feeds scenarios; MCP writes back scenario outcomes only when you explicitly ask to log results.
