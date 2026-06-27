---
title: Event Producer Roster Schema (Internal)
asset_type: schema
season: all
visibility: coalition_staff_only
---

# Event Producer Roster — internal schema

**Live sheet:** Registered in [sheets-registry.json](../sheets-registry.json) as `season-producer-roster`.

**Not public.** Do not embed on cpalss.com, link from Festival Network GitHub Pages, or share view-only with the internet. Coalition staff and assigned outreach owners only.

## Purpose

Pairs with the **public** [LNY](../lny/research/market-landscape-schema.md) and [Autumn](../autumn/research/market-landscape-schema.md) market landscapes (`event_id`, dates, attendance honesty). This workbook holds **POC contact info**, preferred contact method, and outreach status — plus **general event producer network** rows not tied to a single public event.

**Terminology:** **Event producer** — brunches, karaoke nights, Mardi Gras activations, MAF hosts, party-rental custom events, etc. Not every row is a festival-scale host; marketing volunteers and emerging hosts are tracked honestly (often **Network** + **R0**).

| Public landscape | Internal event producer roster |
|------------------|--------------------------------|
| Event occurrence facts | Who to call + how |
| No email/phone | Email, phone, preferred channel |
| Published on Festival Network | Never published |

## Sheet tabs

| Tab | Role |
|-----|------|
| **All** | Source of truth — edit here only |
| **2026** | Filter view — `Season year` = 2026 |
| **LNY** | Filter view — `Season` = LNY |
| **Autumn** | Filter view — `Season` = Autumn |
| **Network** | Filter view — `Season` = Network (general event producers + vendors) |
| **README** | Access rules + links to public landscapes |

## Row types

| Type | `event_id` | `Season` | Example |
|------|------------|----------|---------|
| Event POC | Must match LNY or Autumn landscape **All** | LNY · Autumn | `sf-supermarket-maf-rancho`, `cpalss-lny-capstone` |
| General event producer | `producer-network` | Network | Louisiana Sue Ramon (Mardi Gras), Jim Chong (Karaoke), Lollipop Event Rentals |

Network rows use **`Product lane`** for specialization (Mardi Gras, Reggae / Polynesian brunch, Karaoke, …). Autumn MAF rows reuse the same column for moon-lane values (A Mid-Autumn Festival, B Pan-Asian Harvest Moon, …).

## Column dictionary

| Column | Meaning |
|--------|---------|
| **event_id** | Landscape id, or `producer-network` for general event producers |
| **Event name** | Display |
| **Season year** | `2026`, `2025`, `network`, `reference` |
| **Season** | LNY · Autumn · Network |
| **Host / Organizer** | Lead org |
| **Product lane** | Specialization or MAF moon lane |
| **Geography** | City / corridor |
| **person_id** | Stable slug — same as involvement graph |
| **POC name** | Event producer / host contact |
| **Linked org** | Employer or producing org |
| **Involvement type** | Producer · Host · Co-chair · Org contact · Volunteer |
| **Coalition relationship** | Maps to landscape overlap enum or network member |
| **Season tier** | R0–R3 |
| **Email** · **Phone** | PII — internal only |
| **Preferred contact method** | Email · Text/SMS · Phone · … |
| **Preferred contact times** | Free text |
| **Outreach owner** | Coalition DRI |
| **Outreach status** | Not contacted → On roster |
| **Last outreach** | YYYY-MM-DD |
| **Stakeholder roles** | Person-level summary |
| **Vision contribution** | Season-shaping note |
| **Transparency** | Coalition internal · Needs verification |
| **Notes** | Free text |
| **Last verified** · **Verified by** | Audit |

## Workflow

1. Add or verify **event_id** on public landscape **All** first (event rows only).
2. Add POC row here when you have a relationship channel.
3. For **general event producers** (multi-event specialists, vendors), add a **Network** row with `event_id = producer-network`.
4. After conversation: capture **Preferred contact method** + declared other events in **Notes**.
5. Run `sync-stakeholder-involvements.mjs` — reads this sheet for graph edges (no PII exported to repo JSON). Network rows are skipped for landscape validation.

## Deprecated location

Do **not** store producer email/phone on [Community Activity Calendar](../../../Corporate%20Administration/community-activity-calendar-schema.md). Former **Season stakeholders** / **Stakeholder event involvement** tabs on the calendar are retired in favor of this roster + public landscapes.

**Legacy registry id:** `autumn-producer-roster` → `season-producer-roster`.  
**Legacy sheet titles:** *Festival Season - Producer Roster*, *Autumn Season - Producer Roster* → **Event Producer Roster**.
