import {
  runEngine,
  buildOfferLetter,
  publishPublicMenu,
  classifyApplicant,
  selectionArchetypeId,
  SCORE_HELP,
  needsCoverageRows,
  buildSelectionContext,
  applicantInstagramMeta,
  instagramProfileUrl,
  formatFollowerCount,
  mergeNeedWeights,
  scoreImprovementTasks,
  formatScorePoints,
  formatWeightedGain,
  publishRosterCoverage,
} from "./engine.js";
import { mountMenuViewer } from "../menu-viewer.js";

const ASSETS = "../../../assets/shared/food-curation";

let state = {
  config: null,
  needProfile: null,
  applicants: [],
  result: null,
  offers: {},
  menuPreviewMode: "engine",
  activeCapabilityApplicantId: null,
  applicantsShowAcceptedOnly: false,
  applicantsSort: { column: "lane", direction: "asc" },
  applicantsCompareIds: [],
};

const APPLICANTS_COMPARE_MAX = 3;

let menuViewer = null;
let attendanceDebounceTimer = null;
const ATTENDANCE_DEBOUNCE_MS = 300;

const VALID_TABS = new Set([
  "scenario",
  "applicants",
  "needs-coverage",
  "menu-preview",
]);

const VALID_SORT_COLUMNS = new Set(["lane", "vendor", "ig", "score"]);

function parseRoute() {
  const raw = location.hash.replace(/^#\/?/, "").trim();
  const [tabPart, sub] = raw.split("/").filter(Boolean);
  let normalizedTab = tabPart === "capacity" ? "scenario" : tabPart === "offers" ? "applicants" : tabPart;
  if (normalizedTab === "gaps") normalizedTab = "needs-coverage";
  if (normalizedTab === "backtest") normalizedTab = "scenario";
  if (normalizedTab === "publish") normalizedTab = "menu-preview";
  const tab = VALID_TABS.has(normalizedTab) ? normalizedTab : "scenario";
  let menuMode = null;
  if (tab === "menu-preview") {
    if (sub === "actual") menuMode = "actual_2026";
    else if (sub === "engine") menuMode = "engine";
  }
  return { tab, menuMode };
}

function routeHash(tab) {
  if (tab === "menu-preview" && state.menuPreviewMode === "actual_2026") {
    return `#/${tab}/actual`;
  }
  return `#/${tab}`;
}

function setRoute(tab, { replace = false } = {}) {
  const hash = routeHash(tab);
  const url = `${location.pathname}${applicantsSortQueryString()}${hash}`;
  if (`${location.pathname}${location.search}${location.hash}` === url) return;
  const fn = replace ? history.replaceState : history.pushState;
  fn.call(history, { tab }, "", url);
}

function parseApplicantsSortFromUrl() {
  const params = new URLSearchParams(location.search);
  const column = params.get("sort");
  if (!column || !VALID_SORT_COLUMNS.has(column)) return;
  const rawDir = params.get("dir");
  const direction = rawDir === "asc" || rawDir === "desc"
    ? rawDir
    : (APPLICANTS_SORT_DEFAULTS[column] || "asc");
  state.applicantsSort = { column, direction };
}

function applicantsSortQueryString() {
  const { column, direction } = state.applicantsSort;
  if (column === "lane" && direction === "asc") return "";
  const params = new URLSearchParams();
  params.set("sort", column);
  params.set("dir", direction);
  return `?${params.toString()}`;
}

function syncApplicantsSortToUrl({ replace = true } = {}) {
  const url = `${location.pathname}${applicantsSortQueryString()}${location.hash}`;
  if (`${location.pathname}${location.search}${location.hash}` === url) return;
  const fn = replace ? history.replaceState : history.pushState;
  fn.call(history, { ...history.state, applicantsSort: state.applicantsSort }, "", url);
}

function activateTab(tab) {
  document.querySelectorAll(".tab").forEach((b) => {
    b.classList.toggle("active", b.dataset.tab === tab);
  });
  document.querySelectorAll(".panel").forEach((p) => {
    p.classList.toggle("active", p.id === `panel-${tab}`);
  });
}

function syncFromRoute() {
  const { tab, menuMode } = parseRoute();
  parseApplicantsSortFromUrl();
  if (menuMode) state.menuPreviewMode = menuMode;
  activateTab(tab);
  if (tab === "applicants" && state.result) {
    renderApplicants();
  }
  if (tab === "menu-preview" && state.result) {
    refreshMenuPreviewView();
  }
}

function setupTabs() {
  window.addEventListener("popstate", syncFromRoute);

  document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      setRoute(tab);
      activateTab(tab);
    });
  });
}

async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function attachVendorLegacy(applicants) {
  try {
    const legacy = await loadJson(`${ASSETS}/seeds/vendor-festival-legacy.json`);
    const byId = legacy.by_id || {};
    return applicants.map((a) => {
      const entry = byId[a.id];
      if (!entry) {
        const { festival_legacy: _drop, ...rest } = a;
        return rest;
      }
      return {
        ...a,
        festival_legacy: {
          seasons: entry.seasons,
          prior_count: entry.prior_count,
          matches: entry.matches || [],
        },
      };
    });
  } catch {
    return applicants;
  }
}

async function loadPreset(name) {
  if (name === "lny-2026-backtest") {
    state.config = await loadJson(`${ASSETS}/presets/lny-2027.json`);
    state.config.festival_name = "LNY 2026 backtest";
    state.config.attendance = 6000;
    const seed = await loadJson(`${ASSETS}/seeds/lny-2026-applicants.json`);
    state.applicants = await attachVendorLegacy(seed.applicants);
  } else {
    state.config = await loadJson(`${ASSETS}/presets/${name}.json`);
    if (name === "lny-2027") {
      const seed = await loadJson(`${ASSETS}/seeds/lny-2026-applicants.json`);
      const pool = seed.applicants.map((a) => ({ ...a, manual_accepted_2026: false }));
      state.applicants = await attachVendorLegacy(pool);
    } else {
      state.applicants = [];
    }
  }
  state.needProfile = await loadJson(`${ASSETS}/regional-need-profile.json`);
  hydrateOffersFromApplicants();
  syncScenarioFormFromConfig();
}

function offerPhase(applicant) {
  const co = applicant?.conditional_offer;
  if (co?.status === "accepted") return "accepted";
  if (co?.status === "committed") return "committed";
  return "draft";
}

function hydrateOffersFromApplicants() {
  for (const a of state.applicants) {
    const co = a.conditional_offer;
    if (!co?.offered_item_ids?.length && !co?.offered_menu_items?.length) continue;
    const offeredIds = co.offered_item_ids
      || (co.offered_menu_items || []).map((i) => i.item_id).filter(Boolean);
    const committedIds = co.committed_item_ids
      || (co.committed_menu_items || []).map((i) => i.item_id).filter(Boolean);
    state.offers[a.id] = {
      offeredIds,
      committedIds: committedIds.length ? committedIds : [...offeredIds],
      letter: co.offer_letter_md || "",
      status: co.status || "draft",
    };
  }
}

function getSelectedAudience() {
  const checked = document.querySelector('input[name="audience"]:checked');
  return checked?.value || "family_general";
}

function setSelectedAudience(value) {
  const radio = document.querySelector(`input[name="audience"][value="${value}"]`);
  if (radio) radio.checked = true;
}

function getScenarioFromForm() {
  return {
    preset: document.getElementById("preset-select").value,
    attendance: Number(document.getElementById("attendance").value),
    audience: getSelectedAudience(),
  };
}

function syncScenarioFormFromConfig() {
  const attendance = state.config?.attendance ?? 6000;
  document.getElementById("attendance").value = attendance;
  document.getElementById("attendance-out").textContent = attendance;
  setSelectedAudience(state.config?.audience_preset || "family_general");
}

function run() {
  const scenario = getScenarioFromForm();
  state.config = {
    ...state.config,
    attendance: scenario.attendance,
    audience_preset: scenario.audience,
  };
  state.result = runEngine(state.config, state.applicants, state.needProfile);
  renderAll();
}

function runScenarioNow() {
  clearTimeout(attendanceDebounceTimer);
  run();
}

function scheduleScenarioUpdate() {
  clearTimeout(attendanceDebounceTimer);
  attendanceDebounceTimer = setTimeout(run, ATTENDANCE_DEBOUNCE_MS);
}

function laneFillSummary(sel) {
  const s = sel.summary;
  const lanes = [
    {
      label: "Open prep",
      assigned: s.open_prep_accepted_count ?? 0,
      cap: s.target_open_prep_slots ?? 0,
      waitlist: s.open_prep_waitlisted_count ?? 0,
    },
    {
      label: "Drinks",
      assigned: s.drinks_accepted_count ?? 0,
      cap: s.target_drink_slots ?? 0,
      waitlist: s.drinks_waitlisted_count ?? 0,
    },
    {
      label: "Snacks",
      assigned: s.snack_accepted_count ?? 0,
      cap: s.target_snack_slots ?? 0,
      waitlist: s.snack_waitlisted_count ?? 0,
    },
    {
      label: "Merchant",
      assigned: s.merchant_pool_count ?? 0,
      tff: s.merchant_tff_count ?? 0,
      isMerchant: true,
    },
  ];
  const foodLanes = lanes.filter((l) => !l.isMerchant);
  const totalAssigned = foodLanes.reduce((n, l) => n + l.assigned, 0);
  const totalCap = foodLanes.reduce((n, l) => n + l.cap, 0);
  const totalWaitlist = foodLanes.reduce((n, l) => n + l.waitlist, 0);
  const fmt = (l) => {
    if (l.isMerchant) return String(l.assigned);
    const base = `${l.assigned}/${l.cap}`;
    return l.waitlist ? `${base} · ${l.waitlist} waitlist` : base;
  };
  const statLabel = (l) => {
    if (l.isMerchant) return l.tff ? `merchant · ${l.tff} TFF` : "merchant";
    return l.label.toLowerCase();
  };
  return {
    lanes,
    line: lanes.map((l) => `${l.label} ${fmt(l)}`).join(" · "),
    totalAssigned,
    totalCap,
    totalWaitlist,
    fmt,
    statLabel,
  };
}

function buildCapacityExplainerHtml(cap, config) {
  const cfg = config || {};
  const days = cfg.festival_days ?? 2;
  const hrsDay = cfg.hours_per_day ?? 6;
  const hoursTotal = cap.hoursTotal ?? days * hrsDay;
  const att = cap.attendance ?? cfg.attendance ?? 6000;
  const foodRate = cap.foodBuyRate ?? cfg.food_buy_rate ?? 0.4;
  const itemsPer = cfg.items_per_buyer ?? 1.1;
  const drinkRate = cap.drinkBuyRate ?? 0.3;
  const snackRate = cap.snackBuyRate ?? 0.1;
  const snackBuyers = cap.snackBuyersEst ?? att * snackRate;
  const openPrepOrders = Math.round(cap.openPrepOrders ?? att * foodRate * itemsPer);
  const drinkOrders = Math.round(cap.drinkOrders ?? att * drinkRate);
  const example = cap.rows?.[0];

  return `
    <details class="capacity-explainer">
      <summary>How we calculate capacity</summary>
      <div class="capacity-explainer-body">
        <p>Slot targets come from <strong>expected demand ÷ realistic throughput</strong> — not “how many vendors applied.” Each archetype is a style of food with its own orders/hr assumption. Goal: ~75% fleet utilization at peak so lines stay manageable.</p>

        <h3>Inputs (this scenario)</h3>
        <ul>
          <li><strong>${att.toLocaleString()}</strong> attendance · <strong>${days}</strong> days × <strong>${hrsDay}</strong> hrs/day = <strong>${hoursTotal}</strong> operating hours</li>
          <li>Open prep buy rate <strong>${(foodRate * 100).toFixed(0)}%</strong> × <strong>${itemsPer}</strong> items/buyer</li>
          <li>Drink buy rate <strong>${(drinkRate * 100).toFixed(0)}%</strong> (separate lane)</li>
          <li>Snack buy rate <strong>${(snackRate * 100).toFixed(0)}%</strong> → treat archetypes with per-type caps</li>
        </ul>

        <h3>Open prep meals</h3>
        <p class="capacity-formula">${att.toLocaleString()} × ${foodRate} × ${itemsPer} ≈ <strong>${openPrepOrders.toLocaleString()} orders</strong> split across four throughput buckets (handheld, rice plates, noodles, BBQ).</p>

        <h3>Drinks</h3>
        <p class="capacity-formula">${att.toLocaleString()} × ${drinkRate} ≈ <strong>${drinkOrders.toLocaleString()} drink orders</strong> — boba and sugarcane/fruit refresher anchors with exclusivity mins.</p>

        <h3>Per-archetype slots</h3>
        <p>For each row in the table above:</p>
        <ol>
          <li><strong>Orders</strong> = lane total × archetype order share (from Food Flow Model)</li>
          <li><strong>Capacity per booth</strong> = throughput/hr × ${hoursTotal} hrs (e.g. fast handheld ~32/hr → ${32 * hoursTotal} orders/weekend per slot)</li>
          <li><strong>Slots</strong> = ceil(orders ÷ capacity per booth), respecting minimums (e.g. one boba anchor)</li>
        </ol>
        ${example ? `<p class="muted capacity-example">Example — ${esc(example.label)}: ${Math.round(example.orders).toLocaleString()} orders ÷ ${example.capPerSlot} cap/slot → <strong>${example.slots} slot${example.slots === 1 ? "" : "s"}</strong> (${(example.utilization * 100).toFixed(0)}% util).</p>` : ""}

        <h3>Snacks</h3>
        <p class="capacity-formula">~${Math.round(snackBuyers).toLocaleString()} snack buyers → demand <strong>${cap.snackSlotsDemand ?? cap.snackSlots ?? 0}</strong> slots, plan <strong>${cap.snackSlots ?? 0}</strong> when coverage-first floor applies. Treat board: one slot per archetype before duplicates; snack fee <strong>$${cap.snackPolicy?.booth_fee ?? 400}</strong>, viability <strong>${cap.snackPolicy?.viability_mult ?? 2}×</strong> fee (meals/drinks stay 3×).</p>

        <h3>Fleet utilization</h3>
        <p><strong>${(cap.fleetUtilization * 100).toFixed(0)}%</strong> = total expected orders ÷ total booth capacity across open prep + drinks. Target band ~65–80% at planning attendance; adjust shares or throughput in the Food Flow Model workbook if field data diverges.</p>

        <p class="muted">Archetypes = bottleneck throughput buckets, not cuisines. Selection fills slots within each bucket separately. See Food Flow Model for share/thr assumptions.</p>
      </div>
    </details>`;
}

function renderCapacity() {
  const cap = state.result?.capacity;
  const el = document.getElementById("scenario-capacity");
  if (!el) return;
  if (!cap) {
    el.innerHTML = "<p class='muted'>Capacity updates as you adjust scenario inputs.</p>";
    return;
  }
  const warn = cap.attendanceExtrapolation ? "<p class='muted'>Attendance &gt; 20K — extrapolation warning.</p>" : "";
  el.innerHTML = `
    <h2 class="scenario-capacity-heading">Capacity</h2>
    ${warn}
    <div class="stat-row">
      <div class="stat"><strong>${cap.openPrepSlots ?? cap.openSlots}</strong> open prep</div>
      <div class="stat"><strong>${cap.drinkSlots ?? cap.prepackSlots}</strong> drinks</div>
      <div class="stat"><strong>${cap.snackSlots ?? 0}</strong> snacks</div>
      <div class="stat"><strong>${cap.mealSlots ?? cap.foodSlots}</strong> total food</div>
      <div class="stat"><strong>${(cap.fleetUtilization * 100).toFixed(0)}%</strong> util</div>
    </div>
    <table>
      <thead><tr><th>Lane</th><th>Archetype</th><th>Orders</th><th>Slots</th><th>Util</th></tr></thead>
      <tbody>${cap.rows.map((r) => `
        <tr><td>${esc(r.lane || "—")}</td><td>${esc(r.label)}</td><td>${Math.round(r.orders ?? r.buyers_est ?? 0)}</td><td>${r.slots}</td><td>${r.lane === "snacks" ? "—" : `${((r.utilization ?? 0) * 100).toFixed(0)}%`}</td></tr>
      `).join("")}</tbody>
    </table>
    ${buildCapacityExplainerHtml(cap, state.config)}`;
}

function vendorClassDisplay(vc) {
  const labels = {
    open_prep: "Open prep",
    drinks: "Drinks",
    snack: "Snack",
    merchant: "Merchant",
    take_home: "Merchant (TFF food)",
    meal: "Open prep",
    food: "Open prep",
  };
  const norm = vc === "food" || vc === "meal" ? "open_prep" : vc === "take_home" ? "merchant" : vc;
  return labels[norm] || labels[vc] || norm || "Open prep";
}

function setupDisplay(setup) {
  const labels = {
    open_food_canopy: "Canopy + equipment",
    open_food_truck: "Truck",
    open_food_trailer: "Trailer",
    prepack_booth: "Canopy-only",
    open_cooking: "Canopy + equipment",
    food_truck: "Truck",
    food_trailer: "Trailer",
    prepack: "Canopy-only",
  };
  return labels[setup] || setup || "—";
}

function renderVendorTypeCell(row) {
  const cls = vendorClassDisplay(row.vendor_class || row.vendor_role || "meal");
  const setup = setupDisplay(row.setup_type || row.booth_kind);
  const arch = selectionArchetypeId(row) || "—";
  return `<div class="vendor-type-cell">
    <span class="vendor-type-line vendor-type-class">${esc(cls)}</span>
    <span class="vendor-type-line vendor-type-setup">${esc(setup)}</span>
    <span class="vendor-type-line vendor-type-archetype">${esc(arch)}</span>
  </div>`;
}

const CLASS_SORT_ORDER = ["open_prep", "drinks", "snack", "meal", "food", "merchant", "take_home"];
const SETUP_SORT_ORDER = [
  "open_food_truck", "open_food_trailer", "open_food_canopy", "prepack_booth",
  "food_truck", "food_trailer", "open_cooking", "prepack",
];

function normVendorClass(a) {
  const vc = a.vendor_class || a.vendor_role || "open_prep";
  if (vc === "meal" || vc === "food") return "open_prep";
  if (vc === "take_home") return "merchant";
  return vc;
}

function normSetupKey(a) {
  return a.setup_type || a.booth_kind || "";
}

function sortApplicantsByLane(rows) {
  const classRank = (c) => {
    const i = CLASS_SORT_ORDER.indexOf(c);
    return i >= 0 ? i : CLASS_SORT_ORDER.length;
  };
  const setupRank = (s) => {
    const i = SETUP_SORT_ORDER.indexOf(s);
    return i >= 0 ? i : SETUP_SORT_ORDER.length;
  };
  return [...rows].sort((a, b) => {
    const ca = normVendorClass(a);
    const cb = normVendorClass(b);
    if (ca !== cb) return classRank(ca) - classRank(cb);
    const sa = normSetupKey(a);
    const sb = normSetupKey(b);
    const setupCmp = setupRank(sa) - setupRank(sb);
    if (setupCmp !== 0) return setupCmp;
    if (sa !== sb) return sa.localeCompare(sb);
    const aa = selectionArchetypeId(a) || "";
    const ab = selectionArchetypeId(b) || "";
    if (aa !== ab) return aa.localeCompare(ab);
    return (a.business_name || "").localeCompare(b.business_name || "", undefined, { sensitivity: "base" });
  });
}

const APPLICANTS_SORT_DEFAULTS = { lane: "asc", vendor: "asc", ig: "desc", score: "desc" };

function compareApplicantsForSort(a, b) {
  const { column, direction } = state.applicantsSort;
  const dir = direction === "asc" ? 1 : -1;
  const nameCmp = () => (a.business_name || "").localeCompare(b.business_name || "", undefined, { sensitivity: "base" });

  if (column === "vendor") {
    return nameCmp() * dir;
  }
  if (column === "ig") {
    const fa = applicantInstagramMeta(mergeApplicantRecord(a)).followers || 0;
    const fb = applicantInstagramMeta(mergeApplicantRecord(b)).followers || 0;
    if (fa !== fb) return (fa - fb) * dir;
    return nameCmp();
  }
  if (column === "score") {
    const scoreKey = (row) => (isScoredMealVendor(mergeApplicantRecord(row)) ? row.score?.total : null);
    const sa = scoreKey(a);
    const sb = scoreKey(b);
    if (sa == null && sb == null) return nameCmp();
    if (sa == null) return 1;
    if (sb == null) return -1;
    if (sa !== sb) return (sa - sb) * dir;
    return nameCmp();
  }
  return 0;
}

function sortApplicants(rows) {
  if (state.applicantsSort.column === "lane") {
    return sortApplicantsByLane(rows);
  }
  return [...rows].sort(compareApplicantsForSort);
}

function sortIndicator(column) {
  if (state.applicantsSort.column !== column) {
    return '<span class="sort-indicator sort-inactive" aria-hidden="true">↕</span>';
  }
  const arrow = state.applicantsSort.direction === "asc" ? "↑" : "↓";
  return `<span class="sort-indicator sort-active" aria-hidden="true">${arrow}</span>`;
}

function sortableTh(column, label, { title = "" } = {}) {
  const ariaSort = state.applicantsSort.column === column
    ? (state.applicantsSort.direction === "asc" ? "ascending" : "descending")
    : "none";
  const titleAttr = title ? ` title="${esc(title)}"` : "";
  return `<th><button type="button" class="sortable-th" data-sort-column="${column}" aria-sort="${ariaSort}"${titleAttr}>${esc(label)}${sortIndicator(column)}</button></th>`;
}

function scoreTh() {
  const column = "score";
  const ariaSort = state.applicantsSort.column === column
    ? (state.applicantsSort.direction === "asc" ? "ascending" : "descending")
    : "none";
  return `<th class="score-th"><span class="th-label"><button type="button" class="sortable-th" data-sort-column="${column}" aria-sort="${ariaSort}" title="Sort by total score">Score${sortIndicator(column)}</button><button type="button" id="score-help-btn" class="info-btn" title="How score is calculated" aria-label="How score is calculated">i</button></span></th>`;
}

function toggleApplicantsSort(column) {
  if (column === "lane") {
    state.applicantsSort = { column: "lane", direction: "asc" };
  } else if (state.applicantsSort.column === column) {
    state.applicantsSort.direction = state.applicantsSort.direction === "asc" ? "desc" : "asc";
  } else {
    state.applicantsSort = {
      column,
      direction: APPLICANTS_SORT_DEFAULTS[column] || "asc",
    };
  }
  syncApplicantsSortToUrl();
  renderApplicants();
}

function actionDisplay(a) {
  const reason = a.action_reason;
  if (!reason || reason === "menu_fit_rank") return a.recommended_action || "—";
  return `${a.recommended_action} · ${reason.replace(/_/g, " ")}`;
}

function mergeApplicantRecord(a) {
  const base = state.applicants.find((v) => v.id === a.id) || {};
  return { ...base, ...a };
}

function renderInstagramCell(a) {
  const { handle, followers } = applicantInstagramMeta(a);
  const url = instagramProfileUrl(handle);
  if (!url) return "<span class='muted'>—</span>";
  const label = followers > 0
    ? formatFollowerCount(followers)
    : (handle.startsWith("@") ? handle : `@${String(handle).replace(/^@/, "")}`);
  return `<a class="ig-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
}

function renderScoreHelpBody() {
  const parts = [
    `<p>${esc(SCORE_HELP.intro)}</p>`,
    `<p><strong>Eventeny application:</strong> ${esc(SCORE_HELP.eventenyForm)}</p>`,
    `<p><strong>Elk Grove business community:</strong> ${esc(SCORE_HELP.eventenyElkGrove)}</p>`,
    "<ul>",
    ...SCORE_HELP.components.map(
      (c) =>
        `<li><strong>${esc(c.label)}</strong> <span class="component-weight">(${(c.weight * 100).toFixed(0)}%)</span><br>${esc(c.detail)}</li>`,
    ),
    "</ul>",
    `<p><strong>Tiebreaker:</strong> ${esc(SCORE_HELP.tiebreaker)}</p>`,
    `<p><strong>Diversity & attendee needs:</strong> ${esc(SCORE_HELP.needCoverage)}</p>`,
    `<p class="muted">${esc(SCORE_HELP.snackNote)} Weights in <code>regional-need-profile.json</code> (dietary + family-fair experience needs). Tags are vendor best-guess + staff review + engine inference.</p>`,
  ];
  return parts.join("");
}

function isSnackVendorRow(row) {
  const vc = row.vendor_class || row.vendor_role;
  return vc === "snack";
}

function isScoredMealVendor(row) {
  if (row.recommended_action === "merchant") return false;
  return row.score?.total != null;
}

function scoreDetailRows(row) {
  const score = row.score || {};
  const components = score.components || {};
  const weights = score.weights || {};

  return SCORE_HELP.components.map((meta) => {
    const raw = components[meta.id] ?? 0;
    const weight = weights[meta.id] ?? meta.weight;
    return {
      id: meta.id,
      label: meta.label,
      detail: meta.detail,
      raw,
      weight,
      contrib: raw * weight,
    };
  });
}

function renderRecommendedMenuNote(row) {
  const rec = row.recommended_menu_items || [];
  if (!rec.length) return "";
  const sigs = row.signature_menu_items || [];
  const recNames = rec.map((i) => i.name).join("; ");
  const sameIds = rec.length === sigs.length
    && rec.every((item, idx) => item.item_id === sigs[idx]?.item_id);
  let html = `<p class="score-recommended-menu"><strong>Scoring menu</strong> (engine pick from capability): ${esc(recNames)}</p>`;
  if (!sameIds && sigs.length) {
    html += `<p class="muted score-signatures-compare">Vendor signatures: ${esc(sigs.map((i) => i.name).join("; "))}</p>`;
  }
  return html;
}

function getImprovementTasksForRow(row) {
  if (row.recommended_action === "merchant") return null;
  const needWeights = mergeNeedWeights({
    ...state.needProfile,
    audience_preset: state.config?.audience_preset,
  });
  const selectionContext = buildSelectionContext(state.config, state.needProfile);
  return scoreImprovementTasks(row, needWeights, {
    selectionContext,
    score: row.score,
  });
}

function getLiveRosterCoverage() {
  if (!state.result?.selection || !state.needProfile) return null;
  const roster = buildEngineMenuRoster();
  return publishRosterCoverage(roster, {
    ...state.needProfile,
    audience_preset: state.config?.audience_preset,
  }, { itemsSource: "offer_or_signature" });
}

function renderScoreImprovePanel(row, tasks = null) {
  if (row.recommended_action === "merchant") {
    return `<p class="muted">Merchant / take-home vendors are not scored on the meal roster.</p>`;
  }
  const list = tasks ?? getImprovementTasksForRow(row) ?? [];
  const coverage = getLiveRosterCoverage();
  const marketNote = coverage?.computed_at
    ? `<p class="improvement-market-note muted">Market-sensitive tasks reflect roster scarcity as of ${esc(new Date(coverage.computed_at).toLocaleString())}. Live needs status updates on the festival food page when vendors commit menus.</p>`
    : "";
  if (!list.length) {
    return `${marketNote}<p class="muted">No major actionable gaps for this vendor. Deposit timing may still affect tie-break order.</p>`;
  }
  const items = list.map((t) => `
    <li class="improvement-task improvement-priority-${esc(t.priority)}${t.task_type === "market" ? " improvement-market" : ""}">
      <div class="improvement-task-head">
        <strong>${esc(t.title)}</strong>
        <span class="improvement-component">${esc(t.component.replace(/_/g, " "))}</span>
        ${t.task_type === "market" ? '<span class="improvement-type">Market</span>' : ""}
        ${t.estimated_gain != null ? `<span class="improvement-gain muted">${esc(formatWeightedGain(t.estimated_gain))}</span>` : ""}
      </div>
      <p>${esc(t.detail)}</p>
      ${t.eventeny_hint ? `<p class="improvement-eventeny muted">${esc(t.eventeny_hint)}</p>` : ""}
    </li>`).join("");
  return `${marketNote}<ul class="improvement-task-list">${items}</ul>`;
}

function renderScoreBreakdownPanel(row) {
  const score = row.score || {};
  const total = score.total ?? 0;
  const rows = scoreDetailRows(row);
  const contribSum = rows.reduce((s, r) => s + r.contrib, 0);
  const action = actionDisplay(row);
  const archetype = selectionArchetypeId(row) || "—";

  const tableRows = rows.map((r) => `
    <tr>
      <td>
        <details class="score-component-details">
          <summary class="score-component-summary"><strong>${esc(r.label)}</strong></summary>
          <p class="component-detail">${esc(r.detail)}</p>
        </details>
      </td>
      <td class="num">${formatScorePoints(r.raw)}</td>
      <td class="num">${(r.weight * 100).toFixed(0)}%</td>
      <td class="num score-contrib">${formatScorePoints(r.contrib)}</td>
    </tr>`).join("");

  return `
    <p class="score-detail-meta muted">${esc(vendorClassDisplay(row.vendor_class || row.vendor_role))} · ${esc(setupDisplay(row.setup_type || row.booth_kind))} · <code>${esc(archetype)}</code></p>
    ${isSnackVendorRow(row) ? `<p class="muted score-snack-note">${esc(SCORE_HELP.snackNote)}</p>` : ""}
    ${renderRecommendedMenuNote(row)}
    <p class="score-detail-total">Total score: <strong>${formatScorePoints(total)}</strong> <span class="muted">/ 10,000</span></p>
    <table class="score-breakdown-table">
      <thead>
        <tr>
          <th>Component</th>
          <th class="num">Raw pts</th>
          <th class="num">Weight</th>
          <th class="num">Pts</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
      <tfoot>
        <tr>
          <td colspan="3">Sum of weighted components</td>
          <td class="num"><strong>${formatScorePoints(contribSum)}</strong></td>
        </tr>
      </tfoot>
    </table>
    <p class="score-detail-action"><strong>Engine action:</strong> ${esc(action)}</p>
    ${row.action_reason && row.action_reason !== "menu_fit_rank" ? `<p class="muted score-detail-reason">Reason: ${esc(row.action_reason.replace(/_/g, " "))}</p>` : ""}`;
}

function renderScoreDetailModalContent(row, activeTab = "breakdown") {
  const tasks = getImprovementTasksForRow(row);
  const taskCount = tasks?.length ?? 0;
  const improveBadge = taskCount
    ? `<span class="score-tab-badge" aria-label="${taskCount} task${taskCount === 1 ? "" : "s"}">${taskCount}</span>`
    : "";
  const breakdownActive = activeTab === "breakdown";
  return `
    <nav class="score-modal-tabs" role="tablist" aria-label="Score details">
      <button type="button" role="tab" class="score-modal-tab${breakdownActive ? " active" : ""}" data-score-tab="breakdown" aria-selected="${breakdownActive}">Breakdown</button>
      <button type="button" role="tab" class="score-modal-tab${!breakdownActive ? " active" : ""}" data-score-tab="improve" aria-selected="${!breakdownActive}">Ways to improve${improveBadge}</button>
    </nav>
    <div class="score-modal-tab-panels">
      <div class="score-modal-tab-panel${breakdownActive ? " active" : ""}" role="tabpanel" data-score-panel="breakdown"${breakdownActive ? "" : " hidden"}>
        ${renderScoreBreakdownPanel(row)}
      </div>
      <div class="score-modal-tab-panel${!breakdownActive ? " active" : ""}" role="tabpanel" data-score-panel="improve"${breakdownActive ? " hidden" : ""}>
        ${renderScoreImprovePanel(row, tasks)}
      </div>
    </div>`;
}

function setScoreDetailTab(tab) {
  const modal = document.getElementById("score-detail-modal");
  if (!modal) return;
  const breakdown = tab === "breakdown";
  modal.querySelectorAll(".score-modal-tab").forEach((btn) => {
    const isActive = btn.dataset.scoreTab === tab;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  modal.querySelectorAll(".score-modal-tab-panel").forEach((panel) => {
    const isActive = panel.dataset.scorePanel === tab;
    panel.classList.toggle("active", isActive);
    panel.hidden = !isActive;
  });
}


function renderScoreCell(row) {
  if (!isScoredMealVendor(row)) {
    return "<span class=\"muted\">—</span>";
  }
  return `<button type="button" class="score-detail-btn" data-applicant-id="${esc(row.id)}" title="View score breakdown">${formatScorePoints(row.score.total)}</button>`;
}

function openScoreDetailModal(applicant, activeTab = "breakdown") {
  const modal = document.getElementById("score-detail-modal");
  const title = document.getElementById("score-detail-modal-title");
  const body = document.getElementById("score-detail-modal-body");
  if (!modal || !body) return;
  const row = mergeApplicantRecord(applicant);
  if (title) title.textContent = row.business_name || "Score breakdown";
  body.innerHTML = renderScoreDetailModalContent(row, activeTab);
  modal.showModal();
}

function setupScoreDetailModal() {
  const modal = document.getElementById("score-detail-modal");
  if (!modal) return;
  modal.addEventListener("click", (e) => {
    const tabBtn = e.target.closest(".score-modal-tab");
    if (!tabBtn?.dataset.scoreTab) return;
    e.preventDefault();
    setScoreDetailTab(tabBtn.dataset.scoreTab);
  });
}

function canCompareApplicant(row) {
  return isScoredMealVendor(row);
}

function isApplicantCompareSelected(id) {
  return state.applicantsCompareIds.includes(id);
}

function pruneApplicantCompareSelection() {
  state.applicantsCompareIds = state.applicantsCompareIds.filter((id) => applicantsById.has(id));
}

function updateApplicantsCompareBar() {
  const bar = document.getElementById("applicants-compare-bar");
  if (!bar) return;
  const n = state.applicantsCompareIds.length;
  if (n === 0) {
    bar.hidden = true;
    document.body.classList.remove("compare-bar-open");
    return;
  }
  bar.hidden = false;
  document.body.classList.add("compare-bar-open");
  const countEl = document.getElementById("applicants-compare-count");
  if (countEl) {
    countEl.textContent = `${n} selected · max ${APPLICANTS_COMPARE_MAX}`;
  }
  const compareBtn = document.getElementById("applicants-compare-btn");
  if (compareBtn) compareBtn.disabled = n < 2;
}

function updateApplicantCompareCheckboxes() {
  const panel = document.getElementById("panel-applicants");
  if (!panel) return;
  const atMax = state.applicantsCompareIds.length >= APPLICANTS_COMPARE_MAX;
  panel.querySelectorAll(".applicant-compare-cb").forEach((cb) => {
    const id = cb.dataset.applicantId;
    const selected = isApplicantCompareSelected(id);
    cb.checked = selected;
    cb.disabled = !selected && atMax;
  });
}

function toggleApplicantCompare(id, checked) {
  if (checked) {
    if (isApplicantCompareSelected(id) || state.applicantsCompareIds.length >= APPLICANTS_COMPARE_MAX) {
      updateApplicantCompareCheckboxes();
      return;
    }
    state.applicantsCompareIds.push(id);
  } else {
    state.applicantsCompareIds = state.applicantsCompareIds.filter((x) => x !== id);
  }
  updateApplicantsCompareBar();
  updateApplicantCompareCheckboxes();
}

function resetApplicantCompare() {
  state.applicantsCompareIds = [];
  updateApplicantsCompareBar();
  updateApplicantCompareCheckboxes();
}

function renderCompareCheckbox(row) {
  if (!canCompareApplicant(row)) {
    return '<td class="compare-cell"></td>';
  }
  const checked = isApplicantCompareSelected(row.id);
  const atMax = state.applicantsCompareIds.length >= APPLICANTS_COMPARE_MAX;
  const disabled = !checked && atMax;
  return `<td class="compare-cell"><input type="checkbox" class="applicant-compare-cb" data-applicant-id="${esc(row.id)}"${checked ? " checked" : ""}${disabled ? " disabled" : ""} aria-label="Select ${esc(row.business_name)} for score comparison" /></td>`;
}

function compareWeightLabel(meta, vendors) {
  const weights = vendors.map((v) => scoreDetailRows(v).find((r) => r.id === meta.id)?.weight ?? null);
  const defined = weights.filter((w) => w != null);
  if (!defined.length) return `${(meta.weight * 100).toFixed(0)}%`;
  const first = defined[0];
  if (defined.every((w) => w === first)) return `${(first * 100).toFixed(0)}%`;
  return weights.map((w) => (w != null ? `${(w * 100).toFixed(0)}%` : "—")).join(" / ");
}

function renderScoreCompareBody(vendors) {
  const letters = ["A", "B", "C"];
  const vendorLegend = vendors.map((v, i) =>
    `<span class="score-compare-vendor"><strong>${letters[i]}:</strong> ${esc(v.business_name)}</span>`,
  ).join("");
  const vendorHeaders = vendors.map((_, i) =>
    `<th class="num compare-vendor-col">${letters[i]}</th>`,
  ).join("");

  const bodyRows = SCORE_HELP.components.map((meta) => {
    const vendorCells = vendors.map((v) => {
      const detail = scoreDetailRows(v).find((r) => r.id === meta.id);
      if (!detail) return '<td class="num muted">—</td>';
      return `<td class="num">${formatScorePoints(detail.contrib)}</td>`;
    }).join("");
    return `<tr>
      <td>
        <details class="score-component-details">
          <summary class="score-component-summary"><strong>${esc(meta.label)}</strong></summary>
          <p class="component-detail">${esc(meta.detail)}</p>
        </details>
      </td>
      <td class="num">${esc(compareWeightLabel(meta, vendors))}</td>
      ${vendorCells}
    </tr>`;
  }).join("");

  const totals = vendors.map((v) => {
    const total = v.score?.total ?? scoreDetailRows(v).reduce((s, r) => s + r.contrib, 0);
    return `<td class="num"><strong>${formatScorePoints(total)}</strong></td>`;
  }).join("");

  return `
    <div class="score-compare-vendors">${vendorLegend}</div>
    <p class="muted score-compare-intro">Weighted points per component (10,000 scale) · same weights as the single-vendor score breakdown.</p>
    <table class="score-compare-table score-breakdown-table">
      <thead>
        <tr>
          <th>Component</th>
          <th class="num">Weight %</th>
          ${vendorHeaders}
        </tr>
      </thead>
      <tbody>${bodyRows}</tbody>
      <tfoot>
        <tr>
          <td><strong>Total</strong></td>
          <td></td>
          ${totals}
        </tr>
      </tfoot>
    </table>`;
}

function openCompareScoresModal() {
  if (state.applicantsCompareIds.length < 2) return;
  const modal = document.getElementById("score-compare-modal");
  const body = document.getElementById("score-compare-modal-body");
  if (!modal || !body) return;
  const vendors = state.applicantsCompareIds
    .map((id) => applicantsById.get(id))
    .filter(Boolean)
    .map(mergeApplicantRecord);
  if (vendors.length < 2) return;
  body.innerHTML = renderScoreCompareBody(vendors);
  modal.showModal();
}

function setupApplicantsCompareBar() {
  document.getElementById("applicants-compare-btn")?.addEventListener("click", () => {
    openCompareScoresModal();
  });
  document.getElementById("applicants-compare-reset")?.addEventListener("click", () => {
    resetApplicantCompare();
  });
}

let applicantsById = new Map();

function sortedCapabilityItems(applicant) {
  const cap = applicant.capability_menu_items || [];
  const sigItems = applicant.signature_menu_items || [];
  const sigIds = new Set(sigItems.map((i) => i.item_id));
  const sigOrder = new Map(sigItems.map((i, idx) => [i.item_id, idx]));
  return [...cap].sort((x, y) => {
    const xs = sigIds.has(x.item_id);
    const ys = sigIds.has(y.item_id);
    if (xs !== ys) return xs ? -1 : 1;
    if (xs && ys) return (sigOrder.get(x.item_id) ?? 0) - (sigOrder.get(y.item_id) ?? 0);
    return (x.name || "").localeCompare(y.name || "", undefined, { sensitivity: "base" });
  });
}

function getOfferedIds(applicant) {
  const saved = state.offers[applicant.id]?.offeredIds;
  if (saved) return saved;
  const rec = (applicant.recommended_menu_items || []).map((i) => i.item_id).filter(Boolean);
  if (rec.length) return rec;
  const sigs = (applicant.signature_menu_items || []).map((i) => i.item_id);
  if (sigs.length) return sigs;
  return (applicant.capability_menu_items || []).slice(0, 5).map((i) => i.item_id);
}

function getCommittedIds(applicant) {
  const saved = state.offers[applicant.id]?.committedIds;
  if (saved?.length) return saved;
  const co = applicant.conditional_offer;
  if (co?.committed_item_ids?.length) return co.committed_item_ids;
  if (co?.committed_menu_items?.length) {
    return co.committed_menu_items.map((i) => i.item_id).filter(Boolean);
  }
  return getOfferedIds(applicant);
}

function showOfferSection(applicant) {
  return applicant.recommended_action === "accept";
}

function capabilityIntroText(a) {
  const sigCount = (a.signature_menu_items || []).length;
  const recCount = (a.recommended_menu_items || []).length;
  const recNote = recCount
    ? ` Engine scoring menu: ${recCount} item${recCount === 1 ? "" : "s"}.`
    : "";
  if (!showOfferSection(a)) {
    return `Signatures (${sigCount}) are vendor highlights — listed first.${recNote} Full capability below. ${SCORE_HELP.eventenyForm}`;
  }
  const phase = offerPhase(a);
  if (phase === "accepted") {
    const n = getCommittedIds(a).length;
    return `Signatures (${sigCount}) are vendor highlights.${recNote} Vendor committed menu: ${n} item${n === 1 ? "" : "s"} on the public food page.`;
  }
  if (phase === "committed") {
    const n = getCommittedIds(a).length;
    return `Offer committed.${recNote} Check items the vendor will actually sell (${n} selected) — they may remove recommended items.`;
  }
  const offerCount = (state.offers[a.id]?.offeredIds ?? getOfferedIds(a)).length;
  return `Signatures (${sigCount}) are vendor highlights — listed first.${recNote} Check items for the festival offer (${offerCount} selected).`;
}

function updateOfferDraft(applicant, offeredIds) {
  const letter = buildOfferLetter(applicant, state.config?.festival_name || "Festival", offeredIds);
  const prev = state.offers[applicant.id]?.status || offerPhase(applicant);
  const status = prev === "committed" || prev === "accepted" ? prev : "draft";
  state.offers[applicant.id] = {
    ...state.offers[applicant.id],
    offeredIds,
    letter: letter.offer_letter_md,
    status,
    committedIds: state.offers[applicant.id]?.committedIds ?? [...offeredIds],
  };
}

function updateCommittedDraft(applicant, committedIds) {
  const prev = state.offers[applicant.id] || {};
  state.offers[applicant.id] = {
    ...prev,
    committedIds,
    status: prev.status === "accepted" ? "accepted" : "committed",
  };
}

function markOfferCommitted(applicantId) {
  const applicant = applicantsById.get(applicantId) || state.applicants.find((v) => v.id === applicantId);
  const offer = state.offers[applicantId];
  if (!applicant || !offer?.offeredIds?.length) return;
  offer.status = "committed";
  offer.committedIds = offer.committedIds?.length ? offer.committedIds : [...offer.offeredIds];
  const cap = Object.fromEntries((applicant.capability_menu_items || []).map((i) => [i.item_id, i]));
  const conditional = {
    status: "committed",
    offered_item_ids: offer.offeredIds,
    offered_menu_items: offer.offeredIds.map((iid) => cap[iid]).filter(Boolean),
    offer_letter_md: offer.letter,
  };
  applicant.conditional_offer = conditional;
  const root = state.applicants.find((v) => v.id === applicantId);
  if (root) root.conditional_offer = conditional;
  refreshCapabilityModal(applicant);
  renderMenuPreview();
}

function markVendorCommitted(applicantId) {
  const applicant = applicantsById.get(applicantId) || state.applicants.find((v) => v.id === applicantId);
  const offer = state.offers[applicantId];
  if (!applicant || !offer?.committedIds?.length) return;
  offer.status = "accepted";
  const cap = Object.fromEntries((applicant.capability_menu_items || []).map((i) => [i.item_id, i]));
  const prev = applicant.conditional_offer || {};
  const conditional = {
    ...prev,
    status: "accepted",
    committed_item_ids: offer.committedIds,
    committed_menu_items: offer.committedIds.map((iid) => cap[iid]).filter(Boolean),
  };
  applicant.conditional_offer = conditional;
  const root = state.applicants.find((v) => v.id === applicantId);
  if (root) root.conditional_offer = conditional;
  refreshCapabilityModal(applicant);
  renderMenuPreview();
}

function formatItemTags(item) {
  const tags = item.dietary_tags || [];
  if (!tags.length) return "";
  return tags.map((t) => `<span class="cap-tag">${esc(t.replace(/_/g, " "))}</span>`).join("");
}

function renderSignaturesCell(a) {
  const sigs = a.signature_menu_items || [];
  const cap = a.capability_menu_items || [];
  const sigText = sigs.map((i) => esc(i.name)).join("; ") || "—";
  const seeAll = cap.length
    ? ` <button type="button" class="link-btn see-capability-btn" data-applicant-id="${esc(a.id)}">See all (${cap.length})</button>`
    : "";
  return `${sigText}${seeAll}`;
}

function renderCapabilityModalBody(a, offeredIds, committedIds) {
  const sigIds = new Set((a.signature_menu_items || []).map((i) => i.item_id));
  const recIds = new Set((a.recommended_menu_items || []).map((i) => i.item_id));
  const offerMode = showOfferSection(a);
  const phase = offerPhase(a);
  const offeredSet = offerMode ? new Set(offeredIds) : new Set();
  const committedSet = offerMode ? new Set(committedIds) : new Set();
  const items = sortedCapabilityItems(a);
  if (!items.length) {
    return "<p class='muted'>No capability menu on file.</p>";
  }
  return `
    <p class="muted">${capabilityIntroText(a)}</p>
    <ul class="capability-list">
      ${items.map((item) => {
        const isSig = sigIds.has(item.item_id);
        const isRec = recIds.has(item.item_id);
        const isOffered = offeredSet.has(item.item_id);
        const isCommitted = committedSet.has(item.item_id);
        const classes = [
          isSig ? "cap-item-signature" : "",
          isRec ? "cap-item-recommended" : "",
          phase === "draft" && isOffered ? "cap-item-offered" : "",
          (phase === "committed" || phase === "accepted") && isCommitted ? "cap-item-committed" : "",
        ].filter(Boolean).join(" ");
        let check = "";
        if (offerMode && phase === "draft") {
          check = `<input type="checkbox" class="cap-offer-check" data-item-id="${esc(item.item_id)}"${isOffered ? " checked" : ""} />`;
        } else if (offerMode && phase === "committed") {
          check = `<input type="checkbox" class="cap-commit-check" data-item-id="${esc(item.item_id)}"${isCommitted ? " checked" : ""} />`;
        }
        const rowTag = check ? "label" : "div";
        return `
        <li class="${classes}">
          <${rowTag} class="cap-item-label">
            ${check}
            <span class="cap-item-main">
              <span class="cap-item-head">
                <strong>${esc(item.name)}</strong>
                ${isRec ? '<span class="cap-badge cap-badge-scoring">Scoring pick</span>' : ""}
                ${isSig ? '<span class="cap-badge">Signature</span>' : ""}
                ${phase !== "draft" && isOffered ? '<span class="cap-badge cap-badge-offer">Offered</span>' : ""}
                ${(phase === "committed" || phase === "accepted") && isCommitted ? '<span class="cap-badge cap-badge-committed">Committed</span>' : ""}
                ${phase === "accepted" && isOffered && !isCommitted ? '<span class="cap-badge cap-badge-removed">Removed</span>' : ""}
                ${item.price != null ? `<span class="cap-price">$${esc(item.price)}</span>` : ""}
              </span>
              ${item.category ? `<span class="muted cap-meta">${esc(item.category)}</span>` : ""}
              ${formatItemTags(item) ? `<div class="cap-tags">${formatItemTags(item)}</div>` : ""}
            </span>
          </${rowTag}>
        </li>`;
      }).join("")}
    </ul>`;
}

function renderCapabilityOfferSection(a, offeredIds) {
  if (!showOfferSection(a)) return "";
  const offer = state.offers[a.id];
  const letter = offer?.letter
    || buildOfferLetter(a, state.config?.festival_name || "Festival", offeredIds).offer_letter_md;
  const phase = offerPhase(a);
  if (phase === "draft") {
    return `
    <section class="capability-offer">
      <h3>Recommended festival menu</h3>
      <pre class="letter capability-letter">${esc(letter)}</pre>
      <button type="button" class="cap-commit-offer secondary">Commit offer to vendor</button>
    </section>`;
  }
  if (phase === "committed") {
    return `
    <section class="capability-offer">
      <h3>Offer committed</h3>
      <pre class="letter capability-letter">${esc(letter)}</pre>
      <p class="muted">Record the vendor&rsquo;s committed menu above — they may remove items from the offer.</p>
      <button type="button" class="cap-save-vendor-commit secondary">Save vendor committed menu</button>
    </section>`;
  }
  return `
    <section class="capability-offer">
      <h3>Vendor committed menu</h3>
      <p class="muted">Public food page lists only the committed items (badges above).</p>
    </section>`;
}

function refreshCapabilityModal(applicant) {
  const body = document.getElementById("capability-modal-body");
  const offerEl = document.getElementById("capability-modal-offer");
  if (!body || !offerEl || !applicant) return;
  const offeredIds = state.offers[applicant.id]?.offeredIds ?? getOfferedIds(applicant);
  const committedIds = getCommittedIds(applicant);
  body.innerHTML = renderCapabilityModalBody(applicant, offeredIds, committedIds);
  offerEl.innerHTML = renderCapabilityOfferSection(applicant, offeredIds);
}

function openCapabilityModal(applicant) {
  const modal = document.getElementById("capability-modal");
  const title = document.getElementById("capability-modal-title");
  if (!modal || !title) return;
  state.activeCapabilityApplicantId = applicant.id;
  title.textContent = applicant.business_name || "Menu capability";
  if (showOfferSection(applicant)) {
    const offeredIds = getOfferedIds(applicant);
    if (!state.offers[applicant.id]) {
      updateOfferDraft(applicant, offeredIds);
    }
  }
  refreshCapabilityModal(applicant);
  modal.showModal();
}

function setupCapabilityModalHandlers() {
  const modal = document.getElementById("capability-modal");
  if (!modal) return;
  modal.addEventListener("change", (e) => {
    const applicant = applicantsById.get(state.activeCapabilityApplicantId);
    if (!applicant) return;
    if (e.target.classList.contains("cap-offer-check")) {
      const offeredIds = [...modal.querySelectorAll(".cap-offer-check:checked")].map((cb) => cb.dataset.itemId);
      updateOfferDraft(applicant, offeredIds);
      refreshCapabilityModal(applicant);
      return;
    }
    if (e.target.classList.contains("cap-commit-check")) {
      const committedIds = [...modal.querySelectorAll(".cap-commit-check:checked")].map((cb) => cb.dataset.itemId);
      updateCommittedDraft(applicant, committedIds);
      refreshCapabilityModal(applicant);
    }
  });
  modal.addEventListener("click", (e) => {
    const commitOfferBtn = e.target.closest(".cap-commit-offer");
    if (commitOfferBtn) {
      e.preventDefault();
      markOfferCommitted(state.activeCapabilityApplicantId);
      return;
    }
    const saveVendorBtn = e.target.closest(".cap-save-vendor-commit");
    if (saveVendorBtn) {
      e.preventDefault();
      markVendorCommitted(state.activeCapabilityApplicantId);
    }
  });
  modal.addEventListener("close", () => {
    state.activeCapabilityApplicantId = null;
  });
}

function setupApplicantsPanelHandlers() {
  document.getElementById("panel-applicants").addEventListener("click", (e) => {
    if (e.target.closest("#score-help-btn")) {
      e.preventDefault();
      document.getElementById("score-help-modal")?.showModal();
      return;
    }
    const sortBtn = e.target.closest(".sortable-th");
    if (sortBtn?.dataset.sortColumn) {
      e.preventDefault();
      toggleApplicantsSort(sortBtn.dataset.sortColumn);
      return;
    }
    const scoreBtn = e.target.closest(".score-detail-btn");
    if (scoreBtn?.dataset.applicantId) {
      e.preventDefault();
      const applicant = applicantsById.get(scoreBtn.dataset.applicantId);
      if (applicant) openScoreDetailModal(applicant);
      return;
    }
    const capBtn = e.target.closest(".see-capability-btn");
    if (!capBtn) return;
    e.preventDefault();
    const applicant = applicantsById.get(capBtn.dataset.applicantId);
    if (applicant) openCapabilityModal(applicant);
  });
  document.getElementById("panel-applicants").addEventListener("change", (e) => {
    if (e.target.classList.contains("applicant-compare-cb")) {
      toggleApplicantCompare(e.target.dataset.applicantId, e.target.checked);
      return;
    }
    if (e.target.id !== "applicants-accepted-only") return;
    state.applicantsShowAcceptedOnly = e.target.checked;
    renderApplicants();
  });
}

function setupScoreHelpModal() {
  const body = document.getElementById("score-help-body");
  if (body) body.innerHTML = renderScoreHelpBody();
  document.getElementById("score-detail-help-link")?.addEventListener("click", () => {
    document.getElementById("score-detail-modal")?.close();
    document.getElementById("score-help-modal")?.showModal();
  });
}

function isAcceptedOrMerchant(a) {
  const action = a.recommended_action;
  return action === "accept" || action === "merchant";
}

function renderApplicants() {
  const sel = state.result?.selection;
  const el = document.getElementById("panel-applicants");
  if (!sel) {
    el.innerHTML = "<p class='muted'>Update scenario first.</p>";
    return;
  }
  const fill = laneFillSummary(sel);
  const all = sortApplicants([
    ...sel.accepted,
    ...sel.waitlisted,
    ...(sel.snack_accepted || []),
    ...(sel.snack_waitlisted || []),
    ...(sel.merchants || []),
  ]);
  applicantsById = new Map(all.map((a) => [a.id, a]));
  pruneApplicantCompareSelection();
  const visible = state.applicantsShowAcceptedOnly ? all.filter(isAcceptedOrMerchant) : all;
  el.innerHTML = `
    <div class="stat-row">
      ${fill.lanes.map((l) => `<div class="stat"><strong>${fill.fmt(l)}</strong> ${fill.statLabel(l)}</div>`).join("")}
      <div class="stat"><strong>${fill.totalAssigned}/${fill.totalCap}${fill.totalWaitlist ? ` · ${fill.totalWaitlist} waitlist` : ""}</strong> total food</div>
    </div>
    <div class="applicants-toolbar">
      <button type="button" id="export-roster-csv" class="secondary">Export roster CSV</button>
      <label class="applicants-filter">
        <input type="checkbox" id="applicants-accepted-only"${state.applicantsShowAcceptedOnly ? " checked" : ""} />
        Accepted + merchant only
      </label>
      <span class="muted applicants-sort-hint">Sort: Vendor · IG · Score · Type resets lane grouping</span>
    </div>
    <table class="applicants-table">
      <thead><tr>
        <th class="compare-col" scope="col"><span class="sr-only">Compare</span></th>
        ${sortableTh("vendor", "Vendor", { title: "Sort by business name" })}
        ${sortableTh("ig", "IG", { title: "Sort by Instagram followers" })}
        <th><button type="button" class="sortable-th sortable-th-reset" data-sort-column="lane" aria-sort="${state.applicantsSort.column === "lane" ? "ascending" : "none"}" title="Group by lane (open prep → drinks → snack → merchant)">Type${state.applicantsSort.column === "lane" ? '<span class="sort-indicator sort-active" aria-hidden="true">●</span>' : '<span class="sort-indicator sort-inactive" aria-hidden="true">↕</span>'}</button></th>
        <th title="Festival signatures — vendor's highlighted items for this apply">Signatures</th>
        ${scoreTh()}
        <th>Action</th>
      </tr></thead>
      <tbody>${visible.map((a) => {
        const row = mergeApplicantRecord(a);
        return `
        <tr class="${row.recommended_action}">
          ${renderCompareCheckbox(row)}
          <td>${esc(row.business_name)}</td>
          <td class="ig-cell">${renderInstagramCell(row)}</td>
          <td class="vendor-type-col">${renderVendorTypeCell(row)}</td>
          <td class="signatures-cell">${renderSignaturesCell(row)}</td>
          <td class="score-cell">${renderScoreCell(row)}</td>
          <td>${esc(actionDisplay(row))}</td>
        </tr>`;
      }).join("")}
      </tbody>
    </table>`;

  document.getElementById("export-roster-csv").onclick = () => {
    const header = ["business_name", "instagram_handle", "instagram_followers", "setup_type", "vendor_class", "archetype", "action", "score", "manual_2026", "signatures"];
    const rows = visible.map((a) => {
      const row = mergeApplicantRecord(a);
      const ig = applicantInstagramMeta(row);
      return [
        row.business_name,
        ig.handle || "",
        ig.followers || "",
        row.setup_type || row.booth_kind || "",
        row.vendor_class || row.vendor_role || "food",
        selectionArchetypeId(row) || "",
        row.recommended_action,
        isScoredMealVendor(row) ? formatScorePoints(row.score?.total || 0) : "",
        row.manual_accepted_2026 ? "yes" : "",
        (row.signature_menu_items || []).map((i) => i.name).join("; "),
      ];
    });
    const csv = [header, ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "food-roster.csv";
    link.click();
  };

  updateApplicantsCompareBar();
}

function buildAcceptedFoodRoster() {
  const sel = state.result?.selection;
  if (!sel) return [];
  const accepted = [...(sel.accepted || []), ...(sel.snack_accepted || [])];
  return accepted.map((a) => {
    const base = state.applicants.find((v) => v.id === a.id) || a;
    return { ...base, ...a };
  });
}

function renderNeedsCoverage() {
  const el = document.getElementById("panel-needs-coverage");
  if (!state.result || !state.needProfile) {
    el.innerHTML = "<p class='muted'>Update scenario first.</p>";
    return;
  }
  const roster = buildAcceptedFoodRoster();
  const ctx = buildSelectionContext(state.config, state.needProfile);
  const coverage = publishRosterCoverage(roster, ctx, { itemsSource: "offer_or_signature" });
  const rows = coverage.needs;
  const updated = coverage.computed_at
    ? new Date(coverage.computed_at).toLocaleString()
    : "—";
  el.innerHTML = `
    <p class="muted">${roster.length} accepted vendor(s) · live coverage from committed/public menus · updated ${esc(updated)}</p>
    ${coverage.summary ? `<p class="needs-coverage-summary"><strong>Roster:</strong> ${esc(coverage.summary)}</p>` : ""}
    <table class="needs-coverage-table">
      <thead><tr><th>Need</th><th>Regional</th><th>Items</th><th>Vendors</th><th>Status</th></tr></thead>
      <tbody>${rows.map((r) => `
        <tr class="${r.status !== "well_served" && r.regional_pct >= 0.05 ? "needs-gap-row" : ""}">
          <td>${esc(r.label)}</td>
          <td>${(r.regional_pct * 100).toFixed(1)}%</td>
          <td>${r.item_count}</td>
          <td>${r.vendor_count}</td>
          <td><span class="coverage-status coverage-status-${esc(r.status)}">${esc(r.status.replace(/_/g, " "))}</span></td>
        </tr>`).join("")}
      </tbody>
    </table>`;
}

function buildEngineMenuRoster() {
  if (!state.result?.selection) return [];
  return state.result.selection.accepted.map((a) => {
    const base = state.applicants.find((v) => v.id === a.id) || a;
    return { ...a, ...base, recommended_action: "accept" };
  });
}

function buildActual2026MenuRoster() {
  return state.applicants
    .filter((a) => a.manual_accepted_2026)
    .sort((a, b) =>
      String(a.booth_label || "").localeCompare(String(b.booth_label || ""), undefined, { numeric: true }),
    );
}

function hasBacktestFieldData() {
  return state.applicants.some((a) => a.manual_accepted_2026);
}

function buildPublicMenu(mode = state.menuPreviewMode) {
  const isActual = mode === "actual_2026";
  const roster = isActual ? buildActual2026MenuRoster() : buildEngineMenuRoster();
  const baseName = state.config?.festival_name || "Festival";
  const festivalName = isActual ? `${baseName} — actual fielded 2026` : `${baseName} — engine curated`;
  const menu = publishPublicMenu(roster, festivalName, {
    itemsSource: isActual ? "capability" : "offer_or_signature",
    needProfile: {
      ...state.needProfile,
      audience_preset: state.config?.audience_preset,
    },
  });

  if (isActual) {
    menu.disclaimer = `${menu.disclaimer} Staff preview — ${roster.length} fielded vendors · full menus from 2026 applications. Dietary tags are engine-inferred for preview — confirm with vendors.`;
  } else {
    const committedCount = roster.filter((a) => a.conditional_offer?.status === "accepted").length;
    const pendingCount = roster.filter((a) => a.conditional_offer?.status === "committed").length;
    menu.disclaimer = `${menu.disclaimer} Staff preview — engine recommends ${roster.length} vendor(s)${
      committedCount
        ? ` · ${committedCount} with vendor-committed menus on the public page`
        : " (signature items until vendor commits menu)"
    }${pendingCount ? ` · ${pendingCount} offer(s) committed, awaiting vendor menu` : ""}.`;
  }
  return menu;
}

function refreshMenuPreviewView() {
  const menu = buildPublicMenu();
  const stats = document.getElementById("menu-preview-stats");
  if (stats) {
    const isActual = state.menuPreviewMode === "actual_2026";
    const roster = isActual ? buildActual2026MenuRoster() : buildEngineMenuRoster();
    const itemCount = menu.vendors.reduce((n, v) => n + v.items.length, 0);
    const takeHomeCount = isActual
      ? roster.filter((a) => ["take_home", "merchant"].includes(a.vendor_class || a.vendor_role)).length
      : 0;
    const snackCount = isActual
      ? roster.filter((a) => (a.vendor_class || a.vendor_role) === "snack").length
      : 0;
    const takeHomeNote =
      takeHomeCount > 0
        ? ` · <strong>${takeHomeCount}</strong> take-home excluded`
        : "";
    const snackNote =
      snackCount > 0
        ? ` · <strong>${snackCount}</strong> optional snack`
        : "";
    stats.innerHTML = isActual
      ? `<strong>${menu.vendors.length}</strong> menu vendors · <strong>${itemCount}</strong> items${snackNote}${takeHomeNote} · ~${roster.length} fielded booths`
      : `<strong>${menu.vendors.length}</strong> engine accept · <strong>${itemCount}</strong> items · target ${state.result?.selection?.summary?.target_food_slots ?? "—"} slots`;
  }
  document.querySelectorAll(".preview-mode-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === state.menuPreviewMode);
  });
  if (menuViewer) {
    menuViewer.setMenu(menu);
  }
}

function renderMenuPreview() {
  const el = document.getElementById("panel-menu-preview");
  if (!state.result) {
    el.innerHTML = "<p class='muted'>Update scenario first.</p>";
    return;
  }

  const showToggle = hasBacktestFieldData();
  el.innerHTML = `
    ${showToggle ? `
    <div class="menu-preview-toolbar">
      <span class="toolbar-label">Menu source</span>
      <button type="button" class="preview-mode-btn secondary" data-mode="engine">Engine recommends</button>
      <button type="button" class="preview-mode-btn secondary" data-mode="actual_2026">Actual LNY 2026</button>
    </div>` : ""}
    <p id="menu-preview-stats" class="muted"></p>
    <div id="menu-preview-root" class="menu-preview-shell"></div>`;

  if (showToggle) {
    el.querySelectorAll(".preview-mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.menuPreviewMode = btn.dataset.mode;
        setRoute("menu-preview", { replace: true });
        refreshMenuPreviewView();
      });
    });
  }

  const root = document.getElementById("menu-preview-root");
  menuViewer = mountMenuViewer(root, buildPublicMenu());
  refreshMenuPreviewView();
}

function renderAll() {
  renderCapacity();
  renderApplicants();
  renderNeedsCoverage();
  renderMenuPreview();
}

async function init() {
  setupTabs();
  setupScoreHelpModal();
  setupApplicantsPanelHandlers();
  setupApplicantsCompareBar();
  updateApplicantsCompareBar();
  setupCapabilityModalHandlers();
  setupScoreDetailModal();
  const initial = parseRoute();
  parseApplicantsSortFromUrl();
  if (initial.menuMode) state.menuPreviewMode = initial.menuMode;

  document.getElementById("attendance").addEventListener("input", (e) => {
    document.getElementById("attendance-out").textContent = e.target.value;
    scheduleScenarioUpdate();
  });
  document.querySelectorAll('input[name="audience"]').forEach((el) => {
    el.addEventListener("change", runScenarioNow);
  });
  document.getElementById("preset-select").addEventListener("change", async (e) => {
    await loadPreset(e.target.value);
    state.menuPreviewMode = "engine";
    runScenarioNow();
  });

  document.getElementById("preset-select").value = "lny-2026-backtest";
  await loadPreset("lny-2026-backtest");
  runScenarioNow();
  activateTab(initial.tab);
  if (location.hash) {
    const expected = routeHash(initial.tab);
    if (location.hash !== expected) {
      setRoute(initial.tab, { replace: true });
    }
  }
}

init().catch((err) => {
  document.body.insertAdjacentHTML("beforeend", `<p style="color:red;padding:1rem">${esc(err.message)}</p>`);
});
