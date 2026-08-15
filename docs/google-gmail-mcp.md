---
title: Google Gmail MCP (coalition monorepo)
layout: default
---

Gmail is **`workspace-cpalss`**. Setup and auth: [Google Workspace MCP](google-workspace-mcp.html).

## Prerequisites

1. In Google Cloud → **APIs & Services** → enable **Gmail API** (same project as Drive / Workspace MCP).
2. In Cursor **Settings → MCP**, connect/authenticate **`workspace-cpalss`** as **bao@cpalss.com** with compose scope if you need drafts/send.

## Agent tools (high level)

Discover exact tool names with Cursor’s MCP tool list (`GetMcpTools`). Typical intents: search/read threads, draft or send mail (when scopes allow), label/triage.

## Board reminder fan-out

After auth, agents can send the email leg of [Board Reminder Fan-out Process](../../../Board%20Desk/Board%20Reminder%20Fan-out%20Process.md) to `board@` · `advisory@` · `chairs@`. SMS stays manual until carriers/gateways are ready.

## Related

- Workspace MCP: [google-workspace-mcp.html](google-workspace-mcp.html)
- Calendar: [google-calendar-mcp.html](google-calendar-mcp.html)
- Drive/Docs: [google-drive-mcp.html](google-drive-mcp.html)
- Sheets: [google-sheets-mcp.html](google-sheets-mcp.html)
