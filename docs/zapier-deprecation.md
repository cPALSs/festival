---
title: Zapier deprecation (Zoom → Notion)
layout: default
---

# Zapier deprecation

**Status (2026-06-25):** Zapier connections removed. Zoom Workspace MCP is the meeting-summary source. Notion MCP removed from `.cursor/mcp.json`.

The **Zoom → Notion** Zap (and any related CSV export to `Staff - Meeting/`) is **disabled**. Meeting summaries are retrieved on demand via **Zoom Workspace MCP**.

## Prerequisites

Complete [zoom-mcp.html](zoom-mcp.html) setup and run the smoke test in [zoom-mcp-smoke-test.html](zoom-mcp-smoke-test.html) before turning off Zapier.

## Disable in Zapier

1. Sign in to [Zapier](https://zapier.com/).
2. Open the Zap that creates **Meeting Summary for …** pages in Notion (trigger: Zoom meeting summary or similar).
3. **Turn off** or **delete** the Zap.
4. If a separate Zap exports meeting notes to CSV (`Staff - Meeting/2026 Eric Lofholm running meeting notes.csv`), disable that too unless you still want CSV backups.

## After disabling

- New meetings will **not** appear in Notion Meeting Notes.
- Historical Notion pages remain until you cancel Notion; substantive ops content was migrated to coalition-internal project season folders and `Staff - Meeting/` markdown.
- Use Cursor + Zoom MCP to query past meetings.

## Cancel Notion (optional)

Once you no longer need read-only access to old Meeting Notes pages, cancel the Notion subscription. Notion MCP has been removed from `.cursor/mcp.json` in the coalition monorepo.
