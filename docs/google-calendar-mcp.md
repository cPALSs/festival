---
title: Google Calendar MCP (coalition monorepo)
layout: default
---

Calendar is **`workspace-cpalss`**. Setup and auth: [Google Workspace MCP](google-workspace-mcp.html).

## Prerequisites

1. In Google Cloud → **APIs & Services** → enable **Google Calendar API** (same project as Drive / Workspace MCP).
2. In Cursor **Settings → MCP**, connect/authenticate **`workspace-cpalss`** as **bao@cpalss.com**.

Script OAuth (non-MCP) still uses `.google-workspace-oauth.json`:

```bash
npm run mcp:oauth -w festival
```

## Agent tools (high level)

Discover exact tool names with Cursor’s MCP tool list (`GetMcpTools`). Typical intents: list calendars/events, create/update/delete events when scopes allow, free/busy.

## Related

- Workspace MCP: [google-workspace-mcp.html](google-workspace-mcp.html)
- Drive/Docs: [google-drive-mcp.html](google-drive-mcp.html)
- Sheets: [google-sheets-mcp.html](google-sheets-mcp.html)
