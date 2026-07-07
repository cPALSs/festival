---
title: Zoom Workspace MCP Setup
layout: default
---

# Zoom Workspace MCP Setup

Cursor agents can search cPALSs Zoom meetings, pull AI summaries/transcripts/recordings, and read or create Zoom Docs via Zoom's **hosted Workspace MCP server**.

This covers the same assets surfaced in **Zoom Hub** (recordings, meeting summaries, Docs, My Notes) — there is no separate Hub MCP endpoint.

## One-time setup

### 1. Create a Zoom OAuth app (user-managed)

1. Sign in to the [Zoom App Marketplace](https://marketplace.zoom.us/) as a developer.
2. **Develop → Build App → General app → Create**.
3. Under **Select how the app is managed**, choose **User-managed** (not Admin-managed).
   - **User-managed** — you authorize with your own Zoom account; app sees only your meetings/assets. Correct for personal Cursor use.
   - **Admin-managed** — account admin installs for the whole org. Only use if IT will deploy this for all cPALSs Zoom users.
4. On **Basic Information**, note the **Client ID** and **Client Secret**.
5. Get an **HTTPS OAuth redirect URL** (required — Zoom rejects `cursor://` and often rejects localhost):

   1. Open [webhook.site](https://webhook.site) and copy your unique URL, e.g. `https://webhook.site/abc-123-def`
   2. Add that **exact URL** to Zoom **OAuth redirect URL** and **OAuth allow lists**

   **Why not Cursor Connect?** Cursor Desktop sends `cursor://anysphere.cursor-mcp/oauth/callback`, which Zoom General apps reject (error **4700**). We use manual OAuth with an HTTPS redirect instead.

6. Under **Scopes → Add scopes**, add:

   | Scope | Purpose |
   |-------|---------|
   | `meeting:read:search` | Semantic meeting search |
   | `meeting:read:assets` | AI summaries, linked docs, whiteboards |
   | `ai_companion:read:search` | Cross-search meetings, chat, docs |
   | `cloud_recording:read:list_user_recordings` | List cloud recordings |
   | `cloud_recording:read:content` | Transcripts, playback resources |
   | `docs:write:import` | Create Zoom Docs from Markdown |
   | `docs:read:export` | Read Zoom Docs / My Notes as Markdown |

6. Activate the app if required by your account type.

### 2. Store credentials locally (never commit)

```bash
cp .zoom-mcp.env.example .zoom-mcp.env
```

Edit `.zoom-mcp.env`:

```bash
ZOOM_MCP_CLIENT_ID=your_client_id
ZOOM_MCP_CLIENT_SECRET=your_client_secret
ZOOM_MCP_REDIRECT_URI=https://webhook.site/your-unique-id
```

`ZOOM_MCP_REDIRECT_URI` must match the URL in your Zoom app **exactly**.

### 3. Authorize once (manual OAuth)

```bash
node "Festival Network/scripts/zoom-mcp-authorize.mjs"
```

1. Script prints a Zoom authorize URL — open it in your browser
2. Approve the app
3. Copy the `code` from webhook.site (query parameter on the redirect)
4. Paste the code into the terminal

Tokens save to `.zoom-mcp-tokens.json` (gitignored). Re-run when expired if refresh fails.

### 4. Reload Cursor

**Developer: Reload Window** — **zoom-workspace** should connect using the saved bearer token (no browser OAuth in Cursor).

## Cursor MCP config

Wired in `.cursor/mcp.json` (coalition monorepo) via `Festival Network/scripts/start-zoom-mcp.mjs`:

```json
{
  "mcpServers": {
    "zoom-workspace": {
      "command": "node",
      "args": [
        "/Users/bao/cPALSs/Festival Network/scripts/start-zoom-mcp.mjs"
      ],
      "cwd": "/Users/bao/cPALSs"
    }
  }
}
```

## What agents can do

| Tool | Use |
|------|-----|
| `search_meetings` | Find meetings by topic (semantic search over summaries/recaps) |
| `search_zoom` | Cross-search Team Chat + Zoom Docs |
| `get_meeting_assets` | Summaries, docs, recordings linked to a meeting |
| `recordings_list` | List cloud recordings in a date range |
| `get_recording_resource` | Transcripts, next steps, playback links |
| `get_file_content` | Export a Zoom Doc / My Notes as Markdown |
| `create_new_file_with_markdown` | Create a follow-up Zoom Doc |

## Prerequisites for useful results

- **AI Companion Smart Recording** and **Meeting Summary** should be enabled on meetings you want to search.
- You must have **hosted or co-hosted** the meeting, or been **granted access** to its assets by the host.
- Cloud recordings are required for transcript-heavy retrieval.

## Relation to other cPALSs systems

| System | Role |
|--------|------|
| **Zoom MCP** | Source meeting recordings, transcripts, AI summaries (replaces Zapier → Notion) |
| **Repo (`Staff - Meeting/`, project season folders)** | Pinned meeting notes, prep agendas, operational checklists |
| **Google Drive / Docs** | Official festival sponsorship packets and coalition docs |
| **Google Sheets** | Market landscape research rows |

Prefer **Zoom MCP** for "what was said in the meeting." Prefer **local repo markdown** for living checklists and prep agendas.

Post-meeting workflow: [meeting-workflow.html](meeting-workflow.html). Smoke test: [zoom-mcp-smoke-test.html](zoom-mcp-smoke-test.html). Disable Zapier: [zapier-deprecation.html](zapier-deprecation.html).

Agent rules: `.cursor/rules/zoom-mcp.mdc` and `.cursor/rules/local-ops.mdc` in the coalition monorepo.

## Troubleshooting

### Invalid redirect 4700

| Redirect in error | Cause | Fix |
|-------------------|-------|-----|
| `cursor://anysphere.cursor-mcp/oauth/callback` | Cursor Desktop OAuth | Don't use Connect — run `zoom-mcp-authorize.mjs` |
| `http://localhost:3334/oauth/callback` | mcp-remote localhost | Use webhook.site HTTPS redirect + manual authorize |
| Your webhook.site URL | Not in Zoom allow list | Add exact URL to redirect + allow list |

### zoom-workspace errored

- Run `node "Festival Network/scripts/zoom-mcp-authorize.mjs"` if `.zoom-mcp-tokens.json` is missing
- Confirm `ZOOM_MCP_REDIRECT_URI` in `.zoom-mcp.env` matches Zoom exactly
- Re-authorize if token expired: delete `.zoom-mcp-tokens.json` and run authorize script again

### Search returns empty results

- Check Smart Recording / Meeting Summary were on for that meeting.
- Confirm you have access to the meeting assets in Zoom Hub manually first.

### US region endpoint

If `mcp.zoom.us` fails, set before launching Cursor:

```bash
export ZOOM_MCP_ENDPOINT=https://mcp-us.zoom.us/mcp/zoom/streamable
```

## References

- [Connect to Zoom MCP Servers](https://developers.zoom.us/docs/mcp/servers/connect-to-zoom-mcp-servers/)
- [Zoom MCP registry entry](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.zoom%2Fzoom-workspace/versions/latest)
- [Cursor MCP OAuth docs](https://cursor.com/docs/mcp)
