---
title: Autumn Market Research
asset_type: guide
season: autumn
---

# Autumn — market research

## Market landscape (live)

**Source of truth:** [Greater Sacramento Autumn Season - Market Landscape](https://docs.google.com/spreadsheets/d/1Va0oCv09nyW98-JnWL9DuYYTsXG35cxjf_WqBZsySrA/edit) — edit **All** only; browse confidence views and year tabs.

Seeded from [Greater Sacramento Autumn Season - Market Research.md](https://github.com/cPALSs/cPALSs/blob/main/Projects%20-%20Mid-Autumn%20Festival/Research/Greater%20Sacramento%20Autumn%20Season%20-%20Market%20Research.md) plus coalition field notes.

Column schema: [market-landscape-schema.md](../../assets/autumn/research/market-landscape-schema.md)

---

## Schedule confidence — three tiers

The **2026** season is split by how sure we are about each occurrence:

| Tier | Definition |
|------|------------|
| **Confirmed** | Calendar **steward** verified the date for planning |
| **Tentative** | Spoken to organizer; they gave a committed date but event is not finalized |
| **Estimated** | No organizer contact yet; date projected from prior year assuming recurrence |

### Confirmation rules (Confirmed)

1. **Primary gate — human confirmation:** A row becomes **Confirmed** when the calendar steward explicitly verifies it.
2. **Auto-signal — public listings:** Event posted on **Facebook**, **Eventbrite**, **Sacramento365**, organizer website, or equivalent with firm dates → treat as **Confirmed** (steward may bulk-accept or spot-check).
3. **Pre-public confirm:** Steward may set **Confirmed** before a public post when an organizer gave a **final committed date** in conversation.

**Audit columns on All tab:** `Confidence source` · `Confirmed by` · `Confirmed date`

---

## Sheet tabs

| Tab | Role |
|-----|------|
| **All** | Source of truth — edit here only |
| **2026 Confirmed** | Verified 2026 occurrences |
| **2026 Tentative** | Organizer conversation; date not final |
| **2026 Estimated** | Prior-year projection; outreach queue |
| **2026** | All current-year rows |
| **2025** | Last held season |

Re-run view tabs after header changes:

```bash
cd Festival\ Network
node scripts/add-landscape-view-tabs.mjs
node scripts/seed-autumn-landscape-confidence.mjs
```

---

## Season report (narrative)

Full competitive landscape, three **moon lanes**, and honesty rules:

- [Greater Sacramento Autumn Season - Market Research.md](https://github.com/cPALSs/cPALSs/blob/main/Projects%20-%20Mid-Autumn%20Festival/Research/Greater%20Sacramento%20Autumn%20Season%20-%20Market%20Research.md) (cPALSs repo)

**Stakeholder involvement** (who produces what): Community Activity Calendar → **Stakeholder event involvement** tab. Charter: [season-stakeholder-charter.md](https://github.com/cPALSs/cPALSs/blob/main/Corporate%20Administration/season-stakeholder-charter.md)

---

## Producer brief

Coalition-facing mission + sustainability framing for autumn hosts:

- [MAF Season - Producer Brief.md](https://github.com/cPALSs/cPALSs/blob/main/Projects%20-%20Mid-Autumn%20Festival/2026/Marketing/MAF%20Season%20-%20Producer%20Brief.md)

---

## Planning with AI

Agents: clone [festival-network](https://github.com/cPALSs/festival-network) and follow [AGENTS.md](../../AGENTS.md) for column schema, sheet IDs, and MCP load order.

See [Using market research](../research.html) for methodology and contributing.
