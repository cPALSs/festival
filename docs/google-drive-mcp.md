---
title: Google Drive + Docs MCP Setup
layout: default
---

# Google Drive + Docs MCP Setup

Google Docs and Drive folders for **specific festivals** live in each **project folder** in the coalition cPALSs monorepo — not in the public [festival](https://github.com/cPALSs/festival) repo. Cursor agents read and write via the **google-drive** MCP server (`@us-all/google-drive-mcp`).

## Drive registries (per festival)

Festival Network holds an **index** only: [drive-registry.json](https://github.com/cPALSs/festival/blob/main/assets/drive-registry.json)

| Festival | Registry file (coalition monorepo) |
|----------|-------------------------------------|
| MAF 2026 | `Projects - Mid-Autumn Festival/2026/drive-registry.json` |
| LNY 2026 | `Projects - Lunar New Year/2026/drive-registry.json` |

Project scripts (export PDF, sync sheets, etc.) live under each project's `scripts/` folder and import shared OAuth helpers from `Festival Network/scripts/lib/` in the monorepo.

## Generic templates (Festival Network monorepo)

Reusable across festivals — copy or upload to Drive from project setup scripts:

| Template | Path (coalition monorepo) |
|----------|---------------------------|
| Sponsorship packet standard | `Festival Network/scripts/content/sponsorship-packet-standard.md` |
| Post-event sponsor report | `Festival Network/scripts/content/post-event-sponsor-report-template.md` |
| Post-event metrics inventory | `Festival Network/scripts/content/post-event-metrics-inventory.md` |

Festival-specific seeds (packet copy, debrief templates, staff directory) belong in the **project repo**, not the public festival site.

## One-time setup (OAuth)

Uses the same Google Cloud OAuth client as [Google Sheets MCP](google-sheets-mcp.html). Requires **Drive API** and **Docs API** enabled.

```bash
cd "/Users/bao/cPALSs/Festival Network"
npm install
npm run mcp:oauth
npm run mcp:drive:verify
```

Tokens save to `.google-workspace-oauth.json` at the cPALSs root (gitignored).

## Cursor MCP config

Configure `google-drive` in `.cursor/mcp.json` (coalition monorepo) via `Festival Network/scripts/start-google-drive-mcp.mjs`.

## Agent tools (google-drive MCP)

| Tool | Use |
|------|-----|
| `list-files` / `search-files` | Browse festival folders |
| `docs-get-document` / `docs-get-content` | Read Docs |
| `docs-replace-text` / `docs-batch-update` | Edit sections and tables |
| `export-file` | PDF export |

**Policy docs:** Repo markdown is draft source; publish formatted copies with:

```bash
node "Corporate Administration/scripts/publish-volunteer-policy-docs.mjs"
```

Do **not** upload raw `.md` via Drive `text/markdown` — it renders as unformatted markdown in Docs.

## Markdown import gotchas

When pushing `.md` to Google Docs via Drive (`media: text/markdown`):

- **`~` (tilde)** — paired tildes become strikethrough. Use `about 2,000` instead of `~2,000`.
- **`*` / `_`** — mid-word emphasis can become bold/italic unintentionally.

## Operating rules

- **Google Doc = source of truth** for live sponsorship packet copy in each festival project
- **Festival Network** = OAuth tooling, generic templates, market landscape sheets — not festival-specific copy or Drive IDs
- **Sheets MCP** for market landscape research — see [google-sheets-mcp.html](google-sheets-mcp.html)

## Example: MAF 2026 project scripts

From `Projects - Mid-Autumn Festival/2026/` in the coalition monorepo:

```bash
npm run export-sponsorship-pdf   # after Google Doc edits
npm run sponsor-setup            # pipeline, templates, packet seed → Doc
npm run export-budget-sheet
npm run vendor-quotes
npm run staff-directory
```

See that project's `drive-registry.json` for Doc/Sheet IDs and folder links.
