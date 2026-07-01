/** Fund the Festival — multi-festival interactive model */

const fmt = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Subset of markdown used in gift copy — **bold**, *italic* */
function formatMarkdown(text) {
  if (!text) return "";
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

/** Most important → most optional within each section */
const GIFT_SORT = {
  festival_foundation: 0,
  festival_stage: 1,
  safe_festival: 2,
  festival_amenities: 3,
  lantern_procession: 1,
  saturday_children: 2,
  honor_elders: 3,
  light_up_derr_okamoto: 4,
  spread_the_word: 5,
  festival_stage_plus: 6,
  safe_festival_plus: 7,
  festival_amenities_plus: 8,
  lucky_wav: 8,
  asian_cajun_show: 9,
  children_show: 11,
  tet_relay_cup: 12,
  children_village: 13,
  stage_production_plus: 10,
  sponsor_booth: 1,
  tent_rental: 2,
  additional_amount: 0,
};

function giftBenefits(gift) {
  const b = gift.benefits;
  if (!b) return [];
  return Array.isArray(b) ? b : [b];
}

const DEFAULT_SPONSOR_TIERS = [
  { label: "Community supporter", min: 0 },
  { label: "Supporter", min: 250 },
  { label: "Bronze", min: 500 },
  { label: "Silver", min: 1000 },
  { label: "Gold", min: 2500 },
  { label: "Diamond", min: 5000 },
  { label: "Presenting", min: 10000 },
];

function getSponsorTiers() {
  return state.data?.sponsorTiers ?? DEFAULT_SPONSOR_TIERS;
}

function sponsorTierForTotal(total) {
  const tiers = getSponsorTiers();
  let current = tiers[0];
  for (const tier of tiers) {
    if (total >= tier.min) current = tier;
  }
  return current;
}

function currentSponsorTier() {
  return sponsorTierForTotal(sponsorTotal());
}

function resolveBenefitText(text, total = sponsorTotal()) {
  const tier = sponsorTierForTotal(total);
  return text.replace(/\{tier\}/g, tier.label);
}

const DEFAULT_GLOBAL_PERKS = [
  { id: "stage_mentions", label: "Stage recognition", template: "{tier}-tier stage mentions" },
];

function getGlobalPerks() {
  return state.data?.globalPerks ?? DEFAULT_GLOBAL_PERKS;
}

function globalPerkLines(total = sponsorTotal()) {
  if (total <= 0) return [];
  return getGlobalPerks().map((p) => ({
    label: p.label,
    text: resolveBenefitText(p.template, total),
  }));
}

/** Core/options: sortOrder. Registry: impactOrder (higher = flagship). Default desc for registry. */
function registrySortMultiplier(category) {
  if (category !== "registry") return 1;
  const mode = currentFestivalEntry()?.registryImpactSort;
  if (mode === "asc") return 1;
  return -1;
}

function giftSortKey(gift, category) {
  if (category === "registry" && gift.impactOrder != null) return gift.impactOrder;
  return gift.sortOrder ?? GIFT_SORT[gift.id] ?? 99;
}

function compareGifts(a, b, category) {
  const ka = giftSortKey(a, category);
  const kb = giftSortKey(b, category);
  if (ka !== kb) return registrySortMultiplier(category) * (ka - kb);
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
}

function giftsInCategory(gifts, category) {
  return gifts
    .filter((g) => g.category === category)
    .sort((a, b) => compareGifts(a, b, category));
}

const FESTIVAL_ID_KEY = "build-festival-id";
const THEME_STORAGE_KEY = "build-theme";
const MAF_THEME_KEY = "maf-theme";
const LEGACY_THEME_KEY = "maf2026-theme";

/** festival.cpalss.com embed — site nav owns theme UI + maf-theme storage */
function isSiteEmbed() {
  return !!document.querySelector(".site-nav, .build-shell");
}

function activeThemeStorageKey() {
  return isSiteEmbed() ? MAF_THEME_KEY : THEME_STORAGE_KEY;
}

function estimatedSponsorsStorageKey(festivalId) {
  return `build-estimated-sponsors:${festivalId}`;
}

function enabledStorageKey(festivalId) {
  return `build-enabled:${festivalId}`;
}

function extraCashStorageKey(festivalId) {
  return `build-extra-cash:${festivalId}`;
}

const VALID_THEMES = new Set(["auto", "light", "dark"]);

const THEME_ICON_SVG = {
  light: `<svg class="theme-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`,
  dark: `<svg class="theme-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  auto: `<svg class="theme-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18V3z" fill="currentColor" stroke="none"/></svg>`,
};

function renderThemeIcon(theme) {
  const el = document.getElementById("theme-icon");
  if (!el) return;
  const key = VALID_THEMES.has(theme) ? theme : "auto";
  el.innerHTML = THEME_ICON_SVG[key];
}

function loadThemeFromStorage() {
  try {
    const key = activeThemeStorageKey();
    const theme =
      localStorage.getItem(key) ||
      (isSiteEmbed() ? localStorage.getItem(THEME_STORAGE_KEY) : null) ||
      localStorage.getItem(LEGACY_THEME_KEY);
    return VALID_THEMES.has(theme) ? theme : "auto";
  } catch {
    return "auto";
  }
}

function applyTheme(theme) {
  const next = VALID_THEMES.has(theme) ? theme : "auto";
  document.documentElement.setAttribute("data-theme", next);
  if (isSiteEmbed()) return;
  renderThemeIcon(next);
  const select = document.getElementById("btf-theme-select");
  if (select && select.value !== next) select.value = next;
}

function setTheme(theme) {
  const next = VALID_THEMES.has(theme) ? theme : "auto";
  applyTheme(next);
  try {
    localStorage.setItem(activeThemeStorageKey(), next);
  } catch {
    /* ignore */
  }
}

function initTheme() {
  applyTheme(loadThemeFromStorage());

  if (isSiteEmbed()) {
    window.addEventListener("storage", (e) => {
      if (e.key === EGLNY_THEME_KEY && VALID_THEMES.has(e.newValue)) applyTheme(e.newValue);
    });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (loadThemeFromStorage() === "auto") applyTheme("auto");
    });
    return;
  }

  const select = document.getElementById("btf-theme-select") || document.getElementById("theme-select");
  if (!select) return;
  select.onchange = () => setTheme(select.value);
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (loadThemeFromStorage() === "auto") applyTheme("auto");
  });
}

const state = {
  manifest: null,
  festivalId: null,
  data: null,
  enabled: {},
  extraCash: 0,
  modalGiftId: null,
  modalTab: "guest",
  cartTab: "selection",
  estimatedSponsors: null,
  estimatedSponsorMap: {},
  showEstimatedSponsors: false,
};

function currentFestivalEntry() {
  return state.manifest?.festivals?.find((f) => f.id === state.festivalId) ?? null;
}

function variableAmountGift() {
  return state.data?.gifts.find((g) => isVariableAmountGift(g)) ?? null;
}

function sumEnabled(categories) {
  if (!state.data) return 0;
  return state.data.gifts
    .filter((g) => categories.includes(g.category) && state.enabled[g.id])
    .reduce((s, g) => s + g.amount, 0);
}

/** Gift amounts covered by estimated 2026 sponsors (estimated-sponsors view only). */
function sumEstimatedAssigned(categories) {
  if (!state.showEstimatedSponsors || !state.data) return null;
  return state.data.gifts
    .filter((g) => categories.includes(g.category) && estimatedSponsorNames(g.id).length)
    .reduce((s, g) => s + g.amount, 0);
}

function registryFundedAmount() {
  const estimated = sumEstimatedAssigned(["registry", "secondary"]);
  if (estimated !== null) return estimated;
  return sumEnabled(["registry"]);
}

function getSponsorRules() {
  return state.data?.sponsorRules ?? { boothUnlockThreshold: 2500, boothTierLabel: "Gold" };
}

function sponsorTotal() {
  return sumEnabled(["registry", "core"]) + (state.extraCash || 0);
}

function giftsSubtotal() {
  return selectedGifts().reduce((s, g) => s + g.amount, 0);
}

function cartTotal() {
  return giftsSubtotal() + (state.extraCash || 0);
}

function coreGiftName(giftId) {
  const gift = state.data?.gifts.find((g) => g.id === giftId);
  return gift ? gift.name : "base core gift";
}

function isOptionUnlocked(gift) {
  const { boothUnlockThreshold, boothTierLabel } = getSponsorRules();
  if (gift.requiresSponsorThreshold && sponsorTotal() < boothUnlockThreshold) return false;
  if (gift.requiresBoothSpot && !state.enabled.sponsor_booth) return false;
  if (gift.requiresCoreGift && !state.enabled[gift.requiresCoreGift]) return false;
  return true;
}

function unlockNotice(gift) {
  const { boothUnlockThreshold, boothTierLabel } = getSponsorRules();
  const parts = [];
  if (gift.requiresSponsorThreshold && sponsorTotal() < boothUnlockThreshold) {
    parts.push(
      `Requires ${boothTierLabel} sponsorship (${fmt(boothUnlockThreshold)} minimum). Your build: ${fmt(sponsorTotal())}.`,
    );
  }
  if (gift.requiresBoothSpot && !state.enabled.sponsor_booth) {
    parts.push("Requires sponsor booth spot — add sponsor booth spot first.");
  }
  if (gift.requiresCoreGift && !state.enabled[gift.requiresCoreGift]) {
    parts.push(`Requires ${coreGiftName(gift.requiresCoreGift)} — select it first.`);
  }
  return parts.join(" ");
}

function isVariableAmountGift(gift) {
  return !!gift.variableAmount;
}

function isSelectableGift(gift) {
  if (gift.selectable === false) return false;
  return gift.category !== "secondary" && !isVariableAmountGift(gift);
}

function choicesLockedForEstimate() {
  return !!state.showEstimatedSponsors;
}

/**
 * Estimated sponsor pool: fund gifts in the same order as registry cards
 * (impact desc per festival). Last card on the grid is least likely covered.
 */
function compareGiftsForEstimate(a, b) {
  const rank = { registry: 0, secondary: 1, core: 2 };
  const ra = rank[a.category] ?? 3;
  const rb = rank[b.category] ?? 3;
  if (ra !== rb) return ra - rb;
  const category = a.category === "registry" ? "registry" : a.category;
  return compareGifts(a, b, category);
}

/** Explicit giftIds first; then pool remaining balances (multi-sponsor per gift). */
function isAllocatableEstimateGift(g) {
  return (
    g.amount > 0 &&
    !g.variableAmount &&
    !g.requiresBoothSpot &&
    !g.requiresSponsorThreshold &&
    (g.category === "core" || g.category === "registry" || g.category === "secondary")
  );
}

function addGiftContributor(map, giftId, sponsorName) {
  if (!map[giftId]) map[giftId] = [];
  if (!map[giftId].includes(sponsorName)) map[giftId].push(sponsorName);
}

/** Draw from sponsor balances (largest first) until gift is fully funded. */
function tryFundGift(gift, balances, map) {
  let need = gift.amount;
  const pool = balances
    .filter((s) => s.balance > 0)
    .sort((a, b) => b.balance - a.balance);
  const ledger = [];
  for (const sponsor of pool) {
    if (need <= 0) break;
    const take = Math.min(sponsor.balance, need);
    if (take <= 0) continue;
    ledger.push({ sponsor, take });
    need -= take;
  }
  if (need > 0) return false;
  for (const { sponsor, take } of ledger) {
    sponsor.balance -= take;
    addGiftContributor(map, gift.id, sponsor.name);
  }
  return true;
}

function computeEstimatedSponsorMap(gifts, sponsorPayload) {
  if (!sponsorPayload?.sponsors?.length) return {};

  const balances = sponsorPayload.sponsors.map((s) => ({
    name: s.name,
    balance: s.amount,
    pinGiftId: s.giftId ?? null,
    bundleGiftIds: Array.isArray(s.giftIds) && s.giftIds.length ? [...s.giftIds] : null,
  }));

  const map = {};
  const funded = new Set();

  const giftById = (id) => gifts.find((g) => g.id === id);

  const markFunded = (gift) => {
    if (gift) funded.add(gift.id);
  };

  // Phase 1a — single pin (e.g. AFG → outdoor stage)
  for (const sponsor of balances) {
    if (!sponsor.pinGiftId || sponsor.bundleGiftIds) continue;
    const gift = giftById(sponsor.pinGiftId);
    if (!gift?.amount || funded.has(gift.id) || !isAllocatableEstimateGift(gift)) continue;
    if (tryFundGift(gift, [sponsor], map)) markFunded(gift);
  }

  // Phase 1b — sponsor-exclusive bundles (giftIds array, no pinGiftId)
  for (const sponsor of balances) {
    if (!sponsor.bundleGiftIds) continue;
    for (const gid of sponsor.bundleGiftIds) {
      if (sponsor.balance <= 0) break;
      const gift = giftById(gid);
      if (!gift?.amount || funded.has(gift.id) || !isAllocatableEstimateGift(gift)) continue;
      if (tryFundGift(gift, [sponsor], map)) markFunded(gift);
    }
  }

  // Phase 2 — pool balances; same impact order as registry cards (top card funded first)
  const openGifts = gifts
    .filter((g) => isAllocatableEstimateGift(g) && !funded.has(g.id))
    .sort(compareGiftsForEstimate);

  for (const gift of openGifts) {
    if (tryFundGift(gift, balances, map)) markFunded(gift);
  }

  return map;
}

function estimatedSponsorNames(giftId) {
  const entry = state.estimatedSponsorMap[giftId];
  if (!entry) return [];
  return Array.isArray(entry) ? entry : [entry];
}

function estimatedSponsorTagsHtml(giftId) {
  if (!state.showEstimatedSponsors) return "";
  const names = estimatedSponsorNames(giftId);
  if (!names.length) return "";
  const tags = names.map((name) => `<span class="gift-sponsor-tag">${name}</span>`).join("");
  return `<div class="gift-sponsor-tags">${tags}</div>`;
}

function estimatedSponsorCardClass(giftId) {
  if (!state.showEstimatedSponsors) return "";
  return estimatedSponsorNames(giftId).length
    ? " gift-card--sponsor-covered"
    : " gift-card--sponsor-open";
}

function loadEstimatedSponsorsToggle(festivalId) {
  try {
    return localStorage.getItem(estimatedSponsorsStorageKey(festivalId)) === "1";
  } catch {
    return false;
  }
}

function persistEstimatedSponsorsToggle() {
  if (!state.festivalId) return;
  try {
    localStorage.setItem(
      estimatedSponsorsStorageKey(state.festivalId),
      state.showEstimatedSponsors ? "1" : "0",
    );
  } catch {
    /* ignore */
  }
}

function syncEstimatedSponsorsFooter() {
  const entry = currentFestivalEntry();
  const footer = document.getElementById("page-footer");
  const toggle = document.getElementById("estimated-sponsors-toggle");
  const hint = document.getElementById("estimated-sponsors-hint");
  const page = document.querySelector(".page");
  const available = !!entry?.estimatedSponsorsFile && !!state.estimatedSponsors;

  if (footer) footer.hidden = !available;
  if (toggle) {
    toggle.checked = !!state.showEstimatedSponsors;
    toggle.disabled = !available;
  }
  if (hint) hint.hidden = !state.showEstimatedSponsors;
  if (page) {
    page.classList.toggle("estimated-sponsors-on", !!state.showEstimatedSponsors);
  }
}

function setShowEstimatedSponsors(on) {
  state.showEstimatedSponsors = !!on;
  persistEstimatedSponsorsToggle();
  syncEstimatedSponsorsFooter();
  renderAll();
}

function purgeNonSelectable() {
  if (!state.data) return;
  for (const id of Object.keys(state.enabled)) {
    const gift = state.data.gifts.find((g) => g.id === id);
    if (gift && !isSelectableGift(gift)) delete state.enabled[id];
  }
}

function enforceOptionLocks() {
  purgeNonSelectable();
  if (state.data) {
    for (const gift of state.data.gifts) {
      if (gift.requiresCoreGift && !state.enabled[gift.requiresCoreGift]) {
        delete state.enabled[gift.id];
      }
    }
  }
  const { boothUnlockThreshold } = getSponsorRules();
  if (sponsorTotal() < boothUnlockThreshold) {
    for (const gift of state.data?.gifts ?? []) {
      if (gift.requiresSponsorThreshold) delete state.enabled[gift.id];
    }
  }
  for (const gift of state.data?.gifts ?? []) {
    if (gift.requiresBoothSpot) {
      const boothGift = state.data.gifts.find(
        (g) => g.requiresSponsorThreshold && state.enabled[g.id],
      );
      if (!boothGift) delete state.enabled[gift.id];
    }
  }
}

function loadEnabledFromStorage(festivalId, validIds) {
  const valid = new Set(validIds);
  try {
    const raw = localStorage.getItem(enabledStorageKey(festivalId));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const enabled = {};
    for (const id of Object.keys(parsed)) {
      if (valid.has(id) && parsed[id]) enabled[id] = true;
    }
    return enabled;
  } catch {
    return {};
  }
}

function persistExtraCash() {
  if (!state.festivalId) return;
  try {
    localStorage.setItem(
      extraCashStorageKey(state.festivalId),
      String(Math.max(0, state.extraCash || 0)),
    );
  } catch {
    /* ignore */
  }
}

function loadExtraCashFromStorage(festivalId) {
  try {
    const raw = localStorage.getItem(extraCashStorageKey(festivalId));
    if (raw == null) return 0;
    const n = Math.round(Number(raw));
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function boothGapHint() {
  const giftOnly = sumEnabled(["registry", "core"]);
  const { boothUnlockThreshold, boothTierLabel } = getSponsorRules();
  const hasBoothGift = state.data?.gifts.some(
    (g) => g.requiresSponsorThreshold && state.enabled[g.id],
  );
  if (giftOnly > 0 && giftOnly < boothUnlockThreshold && !hasBoothGift) {
    const needed = boothUnlockThreshold - sponsorTotal();
    if (needed > 0) return `Add ${fmt(needed)} more to unlock sponsor booth spot.`;
  }
  return "";
}

function setExtraCash(amount) {
  if (choicesLockedForEstimate()) return;
  const n = Math.max(0, Math.round(Number(amount) || 0));
  state.extraCash = n;
  enforceOptionLocks();
  persistExtraCash();
  renderAll();
  const varGift = variableAmountGift();
  if (varGift && state.modalGiftId === varGift.id && document.getElementById("gift-modal").open) {
    const gift = varGift;
    if (gift) {
      document.getElementById("modal-amount").textContent = giftAmountLabel(gift);
    }
    const modalInput = document.getElementById("modal-variable-amount-input");
    if (modalInput && document.activeElement !== modalInput) {
      modalInput.value = state.extraCash ? String(state.extraCash) : "";
    }
  }
}

function persistEnabled() {
  if (!state.festivalId) return;
  try {
    const compact = {};
    for (const [id, on] of Object.entries(state.enabled)) {
      if (!on) continue;
      const gift = state.data?.gifts.find((g) => g.id === id);
      if (gift && !isSelectableGift(gift)) continue;
      compact[id] = true;
    }
    localStorage.setItem(enabledStorageKey(state.festivalId), JSON.stringify(compact));
  } catch {
    /* ignore quota / private mode */
  }
}

function setGiftEnabled(id, checked) {
  if (choicesLockedForEstimate()) return;
  const gift = state.data.gifts.find((g) => g.id === id);
  if (gift && !isSelectableGift(gift)) return;
  if (gift && !isOptionUnlocked(gift) && checked) return;
  if (checked) state.enabled[id] = true;
  else delete state.enabled[id];
  enforceOptionLocks();
  persistEnabled();
  renderAll();
}

function clearSelections() {
  if (choicesLockedForEstimate()) return;
  state.enabled = {};
  state.extraCash = 0;
  persistEnabled();
  persistExtraCash();
  renderAll();
}

function giftAmountLabel(gift) {
  if (isVariableAmountGift(gift)) {
    return state.extraCash > 0 ? fmt(state.extraCash) : "Variable";
  }
  if (gift.requiresSponsorThreshold) {
    const { boothUnlockThreshold, boothTierLabel } = getSponsorRules();
    const suffix = gift.amount > 0 ? ` · ${fmt(gift.amount)}` : "";
    return `${boothTierLabel} · ${fmt(boothUnlockThreshold)}+${suffix}`;
  }
  if (gift.amount === 0) return "Included";
  return fmt(gift.amount);
}

function selectedGifts() {
  if (!state.data) return [];
  return state.data.gifts.filter((g) => state.enabled[g.id] && isSelectableGift(g));
}

function renderCartBadge() {
  const n = selectedGifts().length + (state.extraCash > 0 ? 1 : 0);
  const badge = document.getElementById("cart-count");
  badge.textContent = String(n);
  badge.hidden = n === 0;
}

function renderCartModal() {
  const selected = selectedGifts();
  document.getElementById("cart-total").textContent = fmt(cartTotal());
  document.getElementById("cart-clear").disabled = selected.length === 0 && !state.extraCash;

  const listEl = document.getElementById("cart-selection-list");
  const extraGift = variableAmountGift();
  if (!selected.length && !state.extraCash) {
    listEl.innerHTML =
      `<p class="hint">No features selected yet. Toggle cards to build your sponsorship package.</p>`;
  } else {
    const rows = selected
      .map(
        (g) =>
          `<li><span>${giftLabel(g)}</span><span>${giftAmountLabel(g)}</span></li>`,
      )
      .join("");
    const extraRow =
      state.extraCash > 0 && extraGift
        ? `<li><span>${giftLabel(extraGift)}</span><span>${fmt(state.extraCash)}</span></li>`
        : "";
    listEl.innerHTML = `<ul class="cart-list">${rows}${extraRow}</ul>`;
  }

  const withBenefits = selected.filter((g) => giftBenefits(g).length);
  const global = globalPerkLines();
  const perksEl = document.getElementById("cart-perks");

  if (!global.length && !withBenefits.length) {
    perksEl.innerHTML = `<p class="hint">Select features to see sponsor perks.</p>`;
    return;
  }

  const tier = currentSponsorTier();
  const globalHtml = global.length
    ? `<div class="cart-global-perks">
        <h4>Global perks</h4>
        <p class="cart-tier-note">Recognition tier for your build: <strong>${tier.label}</strong> (${fmt(sponsorTotal())})</p>
        <ul>${global.map((p) => `<li><span class="cart-global-perk-label">${p.label}</span> — ${p.text}</li>`).join("")}</ul>
      </div>`
    : "";

  const giftHtml = withBenefits.length
    ? `<div class="cart-perk-groups">
        ${withBenefits.length && global.length ? "<h4 class=\"cart-perk-groups-title\">Feature perks</h4>" : ""}
        ${withBenefits
          .map(
            (g) => `
        <div class="cart-perk-group">
          <h4>${giftLabel(g)}</h4>
          <ul>${giftBenefits(g)
            .map((b) => `<li>${b}</li>`)
            .join("")}</ul>
        </div>`,
          )
          .join("")}
      </div>`
    : "";

  perksEl.innerHTML = globalHtml + giftHtml;
}

function openCartModal() {
  renderCartModal();
  setCartTab("selection");
  document.getElementById("cart-modal").showModal();
}

function setCartTab(tab) {
  state.cartTab = tab;
  document.querySelectorAll(".cart-tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.cartTab === tab);
  });
  document.getElementById("cart-selection").classList.toggle("hidden", tab !== "selection");
  document.getElementById("cart-perks").classList.toggle("hidden", tab !== "perks");
}

function renderMeta() {
  const e = state.data.event;
  const attendance = e.attendance != null ? `~${e.attendance.toLocaleString()} attendees` : null;
  const summaryEl = document.getElementById("event-summary");

  if (summaryEl) {
    summaryEl.textContent = [e.venue, e.dates, attendance].filter(Boolean).join(" · ");
  }
  document.title = `Fund the Festival — ${e.name}`;
}

function renderSectionHints() {
  const entry = currentFestivalEntry();
  const sections = entry?.sections ?? {};
  const { boothUnlockThreshold, boothTierLabel } = getSponsorRules();
  const replaceTokens = (text) =>
    (text ?? "")
      .replace(/\{boothTierLabel\}/g, boothTierLabel)
      .replace(/\{boothThreshold\}/g, fmt(boothUnlockThreshold));

  const coreEl = document.getElementById("core-desc");
  const registryEl = document.getElementById("registry-desc");
  const optionsEl = document.getElementById("options-desc");
  if (coreEl) coreEl.textContent = replaceTokens(sections.core) || "";
  if (registryEl) registryEl.textContent = replaceTokens(sections.registry) || "";
  if (optionsEl) optionsEl.textContent = replaceTokens(sections.options) || "";
}

function cashOffsetLabel() {
  return currentFestivalEntry()?.cashOffsetLabel ?? "Cash ops";
}

function coreFundingState() {
  if (!state.data?.scenario) return null;
  const mvpCap = state.data.scenario.mvpCap;
  if (!mvpCap) return null;

  const rawCash = state.data.scenario.vendorRevenue ?? 0;
  const cashOffset = Math.min(mvpCap, rawCash);
  const sponsorGap = Math.max(0, mvpCap - cashOffset);
  const estimatedCore = sumEstimatedAssigned(["core"]);
  const sponsorFill =
    estimatedCore !== null
      ? Math.min(estimatedCore, sponsorGap)
      : Math.min(sumEnabled(["core"]) + (state.extraCash || 0), sponsorGap);
  const remainingGap = Math.max(0, sponsorGap - sponsorFill);
  const fundedTotal = cashOffset + sponsorFill;

  return {
    mvpCap,
    cashOffset,
    sponsorGap,
    sponsorFill,
    remainingGap,
    fundedTotal,
    cashPct: (cashOffset / mvpCap) * 100,
    sponsorPct: (sponsorFill / mvpCap) * 100,
    fundedPct: (fundedTotal / mvpCap) * 100,
    cashOpsOnly: sponsorGap === 0,
  };
}

function estimatedRevenueData() {
  const er = state.data?.scenario?.estimatedRevenue;
  if (er?.lines?.length) return er;
  const total = state.data?.scenario?.vendorRevenue ?? 0;
  return {
    total,
    summary: state.data?.scenario?.label ?? "",
    lines: [{ label: cashOffsetLabel(), amount: total }],
  };
}

function renderRevenueModal() {
  const er = estimatedRevenueData();
  const body = document.getElementById("revenue-modal-body");
  if (!body) return;

  const rows = er.lines
    .map(
      (line) => `
    <tr>
      <td>${line.label}${line.note ? `<span class="revenue-modal-note">${line.note}</span>` : ""}</td>
      <td>${fmt(line.amount)}</td>
    </tr>`,
    )
    .join("");

  body.innerHTML = `
    ${er.summary ? `<p class="revenue-modal-summary">${er.summary}</p>` : ""}
    <table>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <th>Total estimated revenue</th>
          <td>${fmt(er.total ?? er.lines.reduce((s, l) => s + l.amount, 0))}</td>
        </tr>
      </tfoot>
    </table>
  `;
}

function openRevenueModal() {
  renderRevenueModal();
  document.getElementById("revenue-modal")?.showModal();
}

function renderCoreProgress() {
  const core = coreFundingState();
  const labelEl = document.getElementById("core-label");
  const targetEl = document.getElementById("core-target-label");
  const barEl = document.getElementById("core-progress-bar");
  const fundedEl = document.getElementById("core-funded-value");
  const sponsoredEl = document.getElementById("core-sponsored-value");
  const neededEl = document.getElementById("core-needed-value");
  if (!core || !labelEl || !targetEl || !barEl || !fundedEl || !sponsoredEl || !neededEl) return;

  const pct = Math.min(100, Math.round(core.fundedPct));

  labelEl.textContent = `Est. revenue ${fmt(core.cashOffset)}`;
  targetEl.textContent = `Target ${fmt(core.mvpCap)}`;

  barEl.setAttribute("aria-valuenow", String(pct));
  barEl.setAttribute("aria-valuemin", "0");
  barEl.setAttribute("aria-valuemax", "100");
  barEl.innerHTML = `
    <div class="progress-seg funded" style="width:${core.fundedPct}%" title="Core funded"></div>
  `;

  fundedEl.textContent = fmt(core.fundedTotal);
  sponsoredEl.textContent = fmt(core.sponsorFill);
  neededEl.textContent = core.remainingGap === 0 ? "✓" : fmt(core.remainingGap);
  neededEl.classList.toggle("progress-metric-value--closed", core.remainingGap === 0);
}

function renderProgress() {
  const s = state.data.scenario;
  const core = coreFundingState();
  const registryFunded = registryFundedAmount();
  const target = state.data.event.registryFull;
  const fundedBlue = core.cashOffset + core.sponsorFill + registryFunded;
  const toFullVision = Math.max(0, target - fundedBlue);

  document.getElementById("vision-label").textContent = `Core ops ${fmt(s.mvpCap)}`;
  document.getElementById("target-label").textContent = `Target ${fmt(target)}`;

  const coreGap = core.remainingGap;
  const visionGap = Math.max(0, target - s.mvpCap - registryFunded);
  const fundedPct = (fundedBlue / target) * 100;
  const coreGapPct = (coreGap / target) * 100;
  const visionGapPct = (visionGap / target) * 100;

  document.getElementById("progress-bar").innerHTML = `
    <div class="progress-seg funded" style="width:${fundedPct}%" title="Funded"></div>
    <div class="progress-seg core-unfunded" style="width:${coreGapPct}%" title="Unfunded core ops"></div>
    <div class="progress-seg vision-unfunded" style="width:${visionGapPct}%" title="Unfunded full vision"></div>
  `;

  document.getElementById("vision-total-value").textContent = fmt(core.fundedTotal + registryFunded);
  document.getElementById("registry-funded-value").textContent = fmt(registryFunded);
  document.getElementById("to-vision-value").textContent = fmt(toFullVision);
}

function giftLabel(gift) {
  return gift.emoji ? `${gift.emoji} ${gift.name}` : gift.name;
}

function variableAmountCardHtml(gift) {
  const on = state.extraCash > 0;
  const gapHint = boothGapHint();
  return `
    <article class="gift-card gift-card--variable${on ? " enabled" : ""}${estimatedSponsorCardClass(gift.id)}" data-id="${gift.id}" tabindex="0">
      <div class="gift-card-head">
        <div>
          <h3>${gift.name}</h3>
          <div class="gift-amount">${giftAmountLabel(gift)}</div>
        </div>
        <div class="gift-card-variable" onclick="event.stopPropagation()">
          <label class="gift-variable-label" for="variable-amount-${gift.id}">$</label>
          <input
            type="number"
            id="variable-amount-${gift.id}"
            class="gift-variable-input"
            data-variable-amount
            min="0"
            step="1"
            placeholder="0"
            value="${state.extraCash ? state.extraCash : ""}"
            inputmode="numeric"
            aria-label="Additional amount"
          />
        </div>
      </div>
      ${gift.tagline ? `<p class="gift-tagline">${gift.tagline}</p>` : ""}
      ${gapHint ? `<p class="gift-gap-hint">${gapHint}</p>` : ""}
      ${estimatedSponsorTagsHtml(gift.id)}
    </article>
  `;
}

function giftCardHtml(gift) {
  if (isVariableAmountGift(gift)) return variableAmountCardHtml(gift);
  const selectable = isSelectableGift(gift);
  const on = selectable && !!state.enabled[gift.id];
  const unlocked = isOptionUnlocked(gift);
  const lockChoices = choicesLockedForEstimate();
  return `
    <article class="gift-card${on ? " enabled" : ""}${selectable && !unlocked ? " locked" : ""}${selectable ? "" : " gift-card--readonly"}${estimatedSponsorCardClass(gift.id)}" data-id="${gift.id}" tabindex="0">
      <div class="gift-card-head">
        <div>
          <h3>${gift.emoji ? `<span class="gift-emoji">${gift.emoji}</span>` : ""}${gift.name}</h3>
          <div class="gift-amount">${giftAmountLabel(gift)}</div>
        </div>
        ${
          selectable
            ? `<label class="toggle-wrap${unlocked && !lockChoices ? "" : " toggle-wrap--disabled"}" onclick="event.stopPropagation()">
          <input type="checkbox" data-toggle="${gift.id}"${on ? " checked" : ""}${unlocked && !lockChoices ? "" : " disabled"} aria-label="Fund ${gift.name}" />
        </label>`
            : ""
        }
      </div>
      ${gift.tagline ? `<p class="gift-tagline">${gift.tagline}</p>` : ""}
      ${estimatedSponsorTagsHtml(gift.id)}
    </article>
  `;
}

function bindGiftGrid(containerId, category) {
  const gifts = giftsInCategory(state.data.gifts, category);
  const el = document.getElementById(containerId);
  const activeVar = document.activeElement?.matches?.("[data-variable-amount]")
    ? document.activeElement
    : null;
  const selStart = activeVar?.selectionStart ?? null;
  const selEnd = activeVar?.selectionEnd ?? null;

  el.innerHTML = gifts.map(giftCardHtml).join("");

  el.querySelectorAll("[data-variable-amount]").forEach((input) => {
    input.oninput = () => setExtraCash(input.value);
    input.onclick = (e) => e.stopPropagation();
  });

  if (activeVar) {
    const next = el.querySelector("[data-variable-amount]");
    if (next) {
      next.focus();
      if (selStart != null && selEnd != null) {
        try {
          next.setSelectionRange(selStart, selEnd);
        } catch {
          /* ignore */
        }
      }
    }
  }

  el.querySelectorAll(".gift-card").forEach((card) => {
    const id = card.dataset.id;
    const open = () => openModal(id);
    card.onclick = (e) => {
      if (e.target.closest("[data-toggle]")) return;
      open();
    };
    card.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    };
  });

  el.querySelectorAll("[data-toggle]").forEach((input) => {
    input.onchange = () => setGiftEnabled(input.dataset.toggle, input.checked);
  });

  if (category === "secondary") {
    const panel = document.getElementById("secondary-panel");
    if (panel) panel.hidden = gifts.length === 0;
  }
}

function renderModalContent(giftId) {
  const gift = state.data.gifts.find((g) => g.id === giftId);
  if (!gift) return;

  const unlocked = isOptionUnlocked(gift);
  const selectable = isSelectableGift(gift);
  const variable = isVariableAmountGift(gift);

  document.getElementById("modal-title").textContent = giftLabel(gift);
  document.getElementById("modal-amount").textContent = giftAmountLabel(gift);
  const toggleWrap = document.getElementById("modal-toggle-wrap");
  toggleWrap.hidden = !selectable || variable;
  const toggle = document.getElementById("modal-toggle");
  toggle.checked = !!state.enabled[giftId];
  toggle.disabled = !selectable || !unlocked || choicesLockedForEstimate();
  toggle.onchange = () => {
    if (choicesLockedForEstimate()) {
      toggle.checked = !!state.enabled[giftId];
      return;
    }
    if (!unlocked) {
      toggle.checked = false;
      return;
    }
    setGiftEnabled(giftId, toggle.checked);
    toggle.checked = !!state.enabled[giftId];
  };

  const benefits = giftBenefits(gift);
  const gapHint = variable ? boothGapHint() : "";
  document.getElementById("modal-guest").innerHTML = `
    ${
      variable
        ? `<div class="modal-variable-amount" onclick="event.stopPropagation()">
      <label for="modal-variable-amount-input">Your amount</label>
      <div class="gift-variable-input-row">
        <span class="gift-variable-prefix">$</span>
        <input
          type="number"
          id="modal-variable-amount-input"
          min="0"
          step="1"
          placeholder="0"
          value="${state.extraCash ? state.extraCash : ""}"
          inputmode="numeric"
        />
      </div>
      ${gapHint ? `<p class="gift-gap-hint">${gapHint}</p>` : ""}
    </div>`
        : ""
    }
    ${gift.tagline ? `<p class="modal-tagline">${gift.tagline}</p>` : ""}
    ${estimatedSponsorTagsHtml(gift.id)}
    ${!unlocked && !variable ? `<p class="modal-unlock-notice">${unlockNotice(gift)}</p>` : ""}
    <p class="modal-description">${formatMarkdown(gift.description)}</p>
    ${
      benefits.length
        ? `<p class="modal-benefits-label">Benefits</p><ul class="modal-benefits">${benefits.map((b) => `<li>${b}</li>`).join("")}</ul>`
        : ""
    }
  `;

  if (variable) {
    document.getElementById("modal-variable-amount-input").oninput = (e) => {
      setExtraCash(e.target.value);
    };
  }

  const rows = gift.lineItems
    .map((li) => `<tr><td>${li.label}</td><td>${li.amount ? fmt(li.amount) : "Included"}</td></tr>`)
    .join("");
  document.getElementById("modal-funds").innerHTML = `
    <table>
      <thead><tr><th>Line item</th><th>Amount</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function openModal(giftId) {
  state.modalGiftId = giftId;
  state.modalTab = "guest";
  const gift = state.data.gifts.find((g) => g.id === giftId);
  if (!gift) return;

  renderModalContent(giftId);
  setModalTab("guest");
  document.getElementById("gift-modal").showModal();
}

function setModalTab(tab) {
  state.modalTab = tab;
  document.querySelectorAll(".gift-tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.giftTab === tab);
  });
  document.getElementById("modal-guest").classList.toggle("hidden", tab !== "guest");
  document.getElementById("modal-funds").classList.toggle("hidden", tab !== "funds");
}

function renderAll() {
  enforceOptionLocks();
  renderSectionHints();
  renderCoreProgress();
  renderProgress();
  renderCartBadge();
  if (document.getElementById("cart-modal").open) {
    renderCartModal();
  }
  bindGiftGrid("core-grid", "core");
  bindGiftGrid("registry-grid", "registry");
  bindGiftGrid("options-grid", "options");
  bindGiftGrid("secondary-grid", "secondary");
  if (state.modalGiftId && document.getElementById("gift-modal").open) {
    const typingVariable = document.activeElement?.id === "modal-variable-amount-input";
    if (!typingVariable) {
      renderModalContent(state.modalGiftId);
      setModalTab(state.modalTab);
    }
  }
}

function resolveInitialFestivalId(manifest) {
  const ids = new Set(manifest.festivals.map((f) => f.id));
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("festival");
    if (fromUrl && ids.has(fromUrl)) return fromUrl;
  } catch {
    /* ignore */
  }
  try {
    const stored = localStorage.getItem(FESTIVAL_ID_KEY);
    if (stored && ids.has(stored)) return stored;
  } catch {
    /* ignore */
  }
  if (manifest.default && ids.has(manifest.default)) return manifest.default;
  return manifest.festivals[0]?.id ?? null;
}

function persistFestivalId() {
  if (!state.festivalId) return;
  try {
    localStorage.setItem(FESTIVAL_ID_KEY, state.festivalId);
  } catch {
    /* ignore */
  }
}

function syncFestivalSelect() {
  const select = document.getElementById("festival-select");
  if (!select || !state.manifest) return;
  const festivals = state.manifest.festivals ?? [];
  if (festivals.length <= 1) {
    select.hidden = true;
    select.setAttribute("aria-hidden", "true");
    return;
  }
  select.hidden = false;
  select.removeAttribute("aria-hidden");
  select.innerHTML = festivals
    .map((f) => `<option value="${f.id}">${f.label}</option>`)
    .join("");
  select.value = state.festivalId;
}

async function loadEstimatedSponsorsData(entry) {
  state.estimatedSponsors = null;
  state.estimatedSponsorMap = {};
  if (!entry?.estimatedSponsorsFile) return;

  try {
    const res = await fetch(entry.estimatedSponsorsFile, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.estimatedSponsors = await res.json();
    state.estimatedSponsorMap = computeEstimatedSponsorMap(
      state.data.gifts,
      state.estimatedSponsors,
    );
  } catch {
    state.estimatedSponsors = null;
    state.estimatedSponsorMap = {};
  }
}

async function loadFestivalData(festivalId) {
  const entry = state.manifest.festivals.find((f) => f.id === festivalId);
  if (!entry) throw new Error(`Unknown festival: ${festivalId}`);

  const res = await fetch(entry.file, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status} loading ${entry.file}`);

  state.festivalId = festivalId;
  state.data = await res.json();
  state.enabled = loadEnabledFromStorage(festivalId, state.data.gifts.map((g) => g.id));
  state.extraCash = loadExtraCashFromStorage(festivalId);
  state.modalGiftId = null;
  state.showEstimatedSponsors = loadEstimatedSponsorsToggle(festivalId);
  enforceOptionLocks();
  persistEnabled();
  persistExtraCash();
  persistFestivalId();
  await loadEstimatedSponsorsData(entry);
  if (!entry.estimatedSponsorsFile) state.showEstimatedSponsors = false;
  syncFestivalSelect();
  syncEstimatedSponsorsFooter();
  renderMeta();
  renderAll();
}

async function switchFestival(festivalId) {
  if (!state.manifest || festivalId === state.festivalId) return;
  persistEnabled();
  persistExtraCash();
  await loadFestivalData(festivalId);
}

async function init() {
  initTheme();
  document.querySelectorAll(".gift-tab").forEach((t) => {
    t.onclick = () => setModalTab(t.dataset.giftTab);
  });
  document.querySelectorAll(".cart-tab").forEach((t) => {
    t.onclick = () => setCartTab(t.dataset.cartTab);
  });
  document.getElementById("cart-btn").onclick = openCartModal;
  document.getElementById("cart-clear").onclick = clearSelections;
  document.getElementById("revenue-info-btn").onclick = openRevenueModal;
  const estimatedToggle = document.getElementById("estimated-sponsors-toggle");
  if (estimatedToggle) {
    estimatedToggle.onchange = () => setShowEstimatedSponsors(estimatedToggle.checked);
  }

  try {
    const manifestRes = await fetch("../data/festivals.json", { cache: "no-store" });
    if (!manifestRes.ok) throw new Error(`HTTP ${manifestRes.status} loading festivals.json`);
    state.manifest = await manifestRes.json();

    const festivalId = resolveInitialFestivalId(state.manifest);
    if (!festivalId) throw new Error("No festivals configured");

    syncFestivalSelect();
    const select = document.getElementById("festival-select");
    select.onchange = () => switchFestival(select.value);

    await loadFestivalData(festivalId);
  } catch (err) {
    document.querySelector(".page").innerHTML = `
      <p class="error">Could not load festival data. Run from a local server:<br>
      <code>cd "Projects - Mid-Autumn Festival/2026/Marketing/maf-site" && python3 -m http.server 8765</code><br>
      Then open http://localhost:8765/fund-the-festival/<br><br>${err.message}</p>`;
  }
}

init();
