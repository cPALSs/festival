---
title: Notion MCP (deprecated)
layout: default
---

# Notion MCP — deprecated

The personal cPALSs Notion workspace has been **retired** in favor of:

- **Zoom Workspace MCP** — meeting summaries, transcripts, recordings ([zoom-mcp.html](zoom-mcp.html))
- **Local repo** — `Staff - Meeting/`, `Staff - Ops/` ([meeting-workflow.html](meeting-workflow.html))
- **Google Sheets / Drive** — tabular research and coalition docs

Notion MCP has been removed from `.cursor/mcp.json` in the coalition monorepo.

## Migration completed (2026-06-25)

Substantive Notion pages moved to coalition-internal markdown:

- `Staff - Ops/LNY-2026-budget-reconciliation.md`
- `Staff - Ops/LNY-2026-sponsor-reconciliation.md`
- `Staff - Meeting/Festival Projects Weekly agenda.md`

Empty or trivial Notion tasks were skipped. Disable Zapier: [zapier-deprecation.html](zapier-deprecation.html).

Agent rule (deprecated pointer): `.cursor/rules/notion-mcp.mdc`. Use `.cursor/rules/local-ops.mdc` instead in the coalition monorepo.
