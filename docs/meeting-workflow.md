---
title: Meeting workflow (Zoom MCP + local repo)
layout: default
---

# Meeting workflow

cPALSs no longer exports Zoom AI summaries to Notion via Zapier. Agents and humans use this flow instead.

## After a meeting

1. **On demand** — Ask Cursor to pull the recap from Zoom (`search_meetings` → `get_meeting_assets` / `get_recording_resource`).
2. **Save locally only if substantive** — Create or update a file under `Staff - Meeting/` when:
   - The meeting produced decisions worth re-reading later (e.g. board debrief).
   - You need a **living checklist** with open items (rare for routine standups).
3. **Skip** creating files when the Zoom recap is enough for follow-up.

## Before a meeting

- Update the relevant agenda in `Staff - Meeting/` (e.g. [Festival Projects Weekly agenda.md](../../../Staff%20-%20Meeting/Festival%20Projects%20Weekly%20agenda.md)).
- Operational finance checklists stay in `Staff - Ops/`.

## Where things live

| Content | Location |
|---------|----------|
| AI summary, transcript, recording | Zoom (via MCP) |
| Pinned meeting notes | `Staff - Meeting/*.md` |
| Finance / sponsor checklists | `Staff - Ops/*.md` |
| Tabular research | Google Sheets |
| Official coalition docs | Google Drive |

Agent rules: [`.cursor/rules/zoom-mcp.mdc`](../../../.cursor/rules/zoom-mcp.mdc), [`.cursor/rules/local-ops.mdc`](../../../.cursor/rules/local-ops.mdc).
