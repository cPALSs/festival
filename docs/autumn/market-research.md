---
title: Autumn Market Research
asset_type: guide
season: autumn
---

## Market landscape (live)

**Source of truth:** [Greater Sacramento Autumn Season - Market Landscape](https://docs.google.com/spreadsheets/d/1Va0oCv09nyW98-JnWL9DuYYTsXG35cxjf_WqBZsySrA/edit) — edit **All** only; browse **2026** section bands and **2025** on year tabs.

Seeded from coalition field notes and the internal *Greater Sacramento Autumn Season — Market Research* narrative.

Column schema: [Autumn market landscape schema](https://github.com/cPALSs/festival/blob/main/assets/autumn/research/market-landscape-schema.md) (in the [festival](https://github.com/cPALSs/festival) repo — clone for agents).

---

## Season coordination (essay)

**[Same calendar, different story](season-coordination.html)** — how Greater Sacramento's autumn events look like competition without intentional lane assignment, and what changes when each host owns a role and market. Sustainability and coordination over headcount.

---

## Schedule confidence — three tiers

The **2026** season is split by how sure we are about each occurrence:

| Tier | Definition |
|------|------------|
| **Confirmed** | Calendar **steward** verified the date for planning |
| **Tentative** | Spoken to organizer; they gave a committed date but event is not finalized |
| **Estimated** | No organizer contact yet; date projected from prior held occurrence (see below) |

### How to estimate dates

Do **not** copy last year’s Gregorian date. Mid-Autumn moves on the solar calendar.

**Lunar-aligned** Mid-Autumn / Moon / Lantern events: measure the prior held occurrence as **MAF Saturday ± N weekends**, then apply the same offset to this year’s lunar Mid-Autumn. Preserve day of week and typical hours. Record the offset on the row (e.g. `Est. MAF −3 weekends`).

**MAF Saturday** = Saturday nearest the lunar Mid-Autumn date (15th of the 8th lunar month) — Saturday on or after when lunar is Fri–Sun; Saturday before when lunar is Mon–Thu. **2026:** lunar Fri Sep 25 → MAF Saturday **Sep 26**.

**Non-lunar / venue-driven** autumn fairs (civic fall fests, first-weekend-of-month retail, late-November craft fairs, **2nd weekend of September** District 56 / CAIMH): keep the prior **calendar** pattern, not MAF-relative. If lunar offsets disagree across held years — or venue availability is the real constraint — prefer the calendar pattern.

Full algorithm and 2026 examples: [Autumn market landscape schema](https://github.com/cPALSs/festival/blob/main/assets/autumn/research/market-landscape-schema.md).

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
| **2026** | All 2026 rows on one tab — **Confirmed** · **Tentative** · **Estimated** section bands (like Krewe Subunit Contacts) |
| **2025** | Last held season |

Re-run view tabs after editing **All** or changing schedule confidence:

```bash
cd Festival\ Network
node scripts/add-landscape-view-tabs.mjs
node scripts/seed-autumn-landscape-confidence.mjs   # if updating confidence on All
```

*(Scripts live in the coalition cPALSs monorepo — not published on this site.)*

---

## Season report (narrative)

Full competitive landscape, three **moon lanes**, and honesty rules live in the coalition internal *Greater Sacramento Autumn Season — Market Research* report.

**Stakeholder involvement** (who produces what): [Community Activity Calendar](https://docs.google.com/spreadsheets/d/1jrq_Fj2fZ0dJu2VV-ACiKyFxdoCisx8mQg_a5URLUbg/edit) → **Stakeholder event involvement** tab. Charter: *season stakeholder charter* (coalition internal).

---

## Producer brief

Coalition-facing mission + sustainability framing for autumn hosts: *MAF Season — Producer Brief* (coalition internal). Questions: [contact@cpalss.com](mailto:contact@cpalss.com).

**Director recruitment:** [Volunteer staff recruitment checklist](../volunteer-staff-recruitment-checklist.html)

---

## Planning with AI

Agents: clone [festival](https://github.com/cPALSs/festival) and follow [AGENTS.md](https://github.com/cPALSs/festival/blob/main/AGENTS.md) for column schema, sheet IDs, and MCP load order.

See [Using market research](../research.html) for methodology and contributing.
