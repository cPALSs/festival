---
title: Tone of Voice
asset_type: guide
season: cross
layout: default
---

# Tone of voice

Festival Season Networks writes for **community organizers, coalition partners, and volunteers** — not for investors, product managers, or AI researchers. The goal is clarity and trust, especially when we talk about money, attendance, and competition.

## Core voice

| Do | Don't |
|----|-------|
| Write like a helpful colleague who's run events | Write like a strategy deck or academic paper |
| Use plain words first; define a term once if needed | Assume everyone knows festival-industry shorthand |
| Be honest about uncertainty ("we don't have a gate count yet") | Inflate numbers or hide gaps |
| Stay neutral — any organizer can fork this | Sound like cPALSs marketing or a single coalition's press release |
| Keep sentences short; use tables and lists for reference material | Stack jargon in one paragraph |

**We are:** direct, practical, respectful of volunteers' time, honest about limits.  
**We are not:** hype-driven, punitive toward other organizers, or preachy about "the right way."

---

## Two registers

We use **two registers** on purpose. Don't mix them on the same page without translating.

### Public (GitHub Pages, principles, guides)

For humans reading [the site](index.html). Plain English only.

| Instead of… | Write… |
|-------------|--------|
| direct comp | **direct competitor** (same weekend, same city, or same type of event) |
| roll-up violation | **season calendar conflict** (e.g. two capstone events fighting the same families) |
| field read / field estimate | **on-the-ground estimate** (someone attended and counted) |
| organizer claim | **what the host said** (flyer, press, social) |
| mobilized groups | **groups you can actually bring** (PTA, parish, club, repeat families) |
| TCOA | **total cost of a night out** (tickets + parking + food) |
| capstone | **main weekend** or **flagship event** — then use *capstone* if the season doc already defined it |
| afterglow | **events after the main weekend** |
| relationship product | **on-site design that helps groups stay together** |
| ecosystem harmony | **events and partners working together without stepping on each other** |
| substitute comp | **different kind of event, same free weekend** (pumpkin fair vs Tết fair) |
| reference only | **out of our region or season — listed for context** |

### Internal (Google Sheets, schemas, AGENTS.md)

Short **column values** and **stable enums** for sorting and AI tools. Abbreviations are OK here when defined in the [schema](../assets/autumn/research/competitive-landscape-schema.md).

Example: sheet cell `Direct comp - same day capstone` = public phrase **direct competitor on capstone Saturday**.

Schemas must include a **plain-language gloss** for every enum. When adding a new value, add both the short label and one sentence a volunteer would understand.

---

## Sensitive topics

**Attendance.** Never state a number without saying where it came from. Prefer "about 5,000–6,000 (park district estimate)" over "10,000+."

**Competition.** Naming another event is factual, not hostile. "California Is My Home runs a Mid-Autumn fair the same month" — not "competitor threat."

**Coalition events.** MAF and EGLNY are coalition capstones, not the brand of this library. Name the **lead** org first in **Host / Organizer**: **VACOS** leads Mid-Autumn; **cPALSs** leads EGLNY (with VACOS / NVCC as partners). Say "the Elk Grove capstone" when you do not need org names.

---

## Checklist before publishing

1. Would a parish volunteer understand this without a glossary?
2. Did we separate **claims** from **verified** numbers?
3. Are we describing coordination, not ordering people around?
4. If a term appears in a sheet column, is the plain English version on this page or in the schema?

---

## Related

- [Principles](principles.html) — P1–P4 in public language
- [AI asset conventions](ai-asset-conventions.html) — IDs, frontmatter, sheet registry
- [Contributing](contribute.html)
