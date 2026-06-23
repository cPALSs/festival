---
title: Plan with AI
asset_type: guide
season: cross
---

# Plan with AI

## Load AGENTS.md

Point your agent at [AGENTS.md](../AGENTS.md). Load [sheets-registry.json](../assets/sheets-registry.json) first.

**Requires:** [Google Sheets MCP](google-sheets-mcp.html) configured in Cursor (`.cursor/mcp.json`).

## Load order

1. `assets/sheets-registry.json`
2. MCP → read competitive landscape sheet
3. `competitive-landscape-schema.md` for column meanings
4. Graph → calendar → case studies → playbooks

## Example prompts

```
List tabs in the autumn competitive landscape spreadsheet.

Read all rows from the competitive landscape sheet. Summarize MAF overlap categories.

Add a row for [event]: field read attendance ~X, source = field estimate, data gap = [gap].

Which events collide with MAF 2026 lunar weekend? Cross-check calendar rules.

Update the Notes for reviewers cell for CAAPS with [observation].
```

## Probabilistic planning

Use simulation YAML under `assets/autumn/simulations/scenarios/` once populated. Sheet data feeds scenarios; MCP writes back scenario outcomes only when you explicitly ask to log results.
