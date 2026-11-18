---
title: Getting Started
layout: default
---

## Humans vs AI agents

| | Humans | AI agents |
|---|--------|-----------|
| **Start here** | This site ([GitHub Pages](https://festival.cpalss.com/)) | `git clone` → [AGENTS.md](https://github.com/cPALSs/festival/blob/main/AGENTS.md) |
| **Why** | Readable guides, principles, links | Structured files in the repo tree + live Google Sheets via MCP |

## Live research (Google Sheets)

**Event rows live in Google Sheets** — edit the **All** tab; browse year tabs (**2027** / **2026** for LNY, **2026** / **2025** for autumn).

| Season | Sheet |
|--------|-------|
| Lunar New Year | [Greater Sacramento LNY Season — Market Landscape](https://docs.google.com/spreadsheets/d/1IB6beiKHC9R05r2o0imkh8MX_2u-qmhlVxTV3pxibs0/edit?usp=drive_link) |
| Autumn | [Greater Sacramento Autumn Season — Market Landscape](https://docs.google.com/spreadsheets/d/1Va0oCv09nyW98-JnWL9DuYYTsXG35cxjf_WqBZsySrA/edit?usp=drive_link) |

How to read and contribute: [Using market research](research.html). Season guides: [LNY market research](lny/market-research.html), [Autumn market research](autumn/market-research.html). Cross-season: [Season coordination](season-coordination.html).

Shared Drive layout: **`Festival Network / Research`** (not Marketing) for market research sheets.

## Next steps

Start from the [homepage toolkit](/) — tools any festival organizer can fork:

- [Auspicious Date Picker](auspicious-date-picker.html) — which weekend to book
- [Weather Risk Monitor](weather-cancel-aid.html) — NWS clear / modify / cancel posture
- [Food Menu Curator](food-menu-curator.html) — vendor composition + public menu
- [Season Coordinator](season-coordination.html) · [Market Landscape](research.html) · [Staff Recruitment](staff-recruitment-checklist.html)
- [Principles (P1–P4)](principles.html)
- Season guides: [LNY research](lny/market-research.html), [Autumn research](autumn/market-research.html)

## Planning with AI {#planning-with-ai}

If you use Cursor or another agent: [Plan with AI](plan-with-ai.html) and [Google Workspace MCP](google-workspace-mcp.html). Clone the repo and follow [AGENTS.md](https://github.com/cPALSs/festival/blob/main/AGENTS.md) — file paths, schemas, and JSON live in the clone, not on these pages.

```bash
git clone https://github.com/cPALSs/festival.git
cd festival
```

**cPALSs staging:** public repo lives in `Operations/Festival Network/shared/`; local MCP tooling and scripts stay in parent `Operations/Festival Network/` (not published).
