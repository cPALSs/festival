> **Canonical (cPALSs vault):** `Programs/Lunar New Year/2027/Business Development/Food Menu Item Naming Guidelines.md` — edit there; this copy is for the festival git tree.

# LNY 2027 — Food menu item naming guidelines

**Audience:** Food / drink / snack applicants (Eventeny Q1 capability + Q2 signatures)  
**Also for:** Vendor Director review, public menu publish, guest “By type / By cuisine” browse  
**Status:** Install for 2027 application copy · paste Eventeny help text below  

Related: [Eventeny Migration — Food application](lny-2027-vendor-platform-eventeny-migration.md#food-application-eventeny-custom-questions) · [Food Flow Model](Food%20Flow%20Model.md)

---

## Browse for names — not for volume

Applicants **should** look at the public food menu ([eglny.com/food-menu/](https://eglny.com/food-menu/) · 2026 season as the working example) to learn what **good names** look like.

They should **not** try to match how many lines appear per booth. Last year’s list is a naming reference, not a target count. Padding a long list with vague items hurts menu fit scoring and floods guests.

---

## Public menu item limit (hard)

Only a **short festival focus** reaches the public menu — never the full restaurant / truck line.

| Booth class | Max items on **public menu** (and Q2 signatures) | Engine field |
|-------------|--------------------------------------------------|--------------|
| Open cook / truck / trailer | **10** | `signature_limit` → 10 |
| Prepack food | **10** | 10 |
| Prepack snacks | **10** | 10 |

**What publishes:** the **accepted recommended festival menu** (conditional offer) — a subset of Q2 signatures, still ≤ the cap above.  
**What does not publish:** full Q1 capability, “everything we can cook,” or a 50-line paste from a restaurant menu.

**Eventeny:** enforce Q2 max repeats to **10**. Staff may trim further on offer for roster mix / throughput.

The cap covers **signatures plus side items** (e.g. bottled water, canned soda) when vendors want those on the public list — still no padding with weak lines.

---

## Capability (Q1) vs festival focus (Q2)

| Question | Purpose | Length |
|----------|---------|--------|
| **Q1 — Capability** | What the kitchen *can* cook — feeds menu-fit scoring | Broader than Q2; aim for a **focused capability list** (roughly **10–20** strong food/drink lines for open/drinks, not a 50-item dump). Enough specific dishes for scoring; skip every regional variation and every soda flavor. |
| **Q2 — Signatures** | What you want highlighted **at this festival** | **Hard max 10** (signatures + sides). These are the public-menu candidates. |

Specific names still apply to both. A short list of sharp names beats a long list of **Coffee** / **Boba** / **Rice plates**.

---

## Why naming quality matters

The public festival menu (`eglny.com/food-menu/`) is how guests **search, filter, and plan** before they walk the grass. Vague names collapse discovery:

| Guest need | Weak name fails | Specific name works |
|------------|-----------------|---------------------|
| “Something Vietnamese” | Five vendors list **Coffee** / **Boba** | **Vietnamese coffee**, **Brown sugar boba milk tea** |
| “Not another generic plate” | **Rice plates** × 8 | **Lemongrass chicken rice plate**, **Sisig over rice** |
| Long **Meals** list | One flat wall of dishes | Names that support a **second browse level** (cuisine / dish family) under meals |

**Format alone is not enough.** We still classify items as meal / snack / drink for ops and the “By type” view. Meals stay a long list unless names (and light cuisine tags) give us a second cut — and unless each booth stays within the **public menu cap**.

---

## The naming ladder

Aim for the **right-hand column** on every Q1 and Q2 line. Signatures (Q2) must be at least “Better”; “Best” when the drink or dish has a real differentiator.

| Quality | Drinks | Meals / snacks |
|---------|--------|----------------|
| **Weak — don’t use** | Coffee · Boba · Milk tea · Soda · Water · Juice | Rice plates · Noodles · Skewers · Wings · Fries · Tacos |
| **Better** | Vietnamese coffee · Milk tea with boba · Canned soda · Bottled water · Sugarcane juice | Chicken rice plate · Beef skewers · Garlic fries · Chicken tacos |
| **Best** | Ube coconut latte · Brown sugar boba milk tea · Pandan iced coffee | Lemongrass chicken rice plate · Lao sausage musubi · Bomb azz carne asada tacos |

**Rule of thumb:** Could five other vendors submit the same string? If yes, add the cue that makes *your* item unique (cuisine, protein, sauce, prep, or signature flavor).

---

## Rules for applicants

1. **Name it as a guest would order it** — what they say at the window, not a kitchen section header.
2. **Put the distinctive cue in the name** — cuisine, protein, sauce, prep method, or signature flavor. Prefer concrete words over adjectives alone (*crispy*, *special*, *famous*).
3. **One line = one orderable item.** Split combos guests might want separately (**Bottled water** and **Canned soda**, not “Bottled water & canned soda”).
4. **Don’t list category labels as items.** “Drinks”, “Meals”, “Sides”, “Combo meals” are not menu lines.
5. **Signatures (Q2) are the only public-menu candidates** — and they are **capped at 10** (signatures + sides). Keep them specific.
6. **Browse the food menu for naming quality**, not to match item count. Do not pad Q2 to “use up” the cap with weak lines.
7. **Capability (Q1) can be broader than Q2**, but do not paste a 50-item restaurant menu. Same naming ladder; focused list for scoring.
8. **Sealed retail / snacks:** Name the product (**Chili crisp**, **Ube cookies**), not “Assorted snacks”.
9. **Language:** English is fine; keep diacritics when they help (**bánh mì**, **Tết**). Vietnamese dish names are welcome when that’s how guests know the food.

---

## Second-level browse (what good names enable)

Staff / engine keep **format**: `meals` · `snacks` · `sweets` · `drinks`.

Under **meals** (and sometimes snacks), we add a **second level** for the public menu — not DoorDash’s full cuisine catalog, a short festival set inferred from **item names first**, with vendor only for disambiguation of generic names:

| Second-level lane | Typical name cues |
|-------------------|-------------------|
| Vietnamese | phở, bánh mì, cơm, cà phê sữa, egg rolls / chả giò |
| Chinese | chow mein, orange chicken, siu mai, BBQ pork |
| Filipino | sisig, lumpia, tocino, lechon, adobo |
| Lao / Thai | papaya salad, pad thai, Lao sausage, larb |
| Mexican / Latin | tacos, elote, carnitas, aguas, pupusas |
| Japanese / Korean | teriyaki, musubi, katsu, bulgogi *(only when present)* |
| Asian | Pan-Asian generics (fried rice, noodle soup, sticky rice, rice plates, pork belly over rice) when no tighter lane fits |
| Mexican / Latin | tacos, elote, carnitas, aguas, pupusas |
| Mediterranean | chicken/lamb over rice, gyros, shawarma |
| American / fair classics | funnel cake, corn dog, turkey leg, loaded fries |
| Fusion | Explicit fusion names / tags only |
| Other | Still-unclassified meals (staff review queue) |

Drinks stay primarily under **drinks** format; specificity still matters so five coffee vendors don’t look identical.

Applicants are **not** required to pick a DoorDash-style cuisine on day one. **Specific names are the requirement**; cuisine lanes are staff/engine enrichment (same philosophy as dietary tags).

**Public menu browse (eglny.com/food-menu/):**

| Tab | What it groups |
|-----|----------------|
| **By cuisine** (default) | Meal cuisine lanes, then **Snacks** / **Sweets** (also under their cuisine when known), then **Drinks** last |
| **By vendor** | Booth list |
| **By diet** | Dietary facets |

**Future:** rename **By vendor** → **By zone / vendor**. Booth names alone aren’t meaningful to most guests; the value is **geography** (e.g. one parking lot) so people see what’s nearby. Keep vendor-level groupings under zone headings when layout/zones are stable.

Cuisine lanes: Vietnamese · Chinese · Filipino · Lao / Thai · Japanese / Korean · Asian · Mexican / Latin · Mediterranean · American / fair classics · Fusion · Other · Snacks · Sweets · Drinks.

**Classify the food item first.** Vendor name / optional `menu_concept` is guidance only when the dish name is ambiguous (e.g. “Skewers” at Lien’s Chinese → Chinese; Rhome’s “Filipino fusion” helps *The Gang Wangs*). Do **not** stamp commodity sides (**Bottled water**, **Canned soda**) with the vendor’s cuisine — they belong under **Drinks**.

Optional `cuisine` on an **item** overrides inference. Format: `meals` · `snacks` · `sweets` · `drinks`. Snacks / sweets may **double-list** under a known cuisine lane and their format section. Unclassified snacks/sweets stay under **Snacks** / **Sweets** only — not **Other** or **Fusion**.

**Snacks vs Sweets:** savory walk-arounds (lumpia, fries, wings, jerky) → `snacks`; desserts / candy / fair sweets (sago, fried banana, cotton candy, funnel cake, candy) → `sweets`.

### Item notes (muted second line)

Optional `note` under the item name (≤ ~100 characters). Vendor may propose; **organizer approves** before publish.

**No guessing.** Only publish a note when it comes from the vendor, a confirmed menu, or a standard gloss of the **item name itself** (e.g. `Phat paa pao` → *Lao stir-fried noodles*). Do **not** invent flavor lists or “assorted …” copy. If the name is vague and we lack a real note, **leave the note blank** and ask the vendor — that gap is the cue to get a better line.

**Audience:** hamburger-diner literacy is fine. Foreign words are OK when paired with a familiar anchor (*nori seaweed*, not bare *nori*; *ube (purple yam)*). Keep notes short — a cue, not a cuisine class.

| Use | Example |
|-----|---------|
| Translation | `Phat paa pao` → note: *Lao stir-fried noodles* |
| Flavor range | Only when the vendor lists them — e.g. *Milk tea · Thai tea · taro · brown sugar* |
| Prep cue | `Lao sausage musubi` → note: *Lao sausage over rice, wrapped in nori seaweed* |

Do **not** put the note in parentheses in the title. If a vendor submits `Bánh tráng trộn (rice paper salad)`, normalize on cleanup → name `Bánh tráng trộn` + note *Rice paper salad*. Do not use notes to dodge the 10-item public-menu cap.

---

## Eventeny help text (paste-ready)

### Menu concept (optional — booth-level, not Stripe business description)

> Optional — What does this booth serve? One short line (cuisine + a couple of signatures). Helps guests and reviewers when item names are branded or generic.
>
> **Good:** Filipino fusion — lumpia, adobo, crispy wings.  
> **Good:** Lao / Thai — papaya salad, khao poon, grilled meats.  
> **Good:** Halal Mediterranean plates — chicken & lamb over rice, gyros.  
> **Too vague:** Amazing Asian food for the whole family.  
>
> Skip if your signature item names already make the booth obvious. Do **not** paste a full restaurant bio.

### Q1 — Capability (scoring — not the public menu)

> List what your kitchen can cook as a **guest would order it**. Specific names help us score menu fit.
>
> Browse [eglny.com/food-menu/](https://eglny.com/food-menu/) for **naming** examples — not for how many lines to submit. A focused list of strong dishes beats a 50-item dump.
>
> **Good:** Ube coconut latte · Lemongrass chicken rice plate · Lao sausage musubi  
> **Too vague (avoid):** Coffee · Boba · Rice plates · Noodles · Skewers  
>
> One line per item. Split water and soda into separate lines. Water/soda are fine here.  
> **This list is not the public festival menu.**

### Q2 — Signatures / festival focus (public menu candidates — capped)

> Pick up to **10** signature / festival-focus items (includes sides like bottled water or canned soda if you want them online). These are the **only** candidates for the public online menu.
>
> Use the naming ladder — prefer **Ube coconut latte** over **Coffee**; **Brown sugar boba milk tea** over **Boba**.  
> Do **not** pad to fill the cap. Guests and search work better with fewer, clearer lines.
>
> If accepted, we may recommend a **festival focus** within this list (still within the cap) for publish.
>
> Optional **note** (muted line under the name): short translation or **vendor-supplied** flavor list — e.g. Phat paa pao → *Lao stir-fried noodles*. Do not invent flavors. Organizer may edit before publish.

### Optional one-liner under the item name field

> Name tip: Coffee → Vietnamese coffee → Ube coconut latte. Make it orderable and distinct.

---

## Staff checklist (review)

- [ ] Menu concept on file when item names are branded/generic (e.g. Filipino fusion for Rhome’s); use for staff cuisine hints — do **not** stamp commodity sides with it.
- [ ] Q2 count ≤ booth `signature_limit` (flag `SIGNATURE_OVER_LIMIT` if not).
- [ ] Public publish = accepted offer items only — never full Q1 capability.
- [ ] Reject or rewrite weak names before conditional offer / public publish (`lny-*-menu-cleanup.json` when needed).
- [ ] Split combo drink lines (water + soda) on cleanup if vendors didn’t.
- [ ] Confirm format (`meals` / `snacks` / `sweets` / `drinks`); assign second-level cuisine lane when the name supports it.
- [ ] Notes: translations/prep glosses OK; **no invented flavor lists**. Pull inline `(…)` glosses out of the title into `note`. Vague lines (`Boba / milk tea`, `Coffee`, `Matcha drinks`) with a blank note → ask the vendor for a better name or note.
- [ ] Returning vendors: pre-fill last year’s cleaned names so quality compounds — still enforce the cap.

---

## Out of scope here

- Dietary / allergen checkboxes — see Eventeny Migration § Menu metadata  
- Primary archetype / throughput — see [Food Flow Model](Food%20Flow%20Model.md)  
- Booth fees and SKUs — see Eventeny Migration § Vendor product SKUs  
