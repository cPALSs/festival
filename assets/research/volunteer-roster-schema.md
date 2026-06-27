---
title: Volunteer Roster Schema (Internal)
asset_type: schema
season: cross
visibility: coalition_staff_only
---

# Volunteer roster — internal schema

**Local files:** [`Projects - Lunar New Year/2026/Operations & Logistics/volunteer-roster/`](../../../../Projects%20-%20Lunar%20New%20Year/2026/Operations%20&%20Logistics/volunteer-roster/)

**Not public.** Do not embed on cpalss.com, link from Festival Network GitHub Pages, or commit PII CSVs to git.

## Purpose

Unified, deduped volunteer contact list from LNY 2026 intake (Bugle shifts + Google Form interest). Split into **adults** (outreach-eligible), **maybe minors** (HS club heuristic), and **minors** (confirmed under-18).

Pairs with:

- [Recruitment pipeline](../../../../Corporate%20Administration/data/community-activity-calendar-config.json) — capstone director leads (`idealist-*`, email replies)
- [Seasonal outreach playbook](../../../../Corporate%20Administration/seasonal-outreach-playbook.md)
- [Event Producer Roster](producer-roster-schema.md) — season-shaping POCs (directors on placement)

| Volunteer roster | Producer roster |
|------------------|-----------------|
| Day-of + interest signups | Director / host POCs |
| Blast alumni for recruitment | Producer brief outreach |
| Local CSV (gitignored PII) | Google Sheet (internal) |

## Source systems

| Source | Role | Export |
|--------|------|--------|
| **Bugle** | Shift registration + check-in | Admin CSV export |
| **Google Form** | Interest / pre-Bugle signup | Responses sheet → CSV |
| **LNY Event Planning Tracker** | LNY 2026 committee / steering staff | Staff tab → CSV → `imports/lny-staff-export.csv` |

**MAF forward:** Director intake = Idealist; day-of = Bugle or second Idealist listing (pick one).

## Output files

| File | `roster_bucket` | Blast |
|------|-----------------|-------|
| `volunteers-adults.csv` | adult | Email OK (see below) |
| `volunteers-maybe-minors.csv` | maybe_minor | **Never** for director blast — review manually |
| `volunteers-minors.csv` | minor | **Never** for director/recruitment blast |

## Age classification (v1)

Reference event date: **2026-02-14** (LNY 2026 festival Saturday).

| Condition | Bucket | `bucket_reason` |
|-----------|--------|-----------------|
| Google Form Age Group contains `Under 18` | minor | `google_form_under_18` |
| Bugle Minor DOB present and age &lt; 18 at reference date | minor | `bugle_minor_dob` |
| `organization` matches high-school club heuristic (Key Club, NHS, **HS** VSA, school name) — **not** college VSA (UCD, `@ucdavis.edu`) | maybe_minor | `high_school_club` |
| All other rows with valid email | adult | `default_adult` |
| LNY Event Planning Tracker staff row (no volunteer source) | adult | `lny_staff` |
| LNY staff with HS signal in role or bio (e.g. Sheldon ambassador) | maybe_minor | `high_school_club` |

**Staff blast rule:** LNY staff are not auto-included in `volunteers-adults.csv`. Confirmed minors stay in `volunteers-minors.csv`. Staff flagged as maybe minor only when **role** names a high school (e.g. Sheldon ambassador) or **bio** says they are a current HS student — not for past Key Club, "Elk Grove" city, or "works with HS students" wording.

| Email domain ends in `.edu` | adult | `college_email` |
| Manual correction (future) | any | `manual_override` |

**Priority:** confirmed minor → college `.edu` email → maybe minor (HS org) → adult.

**Assumption:** Bugle row with **no** Minor DOB and **no** HS org signal → **adult**.

## Column dictionary

| Column | Meaning |
|--------|---------|
| `person_id` | Stable slug from normalized email |
| `first_name` · `last_name` | Best available from merged sources |
| `email` | Lowercase; dedupe key |
| `phone` | Normalized when possible |
| `preferred_contact` | Email · Text/SMS · Phone · unknown |
| `age_group` | Raw Google Form label or derived from DOB |
| `roster_bucket` | adult · maybe_minor · minor |
| `bucket_reason` | `google_form_under_18` · `bugle_minor_dob` · `high_school_club` · `college_email` · `default_adult` · `manual_override` |
| `sources` | bugle · google_form · both · lny_staff · or `+`-joined (e.g. `bugle+lny_staff`) |
| `bugle_checked_in` | yes · no |
| `organization` | School / club / affiliation |
| `lny_role` | LNY 2026 staff lane + title from Event Planning Tracker (e.g. `Operations & Logistics — Volunteer Director`; semicolon-separated if multiple rows) |
| `email_blast_ok` | yes for adults with email unless on suppression list |
| `sms_marketing_ok` | **no** by default — not consent for bulk SMS |
| `notes` | Merge conflicts, manual overrides, `email_suppressed: …` from bounce log |

## Email suppressions

**File:** `imports/email-suppressions.csv` (gitignored — survives merge re-runs)

| Column | Meaning |
|--------|---------|
| `email` | Lowercase; dedupe key |
| `bounce_type` | `hard` (invalid / not found) · `soft` (inbox full, temporary) |
| `reason` | Short label — e.g. `address_not_found`, `inbox_full`, `opt_out` |
| `date` | ISO date of bounce or opt-out |
| `campaign` | Which send — e.g. `maf_director_blast` |

After a bounce, add a row and re-run merge — or edit `volunteers-adults.csv` directly for one-offs. Filter mail merge on `email_blast_ok = yes`.

## Merge script

```bash
cd "Festival Network"
node scripts/merge-volunteer-roster.mjs
```

Implementation: [`scripts/merge-volunteer-roster.mjs`](../../scripts/merge-volunteer-roster.mjs)

## Outreach rules

### Email

- **Audience:** `volunteers-adults.csv` where `email_blast_ok = yes`
- **Copy:** [Season Recruitment - LNY List Blast](../../../../Projects%20-%20Mid-Autumn%20Festival/2026/Marketing/Season%20Recruitment%20-%20LNY%20List%20Blast.md)
- **Apply link:** [ideali.st/h9P2PJ](https://ideali.st/h9P2PJ)
- Include reply-to opt-out; log replies on Recruitment pipeline

### SMS

- **Bulk SMS from exported phone list:** **No** unless `sms_marketing_ok = yes` with documented opt-in
- **Preferred contact = Text** is not SMS marketing consent
- **OK:** 1:1 follow-up after email; Bugle in-app SMS for registered shift volunteers
