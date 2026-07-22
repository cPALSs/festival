# Google Calendar MCP (coalition monorepo)

Cursor talks to Google Calendar via **`google-calendar`** in `.cursor/mcp.json`, which runs:

`Operations/Festival Network/scripts/start-google-calendar-mcp.mjs` → [`@cocal/google-calendar-mcp`](https://www.npmjs.com/package/@cocal/google-calendar-mcp)

Same OAuth **client id / secret** as Drive/Sheets (from `.google-workspace-oauth.json`). The start script writes a Desktop-shaped keys file at the cPALSs root: `.google-calendar-mcp.keys.json` (gitignored). Account tokens land in `.google-calendar-mcp-tokens.json`.

## Prerequisites

1. In Google Cloud → **APIs & Services** → enable **Google Calendar API** (same project as Drive).
2. OAuth client must allow local redirects (Desktop app is ideal; if you use a Web client, add `http://localhost` under Authorized redirect URIs).
3. Re-run workspace OAuth so Calendar scopes are on `.google-workspace-oauth.json` (optional for Calendar MCP itself, but keeps other scripts aligned):

```bash
npm run mcp:oauth -w festival
```

## One-time Calendar auth

Reload Cursor MCP servers first so `google-calendar` is listed.

**In chat (recommended):** ask the agent to add an account with `manage-accounts` (e.g. account_id `cpalss`).

**CLI:**

```bash
npm run mcp:calendar:auth -w festival
```

## Agent tools (high level)

| Tool | Use |
| --- | --- |
| `list-calendars` / `list-events` / `search-events` | Read schedule |
| `create-event` / `update-event` / `delete-event` | Write events |
| `get-freebusy` | Find open slots |
| `manage-accounts` | Connect / list / remove Google accounts |

## Related

- Drive/Docs: [google-drive-mcp.md](google-drive-mcp.md)
- Sheets: [google-sheets-mcp.md](google-sheets-mcp.md)
