---
title: Google Sheets MCP Setup
layout: default
---

# Google Sheets MCP Setup

Live research data is stored in **Google Sheets** (source of truth). Cursor agents read and write via the **google-sheet-mcp** MCP server.

## Sheet registry

Canonical links live in [sheets-registry.json](../assets/sheets-registry.json).

| Dataset | Spreadsheet |
|---------|-------------|
| LNY market landscape | [Open in Google Sheets](https://docs.google.com/spreadsheets/d/1IB6beiKHC9R05r2o0imkh8MX_2u-qmhlVxTV3pxibs0/edit?usp=drive_link) |
| Autumn market landscape | [Open in Google Sheets](https://docs.google.com/spreadsheets/d/1Va0oCv09nyW98-JnWL9DuYYTsXG35cxjf_WqBZsySrA/edit?usp=drive_link) |

**LNY spreadsheet ID:** `1IB6beiKHC9R05r2o0imkh8MX_2u-qmhlVxTV3pxibs0`  
**Autumn spreadsheet ID:** `1Va0oCv09nyW98-JnWL9DuYYTsXG35cxjf_WqBZsySrA`

## Shared Drive folder layout

Recommended structure under your **Festival Network** Shared Drive:

```
Festival Network/
  Research/       ← market landscape, market analyses (use this, not Marketing)
  Calendars/      ← future: roll-up paths, scheduling
  Graphs/         ← future: ecosystem edges
  Operations/     ← future: steering trackers
```

Move the market landscape spreadsheet from **Marketing** to **Research** — that sheet is coalition market research, not outbound marketing collateral.

## One-time setup (OAuth — recommended)

OAuth lets the agent act **as you** — no service account, no sharing the sheet with a robot email. Good when you own the Shared Drive and the market landscape sheet.

### 1. Create a Google Cloud project

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Click the **project dropdown** (top bar, next to “Google Cloud”)
3. **New project**
4. Name it e.g. `festival-network-mcp` → **Create**
5. Wait for creation, then **select** that project from the dropdown

### 2. Enable Google Sheets API

1. **APIs & Services** → **Library**
2. Search **Google Sheets API**
3. Open it → **Enable**

### 3. Configure OAuth consent screen

1. **APIs & Services** → **OAuth consent screen**
2. **Get started** (or **Configure**)
3. **User type:** External → **Create**
4. **App information:**
   - App name: `Festival Network MCP` (any name)
   - User support email: your email
   - Developer contact: your email
5. **Scopes:** skip manual scopes for now (the CLI requests `spreadsheets` at login)
6. **Test users:** add **your Google account** (required while app is in “Testing”)
7. Save

### 4. Create OAuth client ID

1. **APIs & Services** → **Credentials**
2. **Create credentials** → **OAuth client ID**
3. If prompted, finish consent screen first
4. **Application type:** **Desktop app**
5. Name: `google-sheet-mcp` → **Create**
6. Copy **Client ID** and **Client secret** (you’ll paste these in the wizard)

### 5. Run the OAuth wizard

**cPALSs staging** — run from the parent folder (local tooling, not in the public repo):

```bash
cd "/Users/bao/cPALSs"
npm install
npm run mcp:oauth -w festival-network
```

Or run the wizard directly:

```bash
cd "/Users/bao/cPALSs/Festival Network"
npx google-sheet-mcp init --auth oauth
```

**Public clone** — install MCP in your clone root if you use Sheets MCP locally:

```bash
cd festival-network
npm install
npx -y google-sheet-mcp init --auth oauth
```

When prompted:

| Prompt | Value |
|--------|--------|
| Google Sheet URL | `https://docs.google.com/spreadsheets/d/1Va0oCv09nyW98-JnWL9DuYYTsXG35cxjf_WqBZsySrA/edit` |
| Client ID | from step 4 |
| Client Secret | from step 4 |

The wizard opens a browser → sign in → **Allow** access to Google Sheets. Tokens save to `.google-sheet-mcp.json` at the **cPALSs workspace root** (gitignored).

### 6. Install MCP server package (local)

**cPALSs staging:** from the workspace root:

```bash
cd "/Users/bao/cPALSs"
npm install
```

This installs workspace packages (`Festival Network`, project scripts) and hoists shared deps like `googleapis`. The public repo does not ship `package.json`; MCP is optional local tooling.

This installs `google-sheet-mcp` so Cursor can run the **server** entrypoint (not the CLI).

### 7. Test CLI (optional)

```bash
cd "/Users/bao/cPALSs"
npx -y google-sheet-mcp test
npx -y google-sheet-mcp token-status
```

### 8. Cursor MCP config

`.cursor/mcp.json` runs a small wrapper that resolves `google-sheet-mcp` via npm (works with workspace hoisting):

```json
{
  "mcpServers": {
    "google-sheets": {
      "command": "node",
      "args": [
        "/Users/bao/cPALSs/Festival Network/scripts/start-google-sheet-mcp.mjs"
      ],
      "cwd": "/Users/bao/cPALSs"
    }
  }
}
```

`cwd` must be the cPALSs root where `.google-sheet-mcp.json` lives.

### 9. Restart Cursor

Reload the window (**Developer: Reload Window**). In **Settings → MCP**, `google-sheets` should show green / connected.

---

## Troubleshooting

### MCP log shows CLI `Usage: google-sheet-mcp [options] [command]`

The `google-sheet-mcp` npm **bin** points at the CLI, not the MCP server. Use the `node .../server.mjs` config above — already fixed in this repo's `.cursor/mcp.json`.

### `No configuration found`

Run the OAuth wizard from the cPALSs root, or confirm `.google-sheet-mcp.json` exists at `/Users/bao/cPALSs/.google-sheet-mcp.json`.

### Success log (MCP server)

When working, the server log should show:

```
[google-sheet-mcp] ✅ Configured: 1Va0oCv09nyW98-... (oauth2)
[google-sheet-mcp] Server started (stdio) — waiting for IDE connection...
```

Not the CLI help text.

---

## Service account alternative (teams / automation)

Use when multiple people or CI need access without your personal OAuth token.

### 1. Google Cloud

Same project as above. Enable **Google Sheets API**.

### 2. Service account

1. **Credentials** → **Create credentials** → **Service account**
2. Name: `sheets-mcp` → **Create and continue** → **Done**
3. Open the service account → **Keys** → **Add key** → **JSON** → download

### 3. Share the spreadsheet

Share the sheet with the service account `client_email` from the JSON as **Editor**.

### 4. Store credentials

```bash
cp ~/Downloads/your-key.json "Festival Network/.credentials/google-service-account.json"
```

Add to `.cursor/mcp.json` `env`:

```json
"GOOGLE_APPLICATION_CREDENTIALS": "/Users/bao/cPALSs/Festival Network/.credentials/google-service-account.json"
```

### 5. Google Drive + Docs (sponsorship packets)

See [google-drive-mcp.md](google-drive-mcp.md) for Drive/Docs MCP setup. Uses the same OAuth client with expanded scopes (Drive + Docs + Sheets).

### 6. Test

```bash
cd "/Users/bao/cPALSs/Festival Network"   # cPALSs staging
npx -y google-sheet-mcp test
```

## Agent tools

| Tool | Use |
|------|-----|
| `sheets_list_tabs` | List tabs in the spreadsheet |
| `sheets_read_range` | Read rows (header-keyed objects) |
| `sheets_write_range` | Update a range |
| `sheets_append_row` | Add a row aligned to headers |
| `sheets_get_sheet` | Spreadsheet metadata |

## Operating rules

- **Sheets = source of truth** — humans edit in Google Sheets; agents update via MCP
- **Repo** holds `sheets-registry.json`, column schema, and guides — **not** live rows (no CSV)
- Match columns in [lny schema](../assets/lny/research/market-landscape-schema.md) or [autumn schema](../assets/autumn/research/market-landscape-schema.md)
- Protect row 1 (headers) in the Sheet
