# Google Gmail MCP (coalition monorepo)

Cursor talks to Gmail via **`google-gmail`** in `.cursor/mcp.json`, which runs:

`Operations/Festival Network/scripts/start-google-gmail-mcp.mjs` → [`@klodr/gmail-mcp`](https://www.npmjs.com/package/@klodr/gmail-mcp)

Same OAuth **client id / secret** as Drive/Sheets/Calendar (from `.google-workspace-oauth.json`). The start script writes Desktop-shaped keys at the cPALSs root: `.gmail-mcp.keys.json` (gitignored). Tokens: `.gmail-mcp-credentials.json`.

Default auth scopes: **`gmail.readonly` · `gmail.send` · `gmail.compose`** (enough for Board reminder fan-out). Tools are filtered to match granted scopes.

## Prerequisites

1. In Google Cloud → **APIs & Services** → enable **Gmail API** (same project as Drive).
2. OAuth client must allow `http://localhost:3000/oauth2callback` (and ideally Desktop / `http://localhost`).
3. Optional: re-run workspace OAuth so Gmail scopes land on `.google-workspace-oauth.json`:

```bash
npm run mcp:oauth -w festival
```

## One-time Gmail auth

```bash
npm run mcp:gmail:auth -w festival
```

Reload Cursor MCP servers so `google-gmail` is listed.

## Agent tools (high level)

Depends on scopes; with default auth you typically get search/read plus **send** / **draft** / **reply**.

| Tool (examples) | Use |
| --- | --- |
| `search_emails` / `read_email` | Find threads |
| `send_email` / `draft_email` | Fan out Board reminders to Groups |
| `reply_to_email` | Thread replies |

## Board reminder fan-out

After auth, agents can send the email leg of [Board Reminder Fan-out Process](../../../Board%20Desk/Board%20Reminder%20Fan-out%20Process.md) to `board@` · `advisory@` · `chairs@`. SMS stays manual until carriers/gateways are ready.

## Related

- Calendar: [google-calendar-mcp.md](google-calendar-mcp.md)
- Drive/Docs: [google-drive-mcp.md](google-drive-mcp.md)
- Sheets: [google-sheets-mcp.md](google-sheets-mcp.md)
