---
title: Meeting workflow (Zoom MCP + local repo)
layout: default
---

cPALSs no longer exports Zoom AI summaries to Notion via Zapier. Agents and humans use this flow instead.

## After a meeting

1. **Daily sync** — The [daily project brief](../../../.cursor/skills/daily-project-brief/SKILL.md) pulls **cPALSs Board Weekly** and **Festival Projects Weekly** summaries / next steps, reconciles Bao / Festivals Chair tasks onto the Festivals tracker, and **refreshes the upcoming Board agenda** when those tasks moved. See [zoom.md](../../../.cursor/skills/daily-project-brief/zoom.md) · [board-agenda.md](../../../.cursor/skills/daily-project-brief/board-agenda.md).
2. **On demand** — Ask Cursor to pull any other call from Zoom (`search` `zoom_meeting` → `get_meeting_assets` / `get_recording_resource`).
3. **Save locally only if substantive** — Create or update a file under `Operations/Board Desk/` when:
   - The meeting produced decisions worth re-reading later (e.g. board debrief).
   - You need a **living checklist** with open items (rare for routine standups).
   - Festivals Committee / Festival Projects Weekly open actions → `Operations/Festivals Committee/Festivals Committee Tracker.md` (not Board Desk).
4. **Skip** creating extra files when the Zoom recap plus tracker / agenda update is enough.

Filling **minutes** after a held Board meeting is a separate skill (`board-minutes`) — not the daily brief. Republishing the **next** agenda Doc when status moved **is** the daily brief.

## Before a meeting

- Update the relevant agenda in `Community/meeting-notes/` (e.g. `VACOS/Festival Projects Weekly agenda.md`) or Board drafts under `Operations/Board Desk/` when publishing Board minutes.
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
