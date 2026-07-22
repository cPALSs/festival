---
title: Content Patterns — Tables & Readability
asset_type: guide
season: cross
---

# Content patterns — tables & readability

GitHub Pages uses a **narrow main column** (especially with the on-page TOC at ≥1100px). Wide markdown tables collapse into skinny columns and ugly wraps. Use this guide before adding or editing tables in `docs/`.

**Related:** [Tone of voice](tone-of-voice.html) · [AI-readable conventions](ai-asset-conventions.html)

---

## When to use a table

| Use a table | Prefer another pattern |
|-------------|------------------------|
| **2 columns**, short cells (lookup, do/don't) | 3+ columns with prose in cells |
| **Reference grids** with short tokens (`C0`, `●●●`, slugs) | Same row repeated across many **sentence-length** fields |
| Header row is labels; body is **words or codes**, not paragraphs | Each cell needs its own sub-structure (going / staying / design) |
| Matrix where columns are **the same kind of thing** (cohort fit dots) | “Story” content — use narrative sections |

**Rule of thumb:** If any body cell would wrap to **3+ lines** at ~400px width, the table is probably wrong for the web.

---

## Decision flow

```text
Need to show structured data?
        |
        v
  2 cols, short values? ----yes----> Table OK (Surface | Examples)
        |
        no
        v
  True matrix (same axes)? ----yes----> Table + {: .table-scroll} class
        |
        no
        v
  One entity per row with several fields? ----yes----> Record blocks (### + bullets)
        |
        no
        v
  Long reference list with stable IDs? ----yes----> 2-col consolidated (Slug | Summary)
        |
        no
        v
  Bullet list or short prose
```

---

## Pattern A — Record blocks (multi-field rows)

**Use for:** age bands, cohort profiles, triage checklists, anything that was a 4+ column “one row = one subject” table.

**Before (avoid):**

| Age | Who decides “we’re going” | Who decides “we’re staying” | Design implication |
|-----|---------------------------|----------------------------|-------------------|
| 3–5 (C1–C2) | Parent proposes; child can kill the day | Child | First 20 minutes must deliver |

**After (preferred):**

### 3–5 (C1–C2)

- **Going:** Parent proposes; **child can kill the day**
- **Staying:** Child
- **Design:** **First 20 minutes** must deliver · characters · easy win

Repeat `###` (or `####` under a `###` parent) per record.

---

## Pattern B — Two-column consolidated (reference lists)

**Use for:** fit tags, vendor directories, slug registries — many attributes, but one primary key per row.

**Before (avoid):**

| Slug | Display label | Declares | Primary cohort |
|------|---------------|----------|----------------|

**After (preferred):**

| Slug | Summary |
|------|---------|
| `stroller-sightline` | Stroller sightline · content at seated height · **C0** |
| `parallel-play` | Side-by-side play; no turn-taking · **C1** |

One line per row; use **bold** for cohort codes at the end.

---

## Pattern C — Matrix table + horizontal scroll

**Use for:** modality × cohort grids, season calendars, anything where **both axes are labels** and cells are 1–3 characters.

Keep the table, but add a kramdown IAL so wide tables scroll instead of crushing column width:

```markdown
| Modality | C0 | C1 | C2 |
|----------|:--:|:--:|:--:|
| Roving characters | ● | ●●● | ●● |

{: .table-scroll}
```

On small viewports or narrow doc columns, the table scrolls horizontally. Do **not** use this for prose-heavy tables — refactor those to Pattern A or B first.

---

## Pattern D — Two-column pairs (already good)

Keep as-is when the second column is a **list fragment** or short phrase:

| Surface | Examples |
|---------|----------|
| **Pre-event** | Story kits · class lantern builds · relay signup |

---

## Pattern E — Narrative walkthroughs (future)

Long “day in the life” content belongs in [walkthroughs](child-audience/walkthroughs/index.html) — **time-ordered prose** with occasional tables for schedule blocks, not wide comparison tables.

---

## Author checklist

Before committing a table in `docs/`:

- [ ] Count columns — **>3 with prose?** → Pattern A or B
- [ ] Read one row aloud — if it feels like a form with four fields, use **record blocks**
- [ ] Matrix with 5+ columns? → add `{: .table-scroll}`
- [ ] Preview at [local Jekyll](getting-started.html) with TOC visible (~1100px+ width)
- [ ] Run `npm run lint:md:strict -- "Operations/Festival Network/shared/docs/…"` from repo root

---

## Agents

When editing Festival Network `docs/` or child-audience guides:

1. Apply this guide before creating new tables.
2. Refactor existing 4+ column prose tables to Pattern A or B when touching a file.
3. Do not add HTML wrappers unless using `{: .table-scroll}` on a matrix.

Coalition monorepo research may keep wide tables; **published `docs/`** should follow this guide.
