---
title: Google Drive + Docs MCP Setup
layout: default
---

# Google Drive + Docs MCP Setup

Google Docs and Drive folders for **specific festivals** live in each **project folder**, not in Festival Network. Cursor agents read and write via the **google-drive** MCP server (`@us-all/google-drive-mcp`).

## Drive registries (per festival)

Festival Network holds an **index** only: [drive-registry.json](../assets/drive-registry.json)

| Festival | Registry file |
|----------|----------------|
| MAF 2026 | [`Projects - Mid-Autumn Festival/2026/drive-registry.json`](../../../Projects%20-%20Mid-Autumn%20Festival/2026/drive-registry.json) |
| LNY 2026 | [`Projects - Lunar New Year/2026/drive-registry.json`](../../../Projects%20-%20Lunar%20New%20Year/2026/drive-registry.json) |

Project scripts (export PDF, sync sheets, etc.) live under each project's `scripts/` folder and import shared OAuth helpers from `Festival Network/scripts/lib/`.

## Generic templates (Festival Network)

Reusable across festivals — copy or upload to Drive from project setup scripts:

| Template | Path |
|----------|------|
| Sponsorship packet standard | [`scripts/content/sponsorship-packet-standard.md`](../../scripts/content/sponsorship-packet-standard.md) |
| Post-event sponsor report | [`scripts/content/post-event-sponsor-report-template.md`](../../scripts/content/post-event-sponsor-report-template.md) |
| Post-event metrics inventory | [`scripts/content/post-event-metrics-inventory.md`](../../scripts/content/post-event-metrics-inventory.md) |

Festival-specific seeds (packet copy, debrief templates, staff directory) belong in the **project repo**, not here.

## One-time setup (OAuth)

Uses the same Google Cloud OAuth client as [Google Sheets MCP](google-sheets-mcp.md). Requires **Drive API** and **Docs API** enabled.

```bash
cd "/Users/bao/cPALSs/Festival Network"
npm install
npm run mcp:oauth
npm run mcp:drive:verify
```

Tokens save to `.google-workspace-oauth.json` at the cPALSs root (gitignored).

## Cursor MCP config

[`.cursor/mcp.json`](../../../.cursor/mcp.json) starts `google-drive` via [`scripts/start-google-drive-mcp.mjs`](../../scripts/start-google-drive-mcp.mjs).

## Agent tools (google-drive MCP)

| Tool | Use |
|------|-----|
| `list-files` / `search-files` | Browse festival folders |
| `docs-get-document` / `docs-get-content` | Read Docs |
| `docs-replace-text` / `docs-batch-update` | Edit sections and tables |
| `export-file` | PDF export |

## Markdown import gotchas

When pushing `.md` to Google Docs via Drive (`media: text/markdown`):

- **`~` (tilde)** — paired tildes become strikethrough. Use `about 2,000` instead of `~2,000`.
- **`*` / `_`** — mid-word emphasis can become bold/italic unintentionally.

## Operating rules

- **Google Doc = source of truth** for live sponsorship packet copy in each festival project
- **Festival Network** = OAuth tooling, generic templates, market landscape sheets — not festival-specific copy or Drive IDs
- **Sheets MCP** for market landscape research — see [google-sheets-mcp.md](google-sheets-mcp.md)

## Example: MAF 2026 project scripts

From `Projects - Mid-Autumn Festival/2026/`:

```bash
npm run export-sponsorship-pdf   # after Google Doc edits
npm run sponsor-setup            # pipeline, templates, packet seed → Doc
npm run export-budget-sheet
npm run vendor-quotes
npm run staff-directory
```

See that project's `drive-registry.json` for Doc/Sheet IDs and folder links.
