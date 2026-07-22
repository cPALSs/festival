---
title: Meeting workflow (Zoom MCP + local repo)
layout: default
---

# Meeting workflow

cPALSs no longer exports Zoom AI summaries to Notion via Zapier. Agents and humans use this flow instead.

## After a meeting

1. **On demand** — Ask Cursor to pull the recap from Zoom (`search_meetings` → `get_meeting_assets` / `get_recording_resource`).
2. **Save locally only if substantive** — Create or update a file under `Operations/Board Desk/` when:
   - The meeting produced decisions worth re-reading later (e.g. board debrief).
   - You need a **living checklist** with open items (rare for routine standups).
   - Festivals Committee / Festival Projects Weekly open actions → `Operations/Festivals Committee/Festivals Committee Tracker.md` (not Board Desk).
3. **Skip** creating files when the Zoom recap is enough for follow-up.

## Before a meeting

- Update the relevant agenda in `Governance/Partnerships/meeting-notes/` (e.g. `VACOS/Festival Projects Weekly agenda.md`) or Board drafts under `Operations/Board Desk/` when publishing Board minutes.
- Operational finance checklists stay in the relevant project season folder (e.g. `Programs/Lunar New Year/2026/Finance & Administration/`).

## Where things live

| Content | Location |
|---------|----------|
| AI summary, transcript, recording | Zoom (via MCP) |
| Pinned meeting notes | `Operations/Board Desk/*.md` |
| Finance / sponsor checklists | `Programs/Lunar New Year/2026/Finance & Administration/LNY-2026-*.md` |
| Tabular research | Google Sheets |
| Official coalition docs | Google Drive |

Agent rules: `.cursor/rules/zoom-mcp.mdc` and `.cursor/rules/local-ops.mdc` in the coalition monorepo.
