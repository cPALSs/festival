---
title: Google Workspace MCP (cPALSs)
layout: default
---

Cursor agents use a **local** [workspace-mcp](https://github.com/taylorwilsdon/google_workspace_mcp) stdio server (taylorwilsdon) for Drive, Docs, Sheets, Slides, Gmail, Calendar, and related Workspace APIs as **bao@cpalss.com**.

This replaces Google’s hosted product MCP endpoints (`drivemcp.googleapis.com`, etc.), which often return `PERMISSION_DENIED` on data tools even after successful OAuth.

## Cursor MCP config

Wired in the coalition monorepo `.cursor/mcp.json`:

| Cursor server id | Account | Launcher |
|------------------|---------|----------|
| `workspace-cpalss` | bao@cpalss.com | `~/tools/workspace-mcp/start-cpalss.sh` |

Bao Thoughts multi-root companion:

| Cursor server id | Account | Launcher |
|------------------|---------|----------|
| `workspace-baohouse` | bao@baohouse.net | `~/tools/workspace-mcp/start-baohouse.sh` |

Also on cPALSs: `zoom-workspace` via `~/tools/zoom-mcp` (credentials in vault root).

OAuth client JSON (gitignored home paths):

- cPALSs: `~/.config/google-workspace-mcp/profiles/cpalss/cursor-remote-oauth-web-client.json` (fallback: `credentials.json`)
- Baohouse: `~/.config/google-workspace-mcp/profiles/baohouse/…`

Per-account token store (created on first consent):

- `~/.google_workspace_mcp/credentials/cpalss/`
- `~/.google_workspace_mcp/credentials/baohouse/`

### Redirect URIs (required)

Register on each project’s Web OAuth client:

- cPALSs (`cpalss-hub`): `http://localhost:8802/oauth2callback`
- Baohouse (`baohouse-hub`): `http://localhost:8801/oauth2callback`

Tool tier default: **extended** (`TOOL_TIER=core|extended|complete` overrides).

Requires [uv/uvx](https://github.com/astral-sh/uv). First tool call opens browser consent for that account.

### Google Cloud project APIs

Project for cPALSs OAuth: `cpalss-hub` (`138932533147`). Enable **classic** product APIs:

Drive, Docs, Sheets, Slides, Gmail, Calendar (`calendar-json.googleapis.com`), People (as needed).

Hosted `*mcp.googleapis.com` services are **not** required for local workspace-mcp.

### OAuth client

Web application client is fine when redirect URIs above are registered. Script auth (Node publishers) remains separate: `Operations/Festival Network/scripts/lib/google-workspace-auth.mjs` and `.google-workspace-oauth.json`.

## Agent usage

Discover tools with `GetMcpTools` on `workspace-cpalss`. Prefer live Sheets/Drive over inventing vault rows. Shared Drive root: `0APxvAne5TWRdUk9PVA`. Folder create/rename/move/delete → mirror vault structure per the vault ↔ Drive sync rule.

**MCP first for Sheets/Drive.** Ordinary reads/writes use MCP tools. When MCP cannot express the edit (notably mid-sheet **row insert/delete** — no `insertDimension` tool), call the Sheets API from Node using the **live MCP session** at `~/.google_workspace_mcp/credentials/cpalss/bao@cpalss.com.json` — not profile `tokens.json` alone (often stale while MCP still works). Full agent rule: [`.cursor/rules/google-workspace-mcp.mdc`](../../../.cursor/rules/google-workspace-mcp.mdc).

After syncing vault markdown into a Google Doc, apply the cPALSs Doc theme and run table optimize — see the markdown-to-google-doc Cursor rule.

## Related

- Sheets registries: [google-sheets-mcp.html](google-sheets-mcp.html)
- Drive/Docs festival notes: [google-drive-mcp.html](google-drive-mcp.html)
- Launcher README: `~/tools/workspace-mcp/README.md`
