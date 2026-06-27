---
title: Zoom MCP smoke test
layout: default
---

# Zoom MCP smoke test

Run after completing [zoom-mcp.md](zoom-mcp.md) setup.

**Verified 2026-06-25:** `search_meetings` + `get_meeting_assets` for Festival Projects Weekly (2026-06-23) returned Mid-Autumn Festival budget / "Build the Festival" summary — replaces former Zapier → Notion export.

## 1. Verify environment

```bash
cp .zoom-mcp.env.example .zoom-mcp.env
# Fill ZOOM_MCP_CLIENT_ID, ZOOM_MCP_CLIENT_SECRET, ZOOM_MCP_REDIRECT_URI (webhook.site URL)

test -f .zoom-mcp-tokens.json && echo "OK: tokens" || echo "Run: node \"Festival Network/scripts/zoom-mcp-authorize.mjs\""
```

Reload Cursor after authorize completes. **Do not** use Settings → Connect (that triggers `cursor://` and error 4700).

## 2. Agent smoke test

In Cursor chat, ask the agent to:

1. Call `search_meetings` with query: `Festival Projects Weekly cPALSs June 2026`
2. Call `get_meeting_assets` or `get_recording_resource` on the top result
3. Confirm the summary mentions Mid-Autumn Festival budget or similar content from the June 2026 session

Expected: non-empty search results with an AI recap and next steps (replacing what Zapier wrote to Notion).

## 3. If the server shows "errored" in MCP settings

- Run `node "Festival Network/scripts/zoom-mcp-authorize.mjs"` if `.zoom-mcp-tokens.json` is missing
- Confirm `ZOOM_MCP_REDIRECT_URI` matches Zoom redirect + allow list exactly
- Confirm all scopes from [zoom-mcp.md](zoom-mcp.md) are added
- Try US endpoint in `start-zoom-mcp.mjs`: `https://mcp-us.zoom.us/mcp/zoom/streamable`

## 4. After smoke test passes

Disable the Zoom → Notion Zap per [zapier-deprecation.md](zapier-deprecation.md).
