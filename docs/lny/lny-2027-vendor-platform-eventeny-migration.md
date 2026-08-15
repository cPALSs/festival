> **Canonical (cPALSs vault):** `Programs/Lunar New Year/2027/Business Development/LNY 2027 Vendor Platform - Eventeny Migration.md` — edit there; this copy is for the festival git tree.

# LNY 2027 — Vendor platform: Eventeny migration

**Status:** Working — **EGLNY is the Eventeny pilot** (GLF / Mid-Autumn 2026 host festival not held; do not wait on an MAF live run)  
**Draft scaffold (reuse):** [MAF 2026 Eventeny migration](../../Mid-Autumn%20Festival/2026/Business%20Development/MAF%202026%20Vendor%20Platform%20-%20Eventeny%20Migration.md) — form/SKU patterns only  
**Food curation:** [Food curation engine](https://github.com/cPALSs/festival/tree/main/tools/food-curation-engine) · [Food Flow Model](Food%20Flow%20Model.md)

---

## Decision

Move LNY 2027 vendor applications from Zeffy to **Eventeny**. This season is the **first live Eventeny festival** for the coalition. Food vendors feed the **food curation engine** for capacity, ranking, conditional offers, and public menu publish.

| Lane | Platform |
|------|----------|
| Vendor apply · deposit · booth fee · waitlist | **Eventeny** |
| Food curation · conditional offers · public menu | **Staff app** + engine JSON |
| VIP / donations | **Zeffy** (unchanged) |

### Eventeny scaffold (draft · Private)

| | ID / link |
|--|-----------|
| **Event** | `33484` |
| **Food booths & trucks** | app `54805` · [edit](https://www.eventeny.com/dashboard/events/event/vendors/application/create/?id=33484&app=54805) |
| **Merchants & corporate exhibitors** | app `54806` · [edit](https://www.eventeny.com/dashboard/events/event/vendors/application/create/?id=33484&app=54806) — `MER` $150 · `GEN` corporate $500 · trash deposits manual |
| **Nonprofit** | Not created yet |
| **Planning attendance** | **9,000** ([Market Modeling](Market%20Modeling.md)) |

### Applications open (working)

| Milestone | Target |
|-----------|--------|
| **Applications open / Round 1 starts** | **Thu Oct 1, 2026** (planning target) |
| Setup window | Aug–Sep 2026 — Eventeny event + SKUs + food-curation questions + eglny.com apply link |
| **Stripe payout** | Before Oct open — connect Eventeny → Stripe Express to **cPALSs** org bank (not personal). Manual/check default is OK during setup only. |
| **Open announcement** | One blast to the audiences below when Eventeny + eglny.com/vendors/ go live (do not open early just for inquire pressure) |

**Two-round calendar** (dates locked for planning; **seat counts** still wait on Elizabeth capacity — see [Two-round intake](#two-round-intake-certainty-incentive--all-booth-classes)):

**Cadence rule:** Aim to **hit booth limits**. People register late — keep Round 2 open through mid-January until we regularly sell out earlier; **only then** pull deadlines forward. Do not optimize for early close in year one of this policy.

| Milestone | Date | Notes |
|-----------|------|-------|
| **Open / Round 1 starts** | **Thu Oct 1, 2026** | Announce blast same day |
| **Round 1 apply closes** | **Sun Oct 25, 2026** | ~3½ weeks priority / certainty window |
| **Round 1 decisions out** | **Fri Oct 30, 2026** | Select from R1 pool only |
| **Round 1 booth-fee pay-by** | **Fri Nov 13, 2026** | Unpaid seats → Round 2 pool |
| **Round 2 apply closes** | **Thu Jan 15, 2027** | Matches Eventeny deadline · catch late registrants · fill remaining ~20–30% |
| **Round 2 decisions out** | **Thu Jan 22, 2027** | Batch after Jan 15 close |
| **Round 2 booth-fee pay-by** | **Fri Jan 29, 2027** | ~2 weeks before Feb 13–14 · chase hard |

If Oct 1 open slips, **keep the same relative gaps** for Round 1; **do not** move Round 2 close earlier than **Jan 15** until sellout cadence justifies it.

**Hard external deadlines (don’t slip past these):**

| Constraint | Date / rule | Implication for our calendar |
|------------|-------------|------------------------------|
| **Sac County EMD — TFF package** | Organizer submits vendor TFF info + menus **≥ 2 weeks before** the event ([EMD FAQ](https://emd.saccounty.gov/us/en/faqs/temporary-food-facilities-faqs.html) · operator packet). Late = **25% fee**; **&lt; 3 days** = not accepted. | For **Feb 13–14** → clean submit by **~Thu Jan 30, 2027**. R2 pay-by **Jan 29** + 48h release → next food vendor often **after** that floor → **org absorbs late fee** (tight calendar was our choice). |
| **Internal TFF chase (working)** | Sheets with offer on **Jan 22** · file on-time vendors by **Jan 30** · late adds as they clear pay | Don’t wait for booth-fee pay-by to start TFF paperwork. |
| **Multi-event / annual TFF** | Some vendors already hold annual / multi-event permits | Still need organizer roster coordination; less first-time packet friction. |
| **City / CCSD insurance & event paperwork** | Often **~30 days** pre-event (org-level, not per-booth TFF) | Separate from vendor apply close — track on ops/finance checklists. |

Non-food booths (no open food / no TFF PRE-PKG) are **not** on the EMD TFF clock. Food · drinks · sealed MF **are**.

### Open-announcement audiences

When registration opens, **announce to all of these** (dedupe emails before send):

| Audience | Source | Notes |
|----------|--------|-------|
| **Booth waitlist** | [Google Form](https://docs.google.com/forms/d/1eN8ydyWLI_i4JeBDS2AoFM8KdCX8Dpwv7FlbGwXyn9g/viewform) responses | Live on eglny.com/vendors/ until Eventeny opens |
| **Last year’s vendors (EGLNY 2026)** | 2026 food/merchant export · [vendor reconciliation](../2026/Finance%20%26%20Administration/Vendor%20Reconciliation/) | Primary returning cohort |
| **Past vendors (prior seasons)** | Prior LNY vendor lists / archives | Include anyone who booth’d before 2026 if we still have contact |
| **Zeffy vendor email list** | Zeffy contacts from prior vendor/ticket flows | Export at announce time |
| **Ad-hoc inquires** | Table below | People who asked early and were told “Oct / watch vendors hub” |

**Mailing-list home (later):** consolidate waitlist + past vendors + Zeffy into **one** vendor mailing list after this season’s open. **Zeffy is a candidate** host; Eventeny / Sheet / other TBD — do not block the October announce on consolidation.

#### Ad-hoc inquire notify (add as they write in)

| Contact | Org / booth | Email | Notes | Added |
|---------|-------------|-------|-------|-------|
| **Cher Vang** | Wonton Crunchies (food · EGLNY 2026) | `chervang123@yahoo.com` | Inquired 2026-08-12; told Oct earliest + watch vendors hub | 2026-08-12 |

- [ ] **Announce open** — deduped blast to waitlist Form + 2026 vendors + past vendors + Zeffy vendor list + ad-hoc table · confirm eglny.com/vendors/ points at Eventeny apply (retire or redirect waitlist CTA)
- [ ] **Stripe payout on Eventeny** — before applications open (see below)

---

## Eventeny Stripe payout (before Oct open)

**Event:** Elk Grove Lunar New Year Tết · Eventeny id `33484` · setup step 4  
**Status (2026-08-13):** Deferred — **Manual payout** selected for now. Connect Stripe before vendor apps take money.

**Why not leave manual:** Without Stripe, Eventeny defaults to **check** payout in a **75–90 day** window plus an **additional 1% fee (up to $5)**. Fine while scaffolding; bad once deposits/booth fees flow.

**Account must be:** **cPALSs** nonprofit bank — **not** Bao personal. Legal name: Community Partners Advocate of Little Saigon Sacramento · EIN **47-1100695**.

**What Stripe / Eventeny asks for:**

| Block | Items |
|-------|--------|
| **Business info** | Legal business ID · EIN/Tax ID · Business location · Business description |
| **Business public details** | Statement descriptor · Customer support number |
| **Bank account** | Bank name · Routing number · Account number |
| **Personal (authorized signer)** | Legal name · Contact & DOB · Address |

**Help:** [Eventeny — Setting Up a Stripe Express Account for On-Site Sales](https://help.eventeny.com/hc/en-us/articles/26459505519259-Setting-Up-a-Stripe-Express-Account-for-On-Site-Sales)

---

## Vendor product SKUs (Eventeny)

**Source of truth:** [`sku-catalog.json`](../../../Sites/eglny/data/sku-catalog.json)

Apply form **first question = product SKU**. Footprint is a **follow-up** (especially for `LNY-VENDOR-DR`).

| SKU | `vendor_class` | Weekend fee (std) | Setup |
|-----|----------------|-------------------|--------|
| `LNY-VENDOR-FT` | `open_prep` | $750 | Truck / trailer pad |
| `LNY-VENDOR-OC` | `open_prep` | $750 | Canopy + equipment |
| `LNY-VENDOR-DR` | `drinks` | $500 | **Follow-up:** canopy · truck · trailer · prepack booth |
| `LNY-VENDOR-SN` | `snack` | $150 | Prepack booth (fixed) · fill-first |
| `LNY-VENDOR-MF` | `merchant` | $150 | Prepack booth + TFF PRE-PKG · fill-first |
| `LNY-VENDOR-MER` | `merchant` | $150 | Goods for sale (retail *or* craft) · fill-first · **2027: no maker gate** |
| `LNY-VENDOR-GEN` | `merchant` | $500 | **Corporate / marketing / brand activation only** — not item retail |
| `LNY-VENDOR-NP` | `merchant` | **$75** | Nonprofit / mission info |
| `LNY-VENDOR-YTH` | `merchant` | **$75** | Children-owned — **same as NP** · DIY fallback only |
| Kids Markets *(partner)* | — | **$75** festival fee *(fee-share TBD)* | Prefer **their** registration — don’t stand up `YTH` in Eventeny until DIY fallback needed |

**Retired:** `LNY-VENDOR-PF` / Zeffy “prepack food” → route to DR, SN, or MF by menu.

Engine import maps `Vendor SKU` column via `food_curation/vendor_skus.py`.

---

## Food application (Eventeny custom questions)

Mirror MAF §5.1 with LNY archetypes from [Food Flow Model](Food%20Flow%20Model.md).

### Booth setup (required — drives layout & TFF tier)

Ask vendors to pick **one** setup type. Wording is intentional: “open food” covers live prep **with or without** grill/heat (sugarcane press, mocktails, boba bar).

| Application option | `setup_type` | Typical permit | What it means |
|--------------------|--------------|----------------|---------------|
| **Open food · canopy** | `open_food_canopy` | MEV / TFF PREP · 10×20 | Live prep under canopy — cooking **or** fresh-pressed/mixed drinks (sugarcane, mocktails, boba) |
| **Open food · truck** | `open_food_truck` | MFF | Self-contained food truck |
| **Open food · trailer** | `open_food_trailer` | TFF PREP + trailer | Towed trailer or booth+trailer |
| **Prepack booth (sealed only)** | `prepack_booth` | TFF PRE-PKG · 10×10 | **Sealed** goods only — no onsite prep, opening, or mixing (used by snack vendors and TFF food merchants) |

**Food vendor class** (required on food application — drives selection caps & pricing):

| Class | Application label | Selection |
|-------|-------------------|-----------|
| `open_prep` | Open prep food | Archetype throughput — plates, handhelds, BBQ |
| `drinks` | Drinks | Drink archetype throughput + exclusivity (boba, sugarcane, aguas) |
| `snack` | Snack (optional) | Vendor-count cap from snack buy-rate model |

**Merchants** (separate Eventeny exhibitor / merch ticket — **not** in food curation caps):

| Class | Application label | Notes |
|-------|-------------------|-------|
| `merchant` | Merchant / craft booth (`MER`) | Apparel, crafts, general retail — **$150** goods lane |
| `merchant` | Corporate exhibitor (`GEN`) | Brand activation / promo — **$500**; not item retail |
| `merchant` + sealed take-home food | Same merch ticket | Special case: **requires TFF PRE-PKG** (`requires_tff_pre_pkg: true`, `setup_type: prepack_booth`) — jars, frozen packs, chili oil |

Legacy `take_home` in seed data normalizes to `merchant`.

| Question | Engine field |
|----------|--------------|
| **Menu concept** (optional — one short line) | `menu_concept` — booth cuisine cue for staff + optional By-vendor blurb. **Not** Stripe “business description.” |
| **Social media** (preferred: Instagram; Facebook OK) | `instagram_handle` (and/or Facebook URL) — feeds social-reach scoring + highlight-reel coordination. Prefer Instagram if they have it; Facebook alone is fine. Staff should not hunt handles after apply. Optional TikTok on a second line. |
| **Q1: Capability** (repeatable — scoring, **not** public menu) | `capability_menu_items[]` |
| **Q2: Signatures / festival focus** (from Q1; **hard max 10** — signatures + sides) | `signature_menu_items[]` + `signature_limit` |
| **Primary food category** (staff confirms on review) | `primary_archetype_id` — see [Food Flow Model § Primary archetype](Food%20Flow%20Model.md#primary-archetype--bottleneck-item) |
| Per-item allergens | Item subfields |
| Halal/Kosher certification (conditional) | `dietary[]`, `certifications[]` |
| **Elk Grove business community** (yes/no, self-report) | `elk_grove_based` — vendor considers their business part of the Elk Grove business community (shop in city, truck based in / regularly serving EG, etc.). Not verified. Feeds policy preference **and** City post-event vendor community counts. |
| Attestation: understand recommended festival menu if accepted | Policy |

**Eventeny help text (menu concept — optional):**

> Optional — What does this booth serve? One short line (cuisine + a couple of signatures). Helps guests and reviewers when item names are branded or generic.
>
> **Good:** Filipino fusion — lumpia, adobo, crispy wings.  
> **Good:** Lao / Thai — papaya salad, khao poon, grilled meats.  
> **Good:** Halal Mediterranean plates — chicken & lamb over rice, gyros.  
> **Too vague:** Amazing Asian food for the whole family.  
>
> Skip if your signature item names already make the booth obvious. Do **not** paste a full restaurant bio (that’s not this field).

**Eventeny help text (social media):**

> Business Instagram or Facebook (Instagram preferred if you have both).  
> Examples: `@rhomes_bistro` · `instagram.com/rhomes_bistro` · Facebook page URL.  
> We use this for menu scoring and occasional food highlight posts — **not** to post every menu item.  
> No public page? Write **none**. Optional: TikTok on a second line.

### Menu item naming + public menu caps

Vague names and long dumps both break the guest menu. **Install for 2027:** [Food Menu Item Naming Guidelines](food-menu-item-naming-guidelines.md).

**Browse vs volume:** Applicants should study [eglny.com/food-menu/](https://eglny.com/food-menu/) for **naming quality** (Coffee → Vietnamese coffee → Ube coconut latte). They must **not** try to match how many lines appear per booth.

**Public menu hard cap** (Eventeny Q2 max + publish ceiling): **10** items per booth (signatures + sides such as bottled water / canned soda). Unified across open cook, truck, trailer, and prepack.

Only the **accepted recommended festival menu** publishes (≤ 10). Full Q1 capability never publishes. Engine already flags `SIGNATURE_OVER_LIMIT`.

**Ladder (paste into Eventeny help):** Coffee → Vietnamese coffee → **Ube coconut latte**. Same for food: Rice plates → Chicken rice plate → **Lemongrass chicken rice plate**.

**Eventeny help text (Q1 — capability):**

> List what your kitchen can cook as a **guest would order it**. Specific names help us score menu fit.
>
> Browse [eglny.com/food-menu/](https://eglny.com/food-menu/) for **naming** examples — not for how many lines to submit. A focused list of strong dishes beats a 50-item dump.
>
> **Good:** Ube coconut latte · Lemongrass chicken rice plate · Lao sausage musubi  
> **Too vague (avoid):** Coffee · Boba · Rice plates · Noodles · Skewers  
>
> One line per item. Split water and soda into separate lines. Water/soda are fine here.  
> **This list is not the public festival menu.**

**Eventeny help text (Q2 — signatures / public candidates):**

> Pick up to **10** signature / festival-focus items (includes sides like bottled water or canned soda if you want them online). These are the **only** candidates for the public online menu.
>
> Prefer **Ube coconut latte** over **Coffee**; **Brown sugar boba milk tea** over **Boba**. Do **not** pad to fill the cap.
>
> If accepted, we may recommend a festival focus within this list (still within the cap) for publish.

Format (`meals` / `snacks` / `drinks`) stays the first browse axis. **Second-level cuisine / dish-family** under meals comes from specific names + staff enrichment. Full taxonomy: naming guidelines § Second-level browse.

### Menu metadata — collaborative enrichment

**Philosophy:** Vendors are not expected to be allergen lawyers or tag every dish perfectly on first apply. The application asks for a **best-guess**; the **Vendor Director + engine** fill gaps before offers and public menu publish. **Repeat vendors** accumulate richer records each season (prior signatures, staff-confirmed tags, cleanup overrides in `lny-*-menu-cleanup.json`).

| Who | Responsibility |
|-----|----------------|
| **Vendor (Eventeny Q2 per signature item)** | Name, price, optional checkboxes: mild (no hot chili), good for young children, soft/easy to chew, vegetarian/vegan, common allergens |
| **Vendor (booth-level)** | Halal/Kosher certification upload when applicable |
| **Engine** | Keyword inference for missing tags (`menu_enrichment.py`) — conservative; ribs won't get `easy_chew` |
| **Staff (review)** | Confirm or override tags; set `primary_archetype_id`; mark `tags_vendor_confirmed` when vendor attested |

**Eventeny wording (Elk Grove business community — required yes/no on food + merchant applications):**

> Do you consider your business part of the Elk Grove business community?

Self-report — honest best answer; staff do not verify. Help text for vendors:

- **Brick-and-mortar:** shop, kitchen, or commissary in Elk Grove.
- **Food truck / mobile:** based in Elk Grove, regularly vend here, or consider Elk Grove your primary market — *registration mailing address alone is not the test* (it may be the owner's home).
- **Yes** → `elk_grove_based: true` (policy preference + post-event vendor community summary)
- **No** → `elk_grove_based: false`
- Optional follow-up: business city + ZIP (hint only when yes/no is blank; unreliable for trucks)
- **Do not audit** — max scoring swing is ~**0.01** on total score (5% weight); ties break on **deposit timestamp**, not this field

Aligns with [LNY 2026 post-event residency recommendations](../../2026/Finance%20&%20Administration/Post-Event%20Report/LNY-2026-Post-Event-Attendance-Summary-for-City-of-Elk-Grove.md#recommendations-for-next-year-lny-2027-and-beyond) — collect affiliation at apply time instead of web-research after the festival.

**Eventeny wording (per signature item — optional multi-select):**

> Help guests find your food. Check all that apply to **this item as you will serve it at the festival**. Best guess is fine — our team may follow up. Not medical certification.

- Mild — no hot chili / suitable for spice-sensitive guests  
- Good for young children (~3–10) — familiar, easy to eat  
- Soft / easy to chew — soups, rice plates, steamed items (seniors welcome)  
- **Lower sugar / no added sugar** — unsweetened drinks, sugar-free boba, savory items without sugary sauce *as served* (vendor best guess; not diabetic medical advice)  
- Vegetarian · Vegan · Nut-free · Gluten-free · Dairy-free *(as served)*

Maps to `dietary_tags[]` on each `signature_menu_items` entry. Weights and definitions: [regional-need-profile.json](https://github.com/cPALSs/festival/blob/main/assets/shared/food-curation/regional-need-profile.json) (`need_catalog`).

**Repeat vendor advantage:** Returning vendors can pre-fill from last year's accepted offer; staff spend less time on metadata and scoring is more accurate.

**Primary archetype (open prep & drinks):** one value per vendor for cap competition. Ask vendors which signature **limits their line** (slowest item they will actively sell). Engine suggests from menu keywords; staff override when mixed (e.g. BBQ ribs + sandwiches → `bbq_smoke_carved`, not `fast_handheld`).

| Open prep `primary_archetype_id` | Label | Typical bottleneck |
|----------------------------------|-------|--------------------|
| `fast_handheld` | Fast handheld | Bánh mì, tacos, skewers, pizza slice, musubi |
| `rice_plates_bowls` | Rice plates & bowls | Sisig over rice, tocino plate, teriyaki bowl |
| `noodle_wok_soup` | Noodle / wok / soup | Pad thai, chow mein, pho |
| `bbq_smoke_carved` | BBQ / smoke / carved | Ribs, lechon, turkey leg, brisket *plate* |
| `boba_milk_tea` | Drinks · boba anchor | Milk tea bar (drinks class only) |
| `sugarcane_fruit_refresher` | Drinks · sugarcane/aguas | Fresh-pressed juice (drinks class only) |

Preset: [lny-2027.json](https://github.com/cPALSs/festival/blob/main/assets/shared/food-curation/presets/lny-2027.json)

---

## Recommended festival menu (conditional offer)

1. Engine ranks applicants by **menu fit** (deposit = tiebreaker only).
2. Vendor Director drafts a **recommended festival menu** from vendor capability — focused items that fit roster diversity and throughput, not their full restaurant line — **≤ booth `signature_limit`** (**10**).
3. Vendor accepts the recommendation → Eventeny **Approved** → booth fee path.
4. Public menu at `eglny.com/food-menu/` publishes **only** the confirmed festival-focus items (never full Q1 capability).

See [Food Menu Item Naming Guidelines](food-menu-item-naming-guidelines.md) — browse prior menus for **names**, not volume.

Staff app: **See all** on an accepted vendor → check items and offer letter at bottom of capability modal.

**Approval gate:** Do not approve on Eventeny until `conditional_offer.status = accepted`.

### Why recommend a narrow menu?

The coalition curates **mix across all applicants** — not just who applied first. A focused menu helps vendors **control ingredient cost**, especially unused inventory after a weekend booth. Vendors may still bring broader capability on the truck; the recommendation is what we **highlight to guests** and what we ask them to **plan and prep for**.

**Vendor-facing frame:** *Highly recommended menu for this festival — helps you buy smart and keeps lines moving. We publish this menu so guests know what to expect.*

**Mutual self-interest (no compliance file needed):** The public online menu is the **discovery layer** — filters, search, and pre-festival planning. Items on the confirmed menu get that visibility; a full truck menu does not. Guests who find extra items only do so **by accident on-site**. Vendors who cooperate with the recommended focus get traffic; vendors who run wide without aligning lose online discovery. That alignment steers ingredient buying and booth prep without a penalty spreadsheet — cooperation pays in covers.

---

## Two-round intake (certainty incentive — all booth classes)

**Why:** No early-bird **$** discount (exclusivity + $150 goods already priced). Deposit order alone is a weak early lock-in. The real incentive is **certainty**: apply in Round 1 → get a decision → pay → **guaranteed seat**. Round 2 applicants wait until the deadline.

**Applies to:** **All** Eventeny booth classes — open cook · drinks · snack/MF · merchant/craft · corporate GEN · nonprofit / youth — not food-only. Urgency is the same product for non-food pads.

**Capacity (separate from dates):** Round **sizes** need a hard booth inventory. Planning mix in [Market Modeling](Market%20Modeling.md) is provisional until **Elizabeth / CCSD** confirms which park spaces we can use (lots, sidewalks, Pavilion adjacencies, fire/egress). **Calendar dates are locked** in [Applications open](#applications-open-working) — publish dates on vendors hub; publish **per-SKU seat counts** (R1 release vs R2 hold) only after capacity is clear.

### Round structure

| | **Round 1 — Priority** | **Round 2 — Open / batch** |
|--|------------------------|----------------------------|
| Window | **Oct 1 → Oct 25, 2026** | Continues through **Jan 15, 2027** |
| Inventory | **~70–80%** of final pad capacity (by SKU / lane) | **~20–30% held back** + any Round 1 seats that don’t pay by **Nov 13** |
| Decision | **Oct 30** — select from Round 1 pool (food = menu-fit engine; non-food = staff review / fit) | **Jan 22** batch — no rolling “you’re in” promise before R2 close |
| Guarantee | Selected → conditional offer (food) or approval path → **pay by Nov 13** → **seat locked** | Not guaranteed until Round 2 decisions; **pay by Jan 29, 2027** |
| Deposit | Required to be considered | Same |

**Hold-back rule:** Do **not** fill 100% in Round 1. Reserve **20–30%** into Round 2 so late strong applicants (and subcategory variety on drinks) still have a real path. Food DR floors (2+1+1+1 coffee) and open-cook caps still apply across both rounds — don’t exhaust a subcategory in Round 1 if Round 2 needs room.

### Payment chase → release to selection waitlist

**Selection is provisional until money clears.** Staff stay on top of deposits and booth fees. Miss the pay-by (or ignore chase) → **release that seat to the next viable vendor on the selection waitlist** for that lane / subcategory. No indefinite soft holds.

| Stage | What must clear | If unpaid / ghosted |
|-------|-----------------|---------------------|
| Apply | **Deposit** (Eventeny) | Not ranked / not considered until deposit lands |
| Round 1 selected | **Booth fee by Nov 13** (after conditional offer / approval path) | Release → next viable on R1/R2 wait pool for that SKU · food = next menu-fit · non-food = next staff-ranked |
| Round 2 selected | **Booth fee by Jan 29** | Same — promote next viable immediately; don’t wait for festival week |
| Post-decision cancel / no-show | Fee + any TFF sheet still owed | Promote from remaining selection waitlist |

**Chase SOP (Vendor Ops):**

**Round 1** (comfortable runway — Nov 13 pay-by):

1. Offer sent **Oct 30** → reminders at **T−7 (Nov 6)** and **T−2 (Nov 11)**.
2. Pay-by passes unpaid → **48-hour final**, then **release** to next viable.

**Round 2** (tight vs TFF — Jan 29 pay-by · EMD floor **~Jan 30**):

1. Decisions **Jan 22** = **T−7** reminder day (same email: you’re selected · fee due Jan 29 · TFF sheets now).
2. **T−2 (Jan 27)** reminder.
3. Unpaid after **Jan 29** → **48-hour final** (through **~Jan 31**) → **release**.
4. Next food vendor promoted **on or after Jan 30** will often land **after** the clean 2-week EMD window → expect **25% TFF late fee**. **Coalition eats that late fee** — we chose the tight R2 calendar to chase fill; the replacement vendor didn’t. Still promote. Hard stop remains **&lt; 3 days** before the event (EMD won’t accept).

**Both rounds:** next viable = curated selection waitlist (food: engine rank + subcategory floor; non-food: staff fit; deposit timestamp = tiebreaker only). Log release + who got the seat. Non-food R2 promotions have **no TFF clock**. Food promote after Jan 30: note “TFF late fee — org absorbs” on the offer.

**Vendor-facing:** *A selection holds your booth only through the pay-by date. If the deposit or booth fee isn’t paid on time, we offer that seat to the next vendor on our waitlist.*

### When we release (refund) deposits

Deposits are **security / trash / cleanup** money — not a second booth fee. **Booth fees stay non-refundable once paid.** Deposit timing:

| Outcome | Release deposit when | Notes |
|---------|----------------------|-------|
| **Rejected** (hard deny) | **Within 7 days** of reject | Don’t sit on cash |
| **Withdrawn** (selected · didn’t pay fee after chase) | **With the withdrawal** (after 48h final notice) | Seat → next waitlist; refund their apply/approval deposit |
| **Waitlisted · never offered** | **After waitlist freeze** — target **Fri Feb 6, 2027** (~1 week before fest) | Keep deposits while we may still promote for cancels; then bulk-refund anyone with no offer |
| **Registered · attended · clean booth** | **Post-event** — target **within 14–30 days** after close (by **~Mar 14, 2027**) | Full refund after cleanup / trash check |
| **Registered · damage / trash fail / no-show** | **Partial or forfeit** per inspection | Cooking **$500** cleanup deposit can be docked for grease/pad damage; **$100** trash deposit for left trash / no tear-down |

**What “deposit” is on each SKU** ([`sku-catalog.json`](../../../Sites/eglny/data/sku-catalog.json)):

| Lane | When charged | Amount | Role |
|------|--------------|-------:|------|
| Open cook / truck (`FT` / `OC`) | On **approval** | **$500** | Cleanup / damage |
| All other paid SKUs | On **apply** | **$100** | Trash / pad security |

**Don’t refund early** just because Round 1 or Round 2 decisions posted — waitlisted people still need skin in the game until freeze. **Do refund promptly** on reject and on pay-or-release withdrawal so we’re not holding money with no path to a seat.

**Vendor-facing one-liner (vendors hub / packet):**

> *Priority round (through Oct 25): if you’re selected and you pay by Nov 13, your booth is guaranteed. Open round: apply through Jan 15; decisions Jan 22 for remaining seats (~20–30% held back); pay by Jan 29. Unpaid selections are released to the next waitlisted vendor. Deposits refund on reject/withdraw, after waitlist freeze if never offered, or post-event if you clean up; booth fees are non-refundable once paid.*

### Waitlist / cancel fills

- **Selection waitlist** = ranked runners-up after each round’s decisions (not “deposit order = reserved”).
- After Round 2, unpaid cancels and no-shows promote from that wait pool the same way.
- Food: promote by **engine menu-fit rank** (respect DR subcategory floors), not deposit order alone.
- Non-food: staff review / directory fit; deposit timestamp is a **tiebreaker**, not a reservation.
- Do **not** tell applicants that early deposit alone reserves a pad.

### Checklist

- [x] Lock Round 1 / Round 2 **calendar** (Oct 1 → Jan 15 R2 close · Jan 29 pay-by) — see Applications open table · **don’t pull R2 earlier until sellout cadence**
- [ ] **Elizabeth / CCSD:** usable spaces + fire/egress → **final booth capacity** by lane (food South · goods North · NP · GEN · Pavilion coffee pad)
- [ ] Publish per-SKU seat counts: Round 1 release vs Round 2 hold (~20–30%) — after capacity
- [ ] Eventeny deadline field = **Jan 15, 2027** (R2 apply close) · packet copy with two-round dates + **pay-or-release** language (no early-bird $)
- [ ] Staff SOP: select → offer/approve → **T−7 / T−2 chase** → 48h final → **release to next viable on selection waitlist**
- [ ] Maintain per-lane **selection waitlist** (food engine rank · non-food staff rank) after each decision batch
- [ ] **Deposit refunds:** reject/withdraw ASAP · waitlist never-offered @ **Feb 6 freeze** · attended clean @ **≤30 days post-event**

---

## Scaling rule

Attendance growth adds **vendor slots** per archetype (engine capacity plan @ 2K–20K). **Signature / public-menu limit per vendor stays fixed at 10** (signatures + sides) — add more vendors, not wider menus. See [LNY 2026 backtest case study](https://github.com/cPALSs/festival/blob/main/assets/case-studies/lny-2026-food-curation-backtest.md).

---

## Staff tooling

```bash
cd "Operations/Festival Network/shared/tools/food-curation-engine"
python3 -m unittest tests/test_engine.py -v
python3 scripts/build_lny_2026_seed.py
python3 -m http.server 8765 --directory staff-app
```

Export Eventeny CSV → `scripts/run_engine.py` (or staff app JSON import).

---

## Related

- [MAF 2026 Vendor Platform - Eventeny Migration](../../Mid-Autumn%20Festival/2026/Business%20Development/MAF%202026%20Vendor%20Platform%20-%20Eventeny%20Migration.md) (scaffold only — not a live pilot)
- [LNY 2026 Lessons & Booth Caps](LNY%202026%20Lessons%20&%20Booth%20Caps.md)
- [Vendor profitability advisory](../../../../Governance/Partnerships/cPALSs%20Revenue%20Model%20-%20Decor%20Assets%20and%20APIDA%20LNY.md)

*Last updated: 2026-08-14 (pay-or-release to selection waitlist · R2 Jan 15 fill-first)*
