---
title: Google Sheets MCP Setup
layout: default
---

Live research data is stored in **Google Sheets** (source of truth). Cursor agents read and write via **`workspace-cpalss`** — full setup: [Google Workspace MCP](google-workspace-mcp.html).

## Sheet registry

Canonical links live in [sheets-registry.json](https://github.com/cPALSs/festival/blob/main/assets/sheets-registry.json).

| Dataset | Spreadsheet |
|---------|-------------|
| LNY market landscape | [Open in Google Sheets](https://docs.google.com/spreadsheets/d/1IB6beiKHC9R05r2o0imkh8MX_2u-qmhlVxTV3pxibs0/edit?usp=drive_link) |
| Autumn market landscape | [Open in Google Sheets](https://docs.google.com/spreadsheets/d/1Va0oCv09nyW98-JnWL9DuYYTsXG35cxjf_WqBZsySrA/edit?usp=drive_link) |

**LNY spreadsheet ID:** `1IB6beiKHC9R05r2o0imkh8MX_2u-qmhlVxTV3pxibs0`  
**Autumn spreadsheet ID:** `1Va0oCv09nyW98-JnWL9DuYYTsXG35cxjf_WqBZsySrA`

## Shared Drive folder layout

Recommended structure under your **Festival Network** Shared Drive:

```
Operations/Festival Network/
  Research/       ← market landscape, market analyses (use this, not Marketing)
  Calendars/      ← future: roll-up paths, scheduling
  Graphs/         ← future: ecosystem edges
  Operations/     ← future: steering trackers
```

Move the market landscape spreadsheet from **Marketing** to **Research** — that sheet is coalition market research, not outbound marketing collateral.

## Cursor / agent access

Use **`workspace-cpalss`**. Setup and auth: [Google Workspace MCP](google-workspace-mcp.html). Discover exact tool names with Cursor’s MCP tool list (`GetMcpTools`) — official Google Workspace MCP names differ from the retired `@dguido/google-workspace-mcp` tools.

Script OAuth for Node pipelines (not Cursor MCP) still uses `.google-workspace-oauth.json` via `npm run mcp:oauth -w festival`.

Drive/Docs notes: [google-drive-mcp.html](google-drive-mcp.html).

## Operating rules

- **Sheets = source of truth** — humans edit in Google Sheets; agents update via `workspace-cpalss`
- **Repo** holds `sheets-registry.json`, column schema, and guides — **not** live rows (no CSV)
- Match columns in [LNY schema](https://github.com/cPALSs/festival/blob/main/assets/lny/research/market-landscape-schema.md) or [Autumn schema](https://github.com/cPALSs/festival/blob/main/assets/autumn/research/market-landscape-schema.md)
- Protect row 1 (headers) in the Sheet
