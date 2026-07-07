/** Food curation engine — browser port (mirrors Python core). */

export const OPEN_PREP_ARCHETYPES = [
  { id: "fast_handheld", label: "Fast handheld", order_share: 0.35, throughput_hr: 32, booth_kind: "open", min_slots: 0 },
  { id: "rice_plates_bowls", label: "Rice plates & bowls", order_share: 0.27, throughput_hr: 18, booth_kind: "open", min_slots: 0 },
  { id: "noodle_wok_soup", label: "Noodle / wok / soup", order_share: 0.15, throughput_hr: 12, booth_kind: "open", min_slots: 0 },
  { id: "bbq_smoke_carved", label: "BBQ / smoke / carved", order_share: 0.23, throughput_hr: 14, booth_kind: "open", min_slots: 0 },
];

export const DRINK_ARCHETYPES = [
  { id: "boba_milk_tea", label: "Boba / milk tea anchor", order_share: 0.58, throughput_hr: 50, booth_kind: "drink", min_slots: 1 },
  { id: "sugarcane_fruit_refresher", label: "Sugarcane / fruit refresher", order_share: 0.42, throughput_hr: 55, booth_kind: "drink", min_slots: 1 },
];

export const SNACK_ARCHETYPES = [
  { id: "packaged_savory", label: "Packaged savory", vendor_share: 0.20, max_slots: 2, booth_kind: "prepack", min_slots: 0 },
  { id: "packaged_sweets", label: "Packaged sweets", vendor_share: 0.30, max_slots: 3, booth_kind: "prepack", min_slots: 0 },
  { id: "popcorn_fair", label: "Popcorn & fair treats", vendor_share: 0.25, max_slots: 2, booth_kind: "prepack", min_slots: 0 },
  { id: "ice_treat", label: "Shaved ice & frozen treats", vendor_share: 0.25, max_slots: 2, booth_kind: "prepack", min_slots: 0 },
];

export const ARCHETYPES = [...OPEN_PREP_ARCHETYPES, ...DRINK_ARCHETYPES];

export const OPEN_PREP_ARCHETYPE_IDS = new Set(OPEN_PREP_ARCHETYPES.map((a) => a.id));
export const DRINK_ARCHETYPE_IDS = new Set(DRINK_ARCHETYPES.map((a) => a.id));
export const SNACK_ARCHETYPE_IDS = new Set(SNACK_ARCHETYPES.map((a) => a.id));

const ITEM_KEYWORDS = [
  ["boba_milk_tea", ["boba", "milk tea", "bubble tea", "pearl tea", "matcha drink", "matcha latte", "vietnamese coffee"]],
  ["sugarcane_fruit_refresher", ["sugarcane", "calamansi", "fruit refresher", "aguas frescas", "aquas freseas", "mocktail"]],
  ["ice_treat", [
    "snow cone", "shaved ice", "halo halo", "halo-halo", "ube sago", "buko pandan",
    "sago dessert", "ice cream", "popsicle", "paletas",
  ]],
  ["popcorn_fair", ["cotton candy", "kettle corn", "caramel corn", "cheddar corn", "popcorn"]],
  ["packaged_savory", ["jerky", "beef stick", "meat snack", "chips", "trail mix", "nuts", "crackers"]],
  ["packaged_sweets", [
    "candy", "cookies", "freeze dried", "freeze-dried", "dessert treat", "sweets",
    "gummy", "chocolate", "brownie", "macaron",
  ]],
  ["fast_handheld", [
    "banh mi", "bánh mì", "taco", "musubi", "lumpia", "elote", "sandwich", "skewer", "corn dog", "cheesedog",
    "wonton taco", "egg roll", "eggroll", "potato swirl", "funnel cake", "tornado potato", "pizza", "sausage",
  ]],
  ["rice_plates_bowls", [
    "rice plate", "over rice", "sisig", "tocino", "teriyaki bowl", "orange chicken bowl", "drumstick bowl",
    "basil with fried egg", "chicken basil", "adobo plate",
  ]],
  ["noodle_wok_soup", [
    "noodle soup", "pad thai", "chow mein", "chowmein", "garlic noodle", "curry noodle", "pho", "khao poon", "wok", "fried rice",
  ]],
  ["bbq_smoke_carved", [
    "lechon", "bbq", "barbecue", "brisket", "ribs", "turkey leg", "smoked", "pulled pork", "tri tip", "oxtail", "balut", "gumbo", "jambalaya",
  ]],
];

const CATEGORY_KEYWORDS = {
  meals: ["rice", "plate", "bowl", "noodle", "soup", "bbq", "lechon", "sisig", "taco", "banh mi", "pizza", "gyro", "adobo"],
  snacks: ["lumpia", "egg roll", "fries", "jerky", "musubi", "corn dog", "wings", "popcorn", "cotton", "elote", "nachos", "sago", "snow cone", "shaved ice"],
  drinks: ["boba", "tea", "coffee", "juice", "sugarcane", "lemonade", "soda", "water", "refresher", "matcha"],
};

export function classifyItem(name) {
  const n = String(name || "").toLowerCase().replace(/\s+/g, " ").trim();
  if (/nachos?/i.test(n) || /\bwings?\b/i.test(n) || /fries/i.test(n)) {
    let cat = "meals";
    for (const [c, cKws] of Object.entries(CATEGORY_KEYWORDS)) {
      if (cKws.some((k) => n.includes(k))) {
        cat = c;
        break;
      }
    }
    return { archetype_id: "fast_handheld", category: cat };
  }
  for (const [arch, kws] of ITEM_KEYWORDS) {
    if (kws.some((k) => n.includes(k))) {
      let cat = "meals";
      for (const [c, cKws] of Object.entries(CATEGORY_KEYWORDS)) {
        if (cKws.some((k) => n.includes(k))) {
          cat = c;
          break;
        }
      }
      if (arch === "boba_milk_tea" || arch === "sugarcane_fruit_refresher") cat = "drinks";
      else if (SNACK_ARCHETYPE_IDS.has(arch)) cat = "snacks";
      else if (cat === "drinks") cat = "meals";
      return { archetype_id: arch, category: cat };
    }
  }
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some((k) => n.includes(k))) return { archetype_id: null, category: cat };
  }
  return { archetype_id: null, category: "meals" };
}

export const SNACK_DEFAULTS = {
  snack_buy_rate: 0.10,
  buyers_per_vendor_weekend: 550,
  max_vendors: 6,
  booth_fee: 400,
  viability_mult: 2.0,
  coverage_first: true,
  coverage_floor_slots: 4,
};

export const DRINK_DEFAULTS = {
  drink_buy_rate: 0.30,
  items_per_buyer: 1.0,
};

export const AUDIENCE_PRESETS = {
  family_general: {
    food_buy_rate_delta: 0.0,
    drink_buy_rate_delta: 0.0,
    share_multipliers: {
      rice_plates_bowls: 1.08,
      fast_handheld: 1.05,
      boba_milk_tea: 0.95,
    },
    need_multipliers: {
      kid_friendly: 1.25,
      easy_chew: 1.15,
      mild_spice: 1.10,
    },
    scoring_weight_overrides: {
      menu_fit: 0.33,
      social_reach: 0.02,
      festival_legacy: 0.05,
    },
  },
  campus_foodie: {
    food_buy_rate_delta: 0.06,
    drink_buy_rate_delta: 0.04,
    share_multipliers: {
      boba_milk_tea: 1.12,
      sugarcane_fruit_refresher: 1.08,
      fast_handheld: 1.05,
      rice_plates_bowls: 0.92,
    },
    need_multipliers: {
      kid_friendly: 0.50,
      easy_chew: 0.75,
      mild_spice: 0.90,
    },
    scoring_weight_overrides: {
      menu_fit: 0.30,
      social_reach: 0.10,
    },
  },
};

function cloneArchetypes(list) {
  return list.map((a) => ({ ...a }));
}

function normalizeShares(archetypes) {
  const total = archetypes.reduce((s, a) => s + a.order_share, 0);
  if (total <= 0) return;
  archetypes.forEach((a) => { a.order_share /= total; });
}

function applyAudiencePreset(openPrep, drinks, preset, baseFoodBuy, baseDrinkBuy) {
  let foodBuyRate = baseFoodBuy;
  let drinkBuyRate = baseDrinkBuy;
  if (!preset || !AUDIENCE_PRESETS[preset]) return { foodBuyRate, drinkBuyRate };
  const cfg = AUDIENCE_PRESETS[preset];
  foodBuyRate = Math.min(0.95, baseFoodBuy + (cfg.food_buy_rate_delta || 0));
  drinkBuyRate = Math.min(0.95, baseDrinkBuy + (cfg.drink_buy_rate_delta || 0));
  const mults = cfg.share_multipliers || {};
  [...openPrep, ...drinks].forEach((a) => {
    if (mults[a.id]) a.order_share *= mults[a.id];
  });
  normalizeShares(openPrep);
  normalizeShares(drinks);
  return { foodBuyRate, drinkBuyRate };
}

function laneCapacity(archetypes, totalOrders, hoursTotal, lane) {
  let laneSlots = 0;
  let laneCapacityTotal = 0;
  const slotsByArchetype = {};
  const rows = archetypes.map((a) => {
    const orders = totalOrders * a.order_share;
    const capPerSlot = a.throughput_hr * hoursTotal;
    const slotsMath = capPerSlot ? orders / capPerSlot : 0;
    const slots = Math.max(orders > 0 ? Math.ceil(slotsMath) : 0, a.min_slots);
    const capacity = slots * capPerSlot;
    laneSlots += slots;
    laneCapacityTotal += capacity;
    slotsByArchetype[a.id] = slots;
    return { ...a, lane, orders, capPerSlot, slots, capacity, utilization: capacity ? orders / capacity : 0 };
  });
  return { rows, laneSlots, laneCapacityTotal, slotsByArchetype };
}

function cloneSnackArchetypes(list) {
  return list.map((a) => ({ ...a }));
}

function allocateSnackSlots(archetypes, total, coverageFirst = false) {
  if (total <= 0) return Object.fromEntries(archetypes.map((a) => [a.id, 0]));

  if (coverageFirst) {
    const slots = Object.fromEntries(archetypes.map((a) => [a.id, 0]));
    const ordered = [...archetypes].sort((a, b) => b.vendor_share - a.vendor_share);
    let remaining = total;
    while (remaining > 0) {
      let progress = false;
      for (const a of ordered) {
        if (remaining <= 0) break;
        const cap = a.max_slots ?? 99;
        if (slots[a.id] < cap) {
          slots[a.id] += 1;
          remaining -= 1;
          progress = true;
        }
      }
      if (!progress) break;
    }
    return slots;
  }

  const ideals = Object.fromEntries(archetypes.map((a) => [a.id, total * a.vendor_share]));
  const floors = Object.fromEntries(Object.entries(ideals).map(([id, val]) => [id, Math.floor(val)]));
  let remainder = total - Object.values(floors).reduce((s, n) => s + n, 0);

  if (remainder > 0) {
    const ranked = Object.entries(ideals)
      .map(([id, ideal]) => [ideal - floors[id], id])
      .sort((a, b) => b[0] - a[0]);
    for (const [, id] of ranked) {
      if (remainder <= 0) break;
      const cap = archetypes.find((a) => a.id === id)?.max_slots ?? 99;
      if (floors[id] >= cap) continue;
      floors[id] += 1;
      remainder -= 1;
    }
  }

  archetypes.forEach((a) => {
    floors[a.id] = Math.min(floors[a.id], a.max_slots ?? 99);
    floors[a.id] = Math.max(floors[a.id], a.min_slots ?? 0);
  });
  return floors;
}

function snackLaneCapacity(archetypes, totalSnackSlots, snackBuyers, coverageFirst = false) {
  const slotMap = allocateSnackSlots(archetypes, totalSnackSlots, coverageFirst);
  const slotsByArchetype = {};
  const rows = archetypes.map((a) => {
    const slots = slotMap[a.id] ?? 0;
    const buyers = snackBuyers * a.vendor_share;
    slotsByArchetype[a.id] = slots;
    return {
      ...a,
      lane: "snacks",
      orders: buyers,
      buyers_est: buyers,
      slots,
      utilization: slots ? buyers / (slots * 550) : 0,
    };
  });
  return { rows, slotsByArchetype };
}

export function capacityPlan(config) {
  const attendance = config.attendance ?? 6000;
  const baseFoodBuyRate = config.food_buy_rate ?? 0.4;
  const itemsPerBuyer = config.items_per_buyer ?? 1.1;
  const hoursTotal = (config.hours_per_day ?? 6) * (config.festival_days ?? 2);
  const drinkCfg = { ...DRINK_DEFAULTS, ...(config.drink_vendors || {}) };
  const baseDrinkBuyRate = drinkCfg.drink_buy_rate ?? 0.3;
  const drinkItemsPerBuyer = drinkCfg.items_per_buyer ?? 1.0;

  const openPrepArchetypes = cloneArchetypes(OPEN_PREP_ARCHETYPES);
  const drinkArchetypes = cloneArchetypes(DRINK_ARCHETYPES);
  normalizeShares(openPrepArchetypes);
  normalizeShares(drinkArchetypes);
  const { foodBuyRate, drinkBuyRate } = applyAudiencePreset(
    openPrepArchetypes,
    drinkArchetypes,
    config.audience_preset,
    baseFoodBuyRate,
    baseDrinkBuyRate,
  );

  const snackCfg = { ...SNACK_DEFAULTS, ...(config.snack_vendors || {}) };
  const snackBuyers = attendance * snackCfg.snack_buy_rate;
  const snackSlotsDemand = snackCfg.buyers_per_vendor_weekend
    ? Math.max(0, Math.ceil(snackBuyers / snackCfg.buyers_per_vendor_weekend))
    : 0;
  const coverageFirst = Boolean(snackCfg.coverage_first);
  const coverageFloor = snackCfg.coverage_floor_slots ?? 0;
  let snackSlots;
  if (coverageFirst && coverageFloor > 0) {
    snackSlots = Math.min(snackCfg.max_vendors, Math.max(snackSlotsDemand, coverageFloor));
  } else {
    snackSlots = Math.min(snackCfg.max_vendors, snackSlotsDemand);
  }
  const snackPolicy = {
    coverage_first: coverageFirst,
    coverage_floor_slots: coverageFloor,
    slots_demand: snackSlotsDemand,
    viability_mult: snackCfg.viability_mult ?? 2.0,
    booth_fee: snackCfg.booth_fee ?? 400,
  };

  const openPrepOrders = attendance * foodBuyRate * itemsPerBuyer;
  const drinkOrders = attendance * drinkBuyRate * drinkItemsPerBuyer;

  const open = laneCapacity(openPrepArchetypes, openPrepOrders, hoursTotal, "open_prep");
  const drinks = laneCapacity(drinkArchetypes, drinkOrders, hoursTotal, "drinks");
  const snackArchetypes = cloneSnackArchetypes(SNACK_ARCHETYPES);
  const snacks = snackLaneCapacity(snackArchetypes, snackSlots, snackBuyers, coverageFirst);

  const rows = [...open.rows, ...drinks.rows, ...snacks.rows];
  const slotsByArchetype = { ...open.slotsByArchetype, ...drinks.slotsByArchetype, ...snacks.slotsByArchetype };
  const totalOrders = openPrepOrders + drinkOrders;
  const totalCapacity = open.laneCapacityTotal + drinks.laneCapacityTotal;
  const foodSlots = open.laneSlots + drinks.laneSlots;

  return {
    attendance,
    audiencePreset: config.audience_preset,
    foodBuyRate,
    drinkBuyRate,
    openPrepOrders,
    drinkOrders,
    totalOrders,
    hoursTotal,
    openPrepSlots: open.laneSlots,
    drinkSlots: drinks.laneSlots,
    openSlots: open.laneSlots,
    prepackSlots: drinks.laneSlots,
    mealSlots: foodSlots,
    foodSlots,
    snackBuyRate: snackCfg.snack_buy_rate,
    snackBuyersEst: snackBuyers,
    snackSlots,
    snackSlotsDemand,
    snackPolicy,
    fleetUtilization: totalCapacity ? totalOrders / totalCapacity : 0,
    openPrepUtilization: open.laneCapacityTotal ? openPrepOrders / open.laneCapacityTotal : 0,
    drinkUtilization: drinks.laneCapacityTotal ? drinkOrders / drinks.laneCapacityTotal : 0,
    rows,
    openPrepRows: open.rows,
    drinkRows: drinks.rows,
    snackRows: snacks.rows,
    slotsByArchetype,
    attendanceExtrapolation: attendance > 20000,
  };
}

const DRINK_PRIMARY_ARCHETYPES = new Set(["boba_milk_tea", "sugarcane_fruit_refresher"]);

const SIGNATURE_LIMITS = {
  open_cooking: 5,
  food_truck: 5,
  food_trailer: 5,
  prepack: 8,
  prepack_snacks: 10,
};

function signatureLimitForBooth(boothKind) {
  const bk = String(boothKind || "").toLowerCase().replace(/ /g, "_");
  if (bk.includes("trailer")) return SIGNATURE_LIMITS.food_trailer;
  if (bk.includes("truck")) return SIGNATURE_LIMITS.food_truck;
  if (bk.includes("prepack")) return SIGNATURE_LIMITS.prepack;
  return SIGNATURE_LIMITS.open_cooking;
}

function isCommoditySideItem(name, primaryArchetype) {
  const n = String(name || "").trim();
  if (!n) return true;
  if (/\b(bottle\s*)?water\b|canned\s*soda|soda\/water|^sodas?\.?$/i.test(n)) return true;
  if (!DRINK_PRIMARY_ARCHETYPES.has(primaryArchetype)) {
    if (/\bboba\b|milk\s*tea|bubble\s*tea|pearl\s*tea|\bcoffee\b|ice\s*tea|coconut\s*juice|fruit\s*(infused\s*)?ice\s*tea|fruit\s*refresher|^thai\s*tea$/i.test(n)) {
      return true;
    }
  }
  return false;
}

function enrichCapabilityItem(item) {
  const { archetype_id, category } = classifyItem(item.name || "");
  return {
    ...item,
    archetype_id: item.archetype_id || archetype_id,
    category: item.category || category,
  };
}

const MENU_FIT_TAG_REPEAT_MULT = [1.0, 0.5, 0.25];
const MENU_FIT_ARCHETYPE_REPEAT_MULT = [1.0, 0.5, 0.25];
const MENU_FIT_ARCHETYPE_BONUS = 0.1;
const MENU_FIT_VENDOR_CERT_MULT = 3;
const MENU_FIT_ITEM_TAG_MULT = 2;

function repeatMultiplier(count, schedule) {
  return schedule[Math.min(count, schedule.length - 1)];
}

function menuFitMarginalItem(item, needWeights, tagCounts, archetypeCounts) {
  let delta = 0;
  (item.dietary_tags || []).forEach((tag) => {
    const key = normalizeNeedTag(tag);
    const weight = needWeights[key] || 0;
    if (weight <= 0) return;
    const mult = repeatMultiplier(tagCounts[key] || 0, MENU_FIT_TAG_REPEAT_MULT);
    delta += weight * MENU_FIT_ITEM_TAG_MULT * mult;
  });
  const arch = item.archetype_id;
  if (arch) {
    const mult = repeatMultiplier(archetypeCounts[arch] || 0, MENU_FIT_ARCHETYPE_REPEAT_MULT);
    delta += MENU_FIT_ARCHETYPE_BONUS * mult;
  }
  return delta;
}

function applyMenuFitItemCounts(item, tagCounts, archetypeCounts) {
  (item.dietary_tags || []).forEach((tag) => {
    const key = normalizeNeedTag(tag);
    tagCounts[key] = (tagCounts[key] || 0) + 1;
  });
  if (item.archetype_id) {
    archetypeCounts[item.archetype_id] = (archetypeCounts[item.archetype_id] || 0) + 1;
  }
}

export function menuFitFromItems(items, needWeights, vendorDietary = []) {
  let score = 0;
  const tagCounts = {};
  const archetypeCounts = {};
  (items || []).forEach((item) => {
    score += menuFitMarginalItem(item, needWeights, tagCounts, archetypeCounts);
    applyMenuFitItemCounts(item, tagCounts, archetypeCounts);
  });
  (vendorDietary || []).forEach((cert) => {
    score += (needWeights[normalizeNeedTag(cert)] || 0) * MENU_FIT_VENDOR_CERT_MULT;
  });
  return Math.min(score, 1);
}

function itemMenuFitContribution(item, needWeights, tagCounts = {}, archetypeCounts = {}) {
  return menuFitMarginalItem(item, needWeights, tagCounts, archetypeCounts);
}

function recommendMenuItems(capability, boothKind, needWeights, primaryArchetype) {
  if (!capability?.length || !needWeights || !Object.keys(needWeights).length) return [];
  const limit = signatureLimitForBooth(boothKind);
  const primary = primaryArchetype || inferPrimaryFromCapability(capability);
  let candidates = capability
    .map(enrichCapabilityItem)
    .filter((item) => !isCommoditySideItem(item.name, primary));
  if (!candidates.length) candidates = capability.map(enrichCapabilityItem);

  const selected = [];
  const tagCounts = {};
  const archetypeCounts = {};
  const pool = [...candidates];

  while (selected.length < limit && pool.length) {
    let bestItem = pool[0];
    let bestDelta = -1;
    pool.forEach((item) => {
      const delta = itemMenuFitContribution(item, needWeights, tagCounts, archetypeCounts);
      if (delta > bestDelta) {
        bestDelta = delta;
        bestItem = item;
      }
    });
    if (bestDelta <= 0 && selected.length) break;
    selected.push(bestItem);
    applyMenuFitItemCounts(bestItem, tagCounts, archetypeCounts);
    pool.splice(pool.indexOf(bestItem), 1);
  }
  return selected;
}

export function menuItemsForScoring(applicant) {
  if (applicant.recommended_menu_items?.length) return applicant.recommended_menu_items;
  return applicant.signature_menu_items || [];
}

export function attachRecommendedMenu(applicant, needWeights) {
  const capability = applicant.capability_menu_items || [];
  if (!capability.length || !needWeights || !Object.keys(needWeights).length) return applicant;
  const primary = selectionArchetypeId(applicant)
    || inferPrimaryFromCapability(
      capability,
      applicant.primary_archetype_id,
      applicant.vendor_class || applicant.vendor_role,
    );
  const recommended = recommendMenuItems(
    capability,
    applicant.booth_kind,
    needWeights,
    primary,
  );
  const arches = recommended.map((i) => i.archetype_id).filter(Boolean);
  const spread = new Set(arches).size;
  const purity = primary && recommended.length
    ? arches.filter((a) => a === primary).length / recommended.length
    : 0;
  return {
    ...applicant,
    recommended_menu_items: recommended,
    recommended_archetype_spread: spread,
    recommended_primary_archetype_purity: purity,
  };
}

function inferPrimaryFromCapability(capability, override, vendorClass) {
  if (override) return override;
  const food = {};
  const drink = {};
  const mealLane = !vendorClass || ["open_prep", "drinks", "meal", "food"].includes(vendorClass);
  for (const item of capability || []) {
    const { archetype_id: arch } = classifyItem(item.name || "");
    if (!arch) continue;
    if (mealLane && SNACK_ARCHETYPE_IDS.has(arch)) continue;
    if (DRINK_PRIMARY_ARCHETYPES.has(arch)) drink[arch] = (drink[arch] || 0) + 1;
    else food[arch] = (food[arch] || 0) + 1;
  }
  const foodKeys = Object.keys(food).sort((a, b) => food[b] - food[a]);
  if (foodKeys.length) return foodKeys[0];
  const drinkKeys = Object.keys(drink).sort((a, b) => drink[b] - drink[a]);
  return drinkKeys[0] || null;
}

export function classifyApplicant(applicant) {
  const signatures = (applicant.signature_menu_items || []).map((item) => {
    const { archetype_id, category } = classifyItem(item.name || "");
    return { ...item, archetype_id, category: item.category || category };
  });
  const inferred = inferPrimaryFromCapability(
    applicant.capability_menu_items,
    applicant.primary_archetype_id,
    applicant.vendor_class || applicant.vendor_role,
  );
  const primary = applicant.primary_archetype_id || inferred;
  const spread = new Set(signatures.map((i) => i.archetype_id).filter(Boolean)).size;
  const purity = primary
    ? signatures.filter((i) => i.archetype_id === primary).length / (signatures.length || 1)
    : 0;
  return {
    ...applicant,
    signature_menu_items: signatures,
    inferred_primary_archetype_id: inferred,
    archetype_spread: spread,
    primary_archetype_purity: purity,
  };
}

export function selectionArchetypeId(a) {
  return a.primary_archetype_id || a.inferred_primary_archetype_id;
}

export const DEFAULT_SCORING_WEIGHTS = {
  menu_fit: 0.30,
  need_anchor: 0.10,
  brand_focus: 0.10,
  vendor_roi: 0.15,
  demographic: 0.10,
  social_reach: 0.05,
  festival_legacy: 0.05,
  policy_preference: 0.05,
  deposit_fifo: 0.10,
};

export const NEED_TAG_ALIASES = {
  halal: "halal_certified",
  vegan: "vegan_options",
  vegetarian: "vegetarian_options",
  gluten_free: "gluten_free_options",
  dairy_free: "dairy_free_options",
  mild: "mild_spice",
  low_spice: "mild_spice",
  no_spice: "mild_spice",
  mild_spice: "mild_spice",
  kids: "kid_friendly",
  kid_friendly: "kid_friendly",
  soft: "easy_chew",
  easy_chew: "easy_chew",
  lower_sugar: "lower_sugar",
  sugar_free: "lower_sugar",
  unsweetened: "lower_sugar",
  no_added_sugar: "lower_sugar",
};

export function mergeNeedWeights(needProfile = {}) {
  const merged = {
    ...(needProfile.dietary_need_weights || {}),
    ...(needProfile.experience_need_weights || {}),
    ...(needProfile.attendee_need_weights || {}),
  };
  const preset = needProfile.audience_preset;
  if (preset && AUDIENCE_PRESETS[preset]?.need_multipliers) {
    Object.entries(AUDIENCE_PRESETS[preset].need_multipliers).forEach(([tag, mult]) => {
      if (merged[tag] != null) merged[tag] *= mult;
    });
  }
  return merged;
}

export function buildSelectionContext(config, needProfile = {}) {
  const policy = config?.policy || {};
  return {
    ...needProfile,
    audience_preset: config?.audience_preset,
    policy,
    scoring_weights: policy.scoring_weights || config?.scoring_weights,
  };
}

function resolveScoringWeights(selectionContext = {}, overrides = {}) {
  const w = { ...DEFAULT_SCORING_WEIGHTS, ...overrides };
  if (selectionContext.scoring_weights) {
    Object.assign(w, selectionContext.scoring_weights);
  }
  const preset = selectionContext.audience_preset;
  if (preset && AUDIENCE_PRESETS[preset]?.scoring_weight_overrides) {
    Object.assign(w, AUDIENCE_PRESETS[preset].scoring_weight_overrides);
  }
  return w;
}

export function applicantInstagramMeta(applicant) {
  const social = applicant.social || {};
  const ig = social.instagram || {};
  const handle = ig.handle || applicant.instagram_handle;
  const followers = ig.followers ?? applicant.instagram_followers ?? 0;
  const handleStr = handle ? String(handle).trim() : "";
  const followersInt = Number.parseInt(followers, 10) || 0;
  return { handle: handleStr || null, followers: followersInt };
}

export function instagramProfileUrl(handle) {
  if (!handle) return null;
  const s = String(handle).trim();
  if (/^https?:\/\//i.test(s)) return s;
  const user = s.replace(/^@/, "");
  return user ? `https://instagram.com/${encodeURIComponent(user)}` : null;
}

export function formatFollowerCount(n) {
  if (!n || n <= 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

function instagramMeta(applicant) {
  return applicantInstagramMeta(applicant);
}

function socialReachScore(applicant) {
  const { handle, followers } = instagramMeta(applicant);
  if (!handle) return 0;
  if (followers <= 0) return 0.15;
  const score = (Math.log10(followers) - 2) / 3;
  return Math.max(0, Math.min(1, score));
}

function priorSeasonCount(applicant) {
  const legacy = applicant.festival_legacy || {};
  if (legacy.prior_count != null) return Math.max(0, Number(legacy.prior_count) || 0);
  return (legacy.seasons || []).length;
}

function legacyScore(applicant) {
  const count = priorSeasonCount(applicant);
  if (count <= 0) return 0;
  if (count === 1) return 0.4;
  if (count === 2) return 0.7;
  return 1;
}

export const NEED_COVERAGE_MIN_WEIGHT = 0.06;
export const NEED_SWAP_MAX_SCORE_GAP = 0.15;

export const EVENTENY_FORM_HELP =
  "Eventeny: list your full capability menu in the first menu question (water/soda are fine — "
  + "ignored for scoring). The signatures question is optional when you have five or fewer "
  + "food items — only needed when you list more than five and must choose which to highlight.";

export const EVENTENY_ELK_GROVE_BUSINESS_QUESTION =
  "Do you consider your business part of the Elk Grove business community?";

export const EVENTENY_ELK_GROVE_BUSINESS_HELP =
  "Eventeny — Elk Grove business community (self-report): answer Yes if you identify your "
  + "business with Elk Grove — for example a shop or kitchen in city limits, a food truck that "
  + "is based in or regularly serves Elk Grove, or a vendor who considers Elk Grove your "
  + "primary market. Honest best answer; not verified. Maps to elk_grove_based for a small "
  + "policy preference boost and City post-event vendor community counts.";

export const SCORE_DISPLAY_SCALE = 10_000;

/** Integer display points for a 0–1 internal score value. */
export function formatScorePoints(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return String(Math.round(Number(value) * SCORE_DISPLAY_SCALE));
}

export const SCORE_HELP = {
  intro:
    "Open prep and drink applicants are ranked within their primary archetype bucket. Snacks use ROI only. "
    + "Total score is a weighted sum of the components below, shown on a 10,000-point scale (max 10,000).",
  eventenyForm: EVENTENY_FORM_HELP,
  eventenyElkGrove: EVENTENY_ELK_GROVE_BUSINESS_HELP,
  tiebreaker:
    "When two vendors tie on total score, earlier deposit timestamp wins (first-come within the same archetype cap).",
  needCoverage:
    "After ranking, a coverage pass may promote a waitlisted vendor when the roster lacks a high-priority attendee need (e.g. sole Halal-certified vendor), swapping out the lowest-scoring accepted vendor in the same archetype if the score gap is ≤ 0.15.",
  components: [
    {
      id: "menu_fit",
      weight: 0.30,
      label: "Menu fit",
      detail:
        "Best N items from capability for regional need weights (regional-need-profile.json), adjusted by audience preset. Engine picks the menu; vendor signatures are shown for comparison. Each need tag on an item counts 2×; repeating the same tag on another item earns 50% then 25%. Archetype bonus (+0.10) uses the same decay. Vendor certs 3× once each.",
    },
    {
      id: "need_anchor",
      weight: 0.10,
      label: "Need anchor",
      detail:
        "Bonus when this applicant is one of only one or two pool sources for a high-priority need (Halal, vegetarian, etc.). Rewards diversity beyond raw menu overlap.",
    },
    {
      id: "brand_focus",
      weight: 0.10,
      label: "Brand focus",
      detail: "Menus spanning three or more throughput buckets score lower; one or two focused styles score full credit.",
    },
    {
      id: "vendor_roi",
      weight: 0.15,
      label: "Vendor ROI",
      detail: "Expected gross revenue vs booth fee for this archetype slot at the scenario attendance.",
    },
    {
      id: "demographic",
      weight: 0.10,
      label: "Demographic alignment",
      detail: "Additional alignment with coalition regional need profile (overlaps menu fit but rewards breadth of coverage).",
    },
    {
      id: "social_reach",
      weight: 0.05,
      label: "Social reach",
      detail:
        "Log-scaled Instagram followership when the applicant lists a handle (novelty / discovery proxy). Weight is higher for Campus / foodie audience.",
    },
    {
      id: "festival_legacy",
      weight: 0.05,
      label: "Festival legacy",
      detail:
        "Prior cPALSs festival appearances (LNY + MAF seasons before the current cycle). Tiered: 1 season → 0.4, 2 → 0.7, 3+ → 1.0.",
    },
    {
      id: "policy_preference",
      weight: 0.05,
      label: "Policy preference",
      detail:
        "Base 0.5. Vietnamese cultural anchor vendors score 1.0 (+0.5). Elk Grove–connected businesses receive a +0.25 local boost (0.75 when alone; stacks with anchor up to 1.0). Eventeny self-report (elk_grove_based); not verified. Max swing ≈100 pts on the 10,000 scale (5% weight × 0.25 component) — not worth auditing; deposit timestamp breaks ties.",
    },
  ],
  snackNote:
    "Snack lane: same 10,000 composite scale as meals (vendor ROI uses the 2× snack viability rule). "
    + "Selection within each treat archetype ranks on vendor ROI; deposit timestamp breaks ties.",
};

export function normalizeNeedTag(tag) {
  return NEED_TAG_ALIASES[tag] || tag;
}

export function applicantNeedTags(applicant) {
  const tags = new Set();
  (applicant.dietary || []).forEach((d) => tags.add(normalizeNeedTag(d)));
  menuItemsForScoring(applicant).forEach((item) => {
    (item.dietary_tags || []).forEach((t) => tags.add(normalizeNeedTag(t)));
  });
  return tags;
}

function needAnchorScore(applicant, needWeights, pool) {
  if (!needWeights || !pool?.length) return 0;
  const myTags = applicantNeedTags(applicant);
  let score = 0;
  Object.entries(needWeights).forEach(([tag, weight]) => {
    if (weight < 0.05 || !myTags.has(tag)) return;
    const providers = pool.filter((a) => applicantNeedTags(a).has(tag)).length;
    if (providers === 1) score += weight * 5;
    else if (providers === 2) score += weight * 2;
  });
  return Math.min(score, 1);
}

function roiScore(a, capacity) {
  const fee = a.booth_fee ?? 750;
  const arch = selectionArchetypeId(a);
  if (!arch) return 0.5;
  const slots = capacity.slotsByArchetype?.[arch] || 1;
  const orders = DRINK_ARCHETYPE_IDS.has(arch)
    ? (capacity.drinkOrders ?? capacity.totalOrders ?? 0)
    : (capacity.openPrepOrders ?? capacity.totalOrders ?? 0);
  const row = (capacity.rows || []).find((r) => r.id === arch);
  if (row?.lane === "snacks") return 0.5;
  const share = row?.order_share ?? 0.1;
  const avgTicket = DRINK_ARCHETYPE_IDS.has(arch) ? 12 : 15;
  const expectedGross = ((orders * share) / Math.max(slots, 1)) * avgTicket;
  const viability = fee * 3;
  return expectedGross >= viability ? 1 : Math.max(0, expectedGross / viability);
}

function demographicScore(a, needWeights) {
  if (!needWeights || !Object.keys(needWeights).length) return 0.5;
  let hits = 0;
  (a.dietary || []).forEach((d) => { hits += needWeights[normalizeNeedTag(d)] || 0; });
  menuItemsForScoring(a).forEach((item) => {
    (item.dietary_tags || []).forEach((t) => { hits += (needWeights[normalizeNeedTag(t)] || 0) * 0.5; });
  });
  return Math.min(hits * 5, 1);
}

function ensureNeedCoverage(accepted, waitlisted, needWeights, maxGap = NEED_SWAP_MAX_SCORE_GAP) {
  const acc = [...accepted];
  const wait = [...waitlisted];
  Object.entries(needWeights)
    .sort((a, b) => b[1] - a[1])
    .forEach(([tag, weight]) => {
      if (weight < NEED_COVERAGE_MIN_WEIGHT) return;
      if (acc.some((a) => applicantNeedTags(a).has(tag))) return;
      const candidates = wait.filter((a) => applicantNeedTags(a).has(tag));
      if (!candidates.length) return;
      candidates.sort((x, y) => y.score.total - x.score.total || x._dep - y._dep);
      const pick = candidates[0];
      const pickArch = selectionArchetypeId(pick) || "unclassified";
      const sameArch = acc.filter((a) => (selectionArchetypeId(a) || "unclassified") === pickArch);
      if (!sameArch.length) return;
      const victim = sameArch.reduce((lo, a) => (a.score.total < lo.score.total ? a : lo));
      if (victim.score.total - pick.score.total > maxGap) return;
      acc.splice(acc.indexOf(victim), 1);
      wait.splice(wait.indexOf(pick), 1);
      wait.push({ ...victim, recommended_action: "waitlist", action_reason: "need_coverage_swap" });
      acc.push({ ...pick, recommended_action: "accept", action_reason: "need_coverage" });
    });
  return { accepted: acc, waitlisted: wait };
}

function depositTs(ts) {
  if (!ts) return Infinity;
  const t = Date.parse(ts);
  return Number.isNaN(t) ? Infinity : t;
}

const ELK_GROVE_ZIP_PREFIXES = ["95624", "95757", "95758"];

export function isElkGroveBased(applicant) {
  const flagged = applicant?.elk_grove_based;
  if (flagged === true) return true;
  if (flagged === false) return false;
  const city = String(applicant?.business_city || applicant?.city || "").toLowerCase();
  if (city.includes("elk grove")) return true;
  const zip = String(applicant?.business_zip || applicant?.zip || "").trim().slice(0, 5);
  return ELK_GROVE_ZIP_PREFIXES.some((prefix) => zip.startsWith(prefix));
}

export function policyPreferenceScore(applicant, selectionContext = {}) {
  const policy = selectionContext?.policy || {};
  let score = 0.5;
  if (applicant?.vietnamese_anchor) score += 0.5;
  if (policy.elk_grove_local_bonus !== false && isElkGroveBased(applicant)) score += 0.25;
  return Math.min(score, 1);
}

export function scoreApplicant(a, capacity, needWeights, pool = [], selectionContext = {}) {
  const menuFit = menuFitFromItems(menuItemsForScoring(a), needWeights, a.dietary || []);
  const needAnchor = needAnchorScore(a, needWeights, pool);
  const spread = a.recommended_archetype_spread ?? a.archetype_spread ?? 0;
  const purity = a.recommended_primary_archetype_purity ?? a.primary_archetype_purity ?? 0;
  const brandFocus = spread <= 2 ? 1 : Math.max(0.2, purity);
  const vendorRoi = roiScore(a, capacity);
  const demographic = demographicScore(a, needWeights);
  const socialReach = socialReachScore(a);
  const festivalLegacy = legacyScore(a);
  const policyPref = policyPreferenceScore(a, selectionContext);
  const components = {
    menu_fit: menuFit,
    need_anchor: needAnchor,
    brand_focus: brandFocus,
    vendor_roi: vendorRoi,
    demographic,
    social_reach: socialReach,
    festival_legacy: festivalLegacy,
    policy_preference: policyPref,
  };
  const w = resolveScoringWeights(selectionContext);
  const total = Object.entries(components).reduce(
    (sum, [k, v]) => sum + v * (w[k] || 0),
    0,
  );
  return { total, components, weights: w };
}

export function snackSelectionRank(a) {
  const comp = a.score?.components || {};
  return comp.vendor_roi ?? a.score?.total ?? 0;
}

export function scoreSnackApplicant(a, capacity, needWeights, pool = [], selectionContext = {}) {
  const menuFit = menuFitFromItems(menuItemsForScoring(a), needWeights, a.dietary || []);
  const needAnchor = needAnchorScore(a, needWeights, pool);
  const spread = a.recommended_archetype_spread ?? a.archetype_spread ?? 0;
  const purity = a.recommended_primary_archetype_purity ?? a.primary_archetype_purity ?? 0;
  const brandFocus = spread <= 2 ? 1 : Math.max(0.2, purity);
  const vendorRoi = snackRoiScore(a, capacity, selectionContext);
  const demographic = demographicScore(a, needWeights);
  const socialReach = socialReachScore(a);
  const festivalLegacy = legacyScore(a);
  const policyPref = policyPreferenceScore(a, selectionContext);
  const components = {
    menu_fit: menuFit,
    need_anchor: needAnchor,
    brand_focus: brandFocus,
    vendor_roi: vendorRoi,
    demographic,
    social_reach: socialReach,
    festival_legacy: festivalLegacy,
    policy_preference: policyPref,
  };
  const w = resolveScoringWeights(selectionContext);
  const total = Object.entries(components).reduce(
    (sum, [k, v]) => sum + v * (w[k] || 0),
    0,
  );
  return { total, components, weights: w };
}

export function normalizeVendorClass(a) {
  const vc = a.vendor_class || a.vendor_role || "open_prep";
  if (vc === "food" || vc === "meal") return vc === "meal" ? "meal" : "open_prep";
  if (vc === "take_home") return "merchant";
  return vc;
}

export function isOpenPrepVendor(a) {
  const vc = a.vendor_class || a.vendor_role || "open_prep";
  if (vc === "meal" || vc === "food") return true;
  return normalizeVendorClass(a) === "open_prep";
}

export function isDrinksVendor(a) {
  return normalizeVendorClass(a) === "drinks";
}

export function isMealVendor(a) {
  return isOpenPrepVendor(a) || isDrinksVendor(a);
}

export function isSnackVendor(a) {
  return normalizeVendorClass(a) === "snack";
}

export function isMerchantVendor(a) {
  const vc = a.vendor_class || a.vendor_role;
  return vc === "merchant" || vc === "take_home";
}

export function isTakeHomeVendor(a) {
  return isMerchantVendor(a);
}

export function isFoodVendor(a) {
  return isOpenPrepVendor(a);
}

function snackPolicy(capacity, selectionContext = {}) {
  const cfg = { ...SNACK_DEFAULTS, ...(selectionContext.snack_vendors || {}) };
  if (capacity.snackPolicy) return { ...cfg, ...capacity.snackPolicy };
  return cfg;
}

export function snackRoiScore(a, capacity, selectionContext = {}) {
  const cfg = snackPolicy(capacity, selectionContext);
  const fee = cfg.booth_fee ?? 400;
  const mult = cfg.viability_mult ?? 2.0;
  const arch = selectionArchetypeId(a);
  const snackRows = Object.fromEntries((capacity.snackRows || []).map((r) => [r.id, r]));
  let slots;
  let share;
  if (arch && SNACK_ARCHETYPE_IDS.has(arch)) {
    slots = Math.max(capacity.slotsByArchetype?.[arch] || 1, 1);
    share = snackRows[arch]?.vendor_share ?? 0.25;
  } else {
    slots = Math.max(capacity.snackSlots || 1, 1);
    share = 1;
  }
  const buyers = capacity.snackBuyersEst || 0;
  const expectedGross = (buyers * share / slots) * 8;
  const viability = fee * mult;
  return expectedGross >= viability ? 1 : Math.max(0, expectedGross / viability);
}

function selectByArchetype(classified, capacity, needWeights, allowedArchetypes, scoringPool = classified, selectionContext = {}, scoreFn = null) {
  const slotsBy = capacity.slotsByArchetype;
  const EX = { boba_milk_tea: "bev1", sugarcane_fruit_refresher: "bev2" };
  const accepted = [];
  const waitlisted = [];
  const byArch = {};

  classified.forEach((a) => {
    const arch = selectionArchetypeId(a) || "unclassified";
    if (!allowedArchetypes.has(arch)) {
      a.recommended_action = "waitlist";
      a.action_reason = "wrong_lane";
      waitlisted.push(a);
      return;
    }
    (byArch[arch] = byArch[arch] || []).push(a);
  });

  const exclusivityFilled = new Set();

  Object.entries(byArch).forEach(([arch, group]) => {
    const slotCap = arch === "unclassified" ? 0 : (slotsBy[arch] || 0);
    group.forEach((a) => {
      const snackLane = scoreFn === snackRoiScore || scoreFn === scoreSnackApplicant;
      if (snackLane) {
        a.score = scoreSnackApplicant(a, capacity, needWeights, scoringPool, selectionContext);
      } else {
        a.score = scoreApplicant(a, capacity, needWeights, scoringPool, selectionContext);
      }
      a._dep = depositTs(a.deposit_applied_at);
    });
    group.sort((x, y) => {
      if (scoreFn === snackRoiScore || scoreFn === scoreSnackApplicant) {
        return snackSelectionRank(y) - snackSelectionRank(x) || x._dep - y._dep;
      }
      return y.score.total - x.score.total || x._dep - y._dep;
    });
    let taken = 0;
    group.forEach((a) => {
      const exGroup = EX[arch];
      if (exGroup && exclusivityFilled.has(exGroup) && taken >= slotCap) {
        a.recommended_action = "waitlist";
        a.action_reason = "exclusivity_full";
        waitlisted.push(a);
        return;
      }
      if (taken < slotCap) {
        a.recommended_action = "accept";
        a.action_reason = "menu_fit_rank";
        accepted.push(a);
        taken += 1;
        if (exGroup) exclusivityFilled.add(exGroup);
      } else {
        a.recommended_action = "waitlist";
        a.action_reason = "category_full";
        waitlisted.push(a);
      }
    });
  });

  return { accepted, waitlisted };
}

function selectSnacksCoverageFirst(classified, capacity, selectionContext = {}) {
  const slotsBy = capacity.slotsByArchetype || {};
  const globalCap = capacity.snackSlots || 0;
  const accepted = [];
  const waitlisted = [];
  const takenByArch = {};
  const decided = new Set();
  const byArch = {};

  classified.forEach((a) => {
    const arch = selectionArchetypeId(a) || "unclassified";
    if (!SNACK_ARCHETYPE_IDS.has(arch)) {
      waitlisted.push({ ...a, recommended_action: "waitlist", action_reason: "wrong_lane" });
      decided.add(a.id);
      return;
    }
    const enriched = {
      ...a,
      score: scoreSnackApplicant(a, capacity, mergeNeedWeights(selectionContext), classified, selectionContext),
      _dep: depositTs(a.deposit_applied_at),
    };
    (byArch[arch] = byArch[arch] || []).push(enriched);
  });

  Object.values(byArch).forEach((group) => {
    group.sort((x, y) => snackSelectionRank(y) - snackSelectionRank(x) || x._dep - y._dep);
  });

  [...SNACK_ARCHETYPE_IDS].sort().forEach((arch) => {
    const group = byArch[arch] || [];
    if (!group.length || accepted.length >= globalCap || (slotsBy[arch] || 0) <= 0) return;
    const pick = group[0];
    pick.recommended_action = "accept";
    pick.action_reason = "snack_coverage_first";
    accepted.push(pick);
    takenByArch[arch] = (takenByArch[arch] || 0) + 1;
    decided.add(pick.id);
  });

  Object.entries(byArch).forEach(([arch, group]) => {
    const archCap = slotsBy[arch] || 0;
    group.forEach((a) => {
      if (decided.has(a.id)) return;
      if (accepted.length >= globalCap) {
        a.recommended_action = "waitlist";
        a.action_reason = "snack_cap_full";
        waitlisted.push(a);
        return;
      }
      if ((takenByArch[arch] || 0) < archCap) {
        a.recommended_action = "accept";
        a.action_reason = "snack_roi_rank";
        accepted.push(a);
        takenByArch[arch] = (takenByArch[arch] || 0) + 1;
      } else {
        a.recommended_action = "waitlist";
        a.action_reason = "category_full";
        waitlisted.push(a);
      }
    });
  });

  return { accepted, waitlisted };
}

export function selectRoster(applicants, capacity, selectionContext = {}) {
  const needWeights = mergeNeedWeights(selectionContext);
  const snackCap = capacity.snackSlots || 0;

  const openPrepPool = applicants.filter((a) => a.status !== "rejected" && isOpenPrepVendor(a));
  const drinksPool = applicants.filter((a) => a.status !== "rejected" && isDrinksVendor(a));
  const snackPool = applicants.filter((a) => a.status !== "rejected" && isSnackVendor(a));
  const takeHomePool = applicants.filter((a) => a.status !== "rejected" && isTakeHomeVendor(a));

  const openPrepClassified = openPrepPool.map((a) => attachRecommendedMenu(classifyApplicant(a), needWeights));
  const drinksClassified = drinksPool.map((a) => attachRecommendedMenu(classifyApplicant(a), needWeights));
  const mealPool = [...openPrepClassified, ...drinksClassified];

  const openPrep = selectByArchetype(openPrepClassified, capacity, needWeights, OPEN_PREP_ARCHETYPE_IDS, mealPool, selectionContext);
  const drinks = selectByArchetype(drinksClassified, capacity, needWeights, DRINK_ARCHETYPE_IDS, mealPool, selectionContext);

  const covered = ensureNeedCoverage(
    [...openPrep.accepted, ...drinks.accepted],
    [...openPrep.waitlisted, ...drinks.waitlisted],
    needWeights,
  );
  const openPrepAccepted = covered.accepted.filter(isOpenPrepVendor);
  const drinksAccepted = covered.accepted.filter(isDrinksVendor);
  const openPrepWaitlisted = covered.waitlisted.filter(isOpenPrepVendor);
  const drinksWaitlisted = covered.waitlisted.filter(isDrinksVendor);

  const snackClassified = snackPool.map((a) => classifyApplicant(a));
  const snackCfg = snackPolicy(capacity, selectionContext);
  const snacks = snackCfg.coverage_first
    ? selectSnacksCoverageFirst(snackClassified, capacity, selectionContext)
    : selectByArchetype(
      snackClassified,
      capacity,
      needWeights,
      SNACK_ARCHETYPE_IDS,
      snackClassified,
      selectionContext,
      scoreSnackApplicant,
    );
  const snackAccepted = snacks.accepted;
  const snackWaitlisted = snacks.waitlisted;

  const manual = applicants.filter((a) => a.manual_accepted_2026);
  const accepted = [...openPrepAccepted, ...drinksAccepted];
  const waitlisted = [...openPrepWaitlisted, ...drinksWaitlisted];

  return {
    accepted,
    waitlisted,
    open_prep_accepted: openPrepAccepted,
    open_prep_waitlisted: openPrepWaitlisted,
    drinks_accepted: drinksAccepted,
    drinks_waitlisted: drinksWaitlisted,
    snack_accepted: snackAccepted,
    snack_waitlisted: snackWaitlisted,
    merchants: takeHomePool.map((a) => ({
      ...a,
      recommended_action: "merchant",
      action_reason: "merchant_exhibitor",
      requires_tff_pre_pkg: /pre[\s-]?packaged|sold\s*frozen|chili\s*oil/i.test(
        (a.capability_menu_items || []).map((i) => i.name).join(" "),
      ),
    })),
    summary: {
      accepted_count: accepted.length,
      waitlisted_count: waitlisted.length,
      open_prep_accepted_count: openPrepAccepted.length,
      open_prep_waitlisted_count: openPrepWaitlisted.length,
      drinks_accepted_count: drinksAccepted.length,
      drinks_waitlisted_count: drinksWaitlisted.length,
      snack_accepted_count: snackAccepted.length,
      snack_waitlisted_count: snackWaitlisted.length,
      merchant_pool_count: takeHomePool.length,
      merchant_tff_count: takeHomePool.filter((a) =>
        /pre[\s-]?packaged|sold\s*frozen|chili\s*oil/i.test(
          (a.capability_menu_items || []).map((i) => i.name).join(" "),
        ),
      ).length,
      manual_2026_count: manual.length,
      manual_2026_open_prep_count: manual.filter(isOpenPrepVendor).length,
      manual_2026_drinks_count: manual.filter(isDrinksVendor).length,
      manual_2026_meal_count: manual.filter(isMealVendor).length,
      manual_2026_snack_count: manual.filter(isSnackVendor).length,
      manual_2026_merchant_count: manual.filter(isTakeHomeVendor).length,
      manual_2026_merchant_tff_count: manual.filter(
        (a) => isTakeHomeVendor(a) && /pre[\s-]?packaged|sold\s*frozen|chili\s*oil/i.test(
          (a.capability_menu_items || []).map((i) => i.name).join(" "),
        ),
      ).length,
      target_open_prep_slots: capacity.openPrepSlots ?? 0,
      target_drink_slots: capacity.drinkSlots ?? 0,
      target_meal_slots: capacity.mealSlots ?? capacity.foodSlots,
      target_snack_slots: snackCap,
      target_food_slots: capacity.foodSlots,
    },
  };
}

function applicantMenuItems(applicant) {
  const cap = applicant.capability_menu_items;
  if (cap?.length) return cap;
  return applicant.signature_menu_items || [];
}

export function countItemsCoveringNeed(applicant, needId, vendorLevel = false) {
  const items = applicantMenuItems(applicant);
  if (!items.length) return 0;
  if (vendorLevel) {
    const vendorHas = (applicant.dietary || []).map(normalizeNeedTag).includes(needId);
    return vendorHas ? items.length : 0;
  }
  return items.filter((item) =>
    (item.dietary_tags || []).map(normalizeNeedTag).includes(needId),
  ).length;
}

export function needsCoverageRows(needProfile, rosterApplicants, options = {}) {
  const itemsSource = options.itemsSource || "capability";
  const needWeights = mergeNeedWeights(needProfile);
  const catalog = needProfile?.need_catalog || [];
  const catalogById = Object.fromEntries(catalog.map((n) => [n.id, n]));

  const orderedIds = catalog.length
    ? catalog.map((c) => c.id).filter((id) => needWeights[id] != null)
    : Object.keys(needWeights);

  return orderedIds.map((id) => {
    const entry = catalogById[id];
    let itemCount = 0;
    let vendorCount = 0;
    for (const a of rosterApplicants || []) {
      if (vendorCoversNeed(a, id, { vendorLevel: entry?.vendor_level, itemsSource })) {
        vendorCount += 1;
      }
      itemCount += countPublishedItemsCoveringNeed(a, id, {
        vendorLevel: entry?.vendor_level,
        itemsSource,
      });
    }
    const regionalPct = needWeights[id] ?? 0;
    return {
      id,
      name: entry?.label || id.replace(/_/g, " "),
      regional_pct: regionalPct,
      item_count: itemCount,
      vendor_count: vendorCount,
      status: coverageStatus(itemCount, vendorCount, regionalPct),
    };
  });
}

export function gapAnalysis(selected, needProfile, allApplicants) {
  const accepted = selected.accepted || [];
  const needWeights = mergeNeedWeights(needProfile);
  const poolGaps = [];
  Object.entries(needWeights).forEach(([tag, weight]) => {
    const acceptedHas = accepted.some((a) => applicantNeedTags(a).has(tag));
    const poolHas = (allApplicants || []).some((a) => applicantNeedTags(a).has(tag));
    if (!acceptedHas && weight >= 0.05) {
      poolGaps.push({
        tag,
        weight,
        pool_has_applicant: poolHas,
        rationale: poolHas
          ? `No ${tag} in accepted roster — engine may promote via need coverage (~${(weight * 100).toFixed(0)}% regional need)`
          : `No ${tag} in pool or roster (~${(weight * 100).toFixed(0)}% regional need) — recruit`,
      });
    }
  });
  return { pool_gaps: poolGaps, recruitment_recommendations: poolGaps };
}

export function buildOfferLetter(applicant, festivalName, offeredIds) {
  const cap = Object.fromEntries((applicant.capability_menu_items || []).map((i) => [i.item_id, i]));
  const items = offeredIds.map((id) => cap[id]).filter(Boolean);
  const menuLines = items.map((it) => `- ${it.name}${it.price ? ` — $${it.price}` : ""}`).join("\n");
  const letter = `We are pleased to offer **${applicant.business_name}** a slot at **${festivalName}**.

**Highly recommended festival menu** (from your capability — roster mix + ingredient planning):
${menuLines}

We publish this menu for guests. Focus prep here to reduce unused inventory; broader capability on the truck is fine if these items stay prioritized.

After the vendor accepts, they confirm what they will actually sell (they may remove items). **Only confirmed items appear on the festival food page** — that is how guests find you before they arrive.

Accept to proceed to booth fee payment. Decline releases waitlist position.`;
  return { offer_letter_md: letter, offered_menu_items: items, status: "draft" };
}

export function menuItemsForPublication(applicant, itemsSource = "offer_or_signature") {
  if (itemsSource === "capability") return applicant.capability_menu_items || [];
  const offer = applicant.conditional_offer || {};
  if (offer.status === "accepted" && offer.committed_menu_items?.length) {
    return offer.committed_menu_items;
  }
  return applicant.signature_menu_items || [];
}

const RETAIL_MERCHANT_RE =
  /\b(pre[\s-]?packaged|prepackaged|sold\s*frozen|\bfrozen\b|chili\s*oil|colombian\s+candy|freeze[\s-]?dried|(beef|wild\s+game).*jerky|jerky.*(beef|wild\s+game)|pre[\s-]?packaged\s+(cookies|dessert|treats|cand)|prepackaged\s+(dessert|treats))\b/i;

export function isRetailMerchantItem(name) {
  const n = (name || "").trim();
  return n.length > 0 && RETAIL_MERCHANT_RE.test(n);
}

export function filterOnsiteMenuItems(items) {
  return (items || []).filter((i) => !isRetailMerchantItem(i.name));
}

function publishedMenuItems(applicant, itemsSource = "offer_or_signature") {
  if (itemsSource === "capability") return applicant.capability_menu_items || [];
  return menuItemsForPublication(applicant, itemsSource);
}

export function vendorCoversNeed(applicant, needId, { vendorLevel = false, itemsSource = "offer_or_signature" } = {}) {
  if (vendorLevel) {
    return (applicant.dietary || []).map(normalizeNeedTag).includes(needId);
  }
  return filterOnsiteMenuItems(publishedMenuItems(applicant, itemsSource)).some((item) =>
    (item.dietary_tags || []).map(normalizeNeedTag).includes(needId),
  );
}

export function countPublishedItemsCoveringNeed(applicant, needId, { vendorLevel = false, itemsSource = "offer_or_signature" } = {}) {
  const items = filterOnsiteMenuItems(publishedMenuItems(applicant, itemsSource));
  if (!items.length) return 0;
  if (vendorLevel) {
    return vendorCoversNeed(applicant, needId, { vendorLevel: true, itemsSource }) ? items.length : 0;
  }
  return items.filter((item) =>
    (item.dietary_tags || []).map(normalizeNeedTag).includes(needId),
  ).length;
}

function coverageStatus(itemCount, vendorCount, regionalPct) {
  if (itemCount <= 0 && vendorCount <= 0) return "gap";
  if (vendorCount <= 1 || itemCount <= 2) return "limited";
  if (regionalPct >= 0.06 && itemCount <= 3) return "limited";
  return "well_served";
}

export function rosterCoverageRows(roster, needProfile, { itemsSource = "offer_or_signature" } = {}) {
  const needWeights = mergeNeedWeights(needProfile);
  const catalog = needProfile?.need_catalog || [];
  const catalogById = Object.fromEntries(catalog.map((n) => [n.id, n]));
  const orderedIds = catalog.length
    ? catalog.map((c) => c.id).filter((id) => needWeights[id] != null)
    : Object.keys(needWeights);
  const mealRoster = (roster || []).filter((a) => !isTakeHomeVendor(a));

  return orderedIds.map((id) => {
    const entry = catalogById[id] || {};
    const vendorLevel = Boolean(entry.vendor_level);
    let itemCount = 0;
    let vendorCount = 0;
    for (const applicant of mealRoster) {
      if (vendorCoversNeed(applicant, id, { vendorLevel, itemsSource })) vendorCount += 1;
      itemCount += countPublishedItemsCoveringNeed(applicant, id, { vendorLevel, itemsSource });
    }
    const regionalPct = needWeights[id] ?? 0;
    const status = coverageStatus(itemCount, vendorCount, regionalPct);
    return {
      id,
      label: entry.label || id.replace(/_/g, " "),
      vendor_level: vendorLevel,
      regional_pct: regionalPct,
      item_count: itemCount,
      vendor_count: vendorCount,
      status,
      recruiting: (status === "gap" || status === "limited") && regionalPct >= 0.05,
    };
  });
}

function coverageSummary(rows, maxItems = 6) {
  if (!rows?.length) return "";
  const parts = [];
  for (const row of rows) {
    if (row.status === "gap" && row.regional_pct >= 0.05) {
      parts.push(`limited ${row.label.toLowerCase()} (recruiting)`);
    } else if (row.status === "limited" && row.regional_pct >= 0.05) {
      const n = row.vendor_level ? row.vendor_count : row.item_count;
      const unit = row.vendor_level ? "vendor" : "option";
      parts.push(`${n} ${row.label.toLowerCase()} ${unit}${n === 1 ? "" : "s"}`);
    } else if (row.status === "well_served" && row.regional_pct >= 0.05) {
      const n = row.vendor_level ? row.vendor_count : row.item_count;
      if (n > 0) {
        const unit = row.vendor_level ? "vendors" : "options";
        parts.push(`${n} ${row.label.toLowerCase()} ${unit}`);
      }
    }
  }
  if (!parts.length) {
    const covered = rows.filter((r) => r.item_count > 0 || r.vendor_count > 0);
    parts.push(
      ...covered.slice(0, maxItems).map((r) => `${r.item_count || r.vendor_count} ${r.label.toLowerCase()}`),
    );
  }
  return parts.slice(0, maxItems).join(" · ");
}

export function publishRosterCoverage(roster, needProfile, options = {}) {
  const itemsSource = options.itemsSource || "offer_or_signature";
  const rows = rosterCoverageRows(roster, needProfile, { itemsSource });
  const gaps = rows.filter((r) => r.status === "gap" && r.regional_pct >= 0.05);
  const limited = rows.filter((r) => r.status === "limited" && r.regional_pct >= 0.05);
  return {
    computed_at: options.computedAt || new Date().toISOString(),
    menu_basis: itemsSource === "offer_or_signature" ? "committed" : itemsSource,
    summary: coverageSummary(rows),
    needs: rows,
    gap_count: gaps.length,
    limited_count: limited.length,
    recruiting: rows.filter((r) => r.recruiting).map((r) => r.id),
  };
}

export function publishPublicMenu(roster, festivalName, options = {}) {
  const itemsSource = options.itemsSource || "offer_or_signature";
  const vendors = roster
    .filter((a) => !isTakeHomeVendor(a))
    .filter((a) => {
      const st = a.conditional_offer?.status;
      if (st === "committed" || st === "accepted") return true;
      return a.manual_accepted_2026 || a.recommended_action === "accept";
    })
    .map((a) => {
      const raw = menuItemsForPublication(a, itemsSource);
      const items = filterOnsiteMenuItems(raw);
      return {
        id: a.id,
        name: a.business_name,
        booth_label: a.booth_label,
        booth_kind: a.booth_kind,
        vendor_class: a.vendor_class || a.vendor_role,
        dietary: a.dietary || [],
        items: items.map((it) => ({
          name: it.name,
          price: it.price,
          category: it.category || "meals",
          allergens: it.allergens || [],
          dietary_tags: it.dietary_tags || [],
          dietary_warnings: it.dietary_warnings || [],
        })),
      };
    })
    .filter((v) => v.items.length);
  const result = {
    festival: festivalName,
    published_at: new Date().toISOString().slice(0, 10),
    disclaimer: "Menu subject to change. Filters reflect vendor self-report — not medical advice.",
    vendors,
    filter_facets: [
      "nut_free", "gluten_free", "dairy_free",
      "vegan", "vegetarian", "halal", "pork_free",
      "mild_spice", "kid_friendly", "easy_chew", "lower_sugar",
    ],
  };
  if (options.needProfile) {
    result.roster_coverage = publishRosterCoverage(roster, options.needProfile, {
      itemsSource,
    });
  }
  return result;
}

export function runEngine(config, applicants, needProfile) {
  const capacity = capacityPlan(config);
  const selectionContext = buildSelectionContext(config, needProfile);
  const selection = selectRoster(applicants, capacity, selectionContext);
  const gaps = gapAnalysis(selection, selectionContext, applicants);
  return { config, capacity, selection, gaps };
}

const FOLLOWER_MILESTONES = [1000, 10000, 100000];

function weightedScoreGain(weights, component, componentDelta) {
  return Math.round((weights[component] || 0) * Math.max(0, componentDelta) * 10000) / 10000;
}

export function formatWeightedGain(gain) {
  if (gain == null || gain <= 0) return "";
  const pts = Math.round(gain * SCORE_DISPLAY_SCALE);
  return `~+${pts.toLocaleString()} pts`;
}

function improvementTask(id, fields) {
  return { id, task_type: "structural", ...fields };
}

export function foodCapabilityItems(applicant) {
  const capability = applicant.capability_menu_items || [];
  const primary = selectionArchetypeId(applicant)
    || inferPrimaryFromCapability(
      capability,
      applicant.primary_archetype_id,
      applicant.vendor_class || applicant.vendor_role,
    );
  const food = capability.filter((i) => !isCommoditySideItem(i.name, primary));
  return food.length ? food : [...capability];
}

function socialReachTasks(applicant, weight, components) {
  if (weight <= 0) return [];
  const { handle, followers } = applicantInstagramMeta(applicant);
  const current = components.social_reach ?? socialReachScore(applicant);
  const tasks = [];

  if (!handle) {
    const componentDelta = Math.max(0.15, 1 - current);
    const gain = weightedScoreGain({ social_reach: weight }, "social_reach", componentDelta);
    const gainNote = formatWeightedGain(gain);
    tasks.push(improvementTask("add_instagram", {
      component: "social_reach",
      priority: weight >= 0.08 ? "high" : "medium",
      title: "Add a business Instagram handle",
      detail:
        "Social reach scores 0 without an Instagram on file. "
        + "Create a business account if needed, then add the handle to your application."
        + (gainNote ? ` Estimated lift: ${gainNote}.` : ""),
      eventeny_hint: "Enter your Instagram handle on the Eventeny vendor application.",
      estimated_gain: gain || null,
    }));
    return tasks;
  }

  if (followers <= 0) {
    const componentDelta = Math.max(0, 0.33 - current);
    const gain = weightedScoreGain({ social_reach: weight }, "social_reach", componentDelta);
    tasks.push(improvementTask("confirm_instagram_followers", {
      component: "social_reach",
      priority: "medium",
      title: "Confirm Instagram follower count",
      detail:
        `Handle ${JSON.stringify(handle)} is on file but follower count is missing — `
        + "we score conservatively until reach is verified. Ask staff to update after you share stats."
        + (gain > 0.001 ? ` Estimated lift: ${formatWeightedGain(gain)}.` : ""),
      estimated_gain: gain > 0.001 ? gain : null,
    }));
    return tasks;
  }

  for (const milestone of FOLLOWER_MILESTONES) {
    if (followers >= milestone) continue;
    const targetScore = Math.max(0, Math.min(1, (Math.log10(milestone) - 2) / 3));
    const componentDelta = targetScore - current;
    const gain = weightedScoreGain({ social_reach: weight }, "social_reach", componentDelta);
    if (gain < 0.002) break;
    tasks.push(improvementTask("grow_instagram_followers", {
      component: "social_reach",
      priority: milestone <= 10000 ? "medium" : "low",
      title: `Grow Instagram toward ${milestone.toLocaleString()} followers`,
      detail:
        `Currently ~${followers.toLocaleString()} followers. `
        + `About ${milestone.toLocaleString()} followers adds ${formatWeightedGain(gain)} `
        + `(social reach is ${(weight * 100).toFixed(0)}% of total).`,
      estimated_gain: gain,
    }));
    break;
  }
  return tasks;
}

function capabilityTasks(applicant, components, weights) {
  const boothKind = applicant.booth_kind || "open_cooking";
  const limit = applicant.signature_limit || signatureLimitForBooth(boothKind);
  const food = foodCapabilityItems(applicant);
  const capCount = food.length;
  const sigCount = (applicant.signature_menu_items || []).length;
  const tasks = [];

  if (capCount < limit) {
    const primary = selectionArchetypeId(applicant)
      || inferPrimaryFromCapability(
        applicant.capability_menu_items || [],
        undefined,
        applicant.vendor_class || applicant.vendor_role,
      );
    const commodity = (applicant.capability_menu_items || []).filter(
      (i) => isCommoditySideItem(i.name, primary),
    );
    const commodityNote = commodity.length
      ? " Bottled water, soda, and similar sides may stay on your list — they are ignored for menu-fit scoring."
      : "";
    const currentMf = components.menu_fit ?? 0.5;
    const mfWeight = weights.menu_fit ?? 0.3;
    const targetMf = Math.min(0.9, currentMf + 0.2 * (limit - capCount) / Math.max(limit, 1));
    const mfGain = weightedScoreGain(weights, "menu_fit", targetMf - currentMf);
    const mfGainNote = formatWeightedGain(mfGain);
    tasks.push(improvementTask("expand_capability_menu", {
      component: "menu_fit",
      priority: "high",
      title: `List at least ${limit} food capability items (${capCount} scored now)`,
      detail:
        `The engine picks up to ${limit} food items from capability for menu-fit scoring. `
        + "More distinct dishes (with accurate dietary tags) improve roster fit."
        + commodityNote
        + (mfGainNote ? ` Estimated lift: ${mfGainNote} (menu fit is ${(mfWeight * 100).toFixed(0)}% of total).` : ""),
      eventeny_hint:
        `Eventeny Q1 — list your full capability menu (${limit}+ food dishes for scoring; water/soda are fine to include). ${
          capCount <= limit
            ? "Signatures (Q2) are optional when you have five or fewer food items."
            : "Signatures (Q2) — pick up to five highlights if you list more than five food items."
        }`,
      estimated_gain: mfGain >= 0.002 ? mfGain : null,
    }));
  }

  if (capCount > limit && sigCount === 0) {
    tasks.push(improvementTask("pick_signatures", {
      component: "menu_fit",
      priority: "high",
      title: `Choose up to ${limit} signature items`,
      detail:
        `You listed ${capCount} capability items. `
        + `Pick up to ${limit} signatures so guests and staff know your festival focus.`,
      eventeny_hint:
        `Eventeny Q2 — required when capability exceeds ${limit} items; choose your festival highlights.`,
    }));
  } else if (capCount <= limit && sigCount > 0) {
    tasks.push(improvementTask("signatures_optional", {
      component: "application",
      priority: "low",
      title: "Signatures are optional for your menu size",
      detail:
        `With ${capCount} capability item${capCount === 1 ? "" : "s"}, `
        + "the engine can score your full menu — signatures are only required above five items.",
      eventeny_hint: EVENTENY_FORM_HELP,
    }));
  }
  return tasks;
}

function menuFitTasks(applicant, needWeights, components) {
  if (!needWeights || !Object.keys(needWeights).length) return [];
  const current = components.menu_fit ?? 1;
  if (current >= 0.95) return [];

  const have = new Set();
  (applicant.capability_menu_items || []).forEach((item) => {
    (item.dietary_tags || []).forEach((t) => have.add(normalizeNeedTag(t)));
  });
  (applicant.dietary || []).forEach((d) => have.add(normalizeNeedTag(d)));

  const missing = Object.entries(needWeights)
    .filter(([tag, weight]) => weight >= 0.05 && !have.has(tag))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const tasks = [];
  if (missing.length) {
    const labels = missing.map(([t]) => t.replace(/_/g, " ")).join(", ");
    tasks.push(improvementTask("add_regional_need_tags", {
      component: "menu_fit",
      priority: "medium",
      title: "Add items that match regional attendee needs",
      detail:
        `Capability is missing high-priority tags: ${labels}. `
        + "Add or tag dishes that fit these needs (e.g. vegetarian plate, mild kid-friendly item). "
        + "Roster scarcity changes as vendors commit menus — see the festival food page for live coverage.",
      eventeny_hint: "Eventeny Q1 — list dishes and note dietary fit in item descriptions.",
      task_type: "market",
    }));
  }

  const halalW = needWeights.halal_certified || 0;
  if (halalW >= 0.06 && !have.has("halal_certified")) {
    tasks.push(improvementTask("halal_certification", {
      component: "menu_fit",
      priority: "high",
      title: "Add Halal certification if applicable",
      detail:
        `Halal-certified booths score strongly (~${Math.round(halalW * 100)}% regional need). `
        + "Upload certification or attest booth-wide Halal prep on the application. "
        + "Value drops as other vendors fill this need — check the live roster board on the festival food page.",
      eventeny_hint: "Eventeny — vendor-level Halal attestation or cert upload.",
      task_type: "market",
    }));
  }
  return tasks;
}

function brandFocusTasks(applicant, components, weights) {
  const focus = components.brand_focus ?? 1;
  if (focus >= 0.85) return [];
  const spread = applicant.recommended_archetype_spread ?? applicant.archetype_spread ?? 0;
  if (spread <= 2) return [];
  const primary = selectionArchetypeId(applicant) || applicant.primary_archetype_id || "your primary style";
  const bfWeight = weights.brand_focus ?? 0.1;
  const gain = weightedScoreGain(weights, "brand_focus", Math.min(0.85, 1) - focus);
  const gainNote = formatWeightedGain(gain);
  return [improvementTask("narrow_menu_focus", {
    component: "brand_focus",
    priority: "low",
    title: "Focus capability on one food style",
    detail:
      `Menu spans ${spread} throughput styles. `
      + `Prioritize ${String(primary).replace(/_/g, " ")} items in capability and signatures.`
      + (gainNote ? ` Estimated lift: ${gainNote} (brand focus is ${(bfWeight * 100).toFixed(0)}% of total).` : ""),
    estimated_gain: gain >= 0.002 ? gain : null,
  })];
}

function depositTask(applicant) {
  if (applicant.deposit_applied_at) return [];
  return [improvementTask("pay_deposit_early", {
    component: "tiebreaker",
    priority: "low",
    title: "Pay deposit when offered (tiebreaker)",
    detail:
      "Deposit timestamp does not change score components but breaks ties within "
      + "the same archetype bucket — earlier deposit wins at equal score.",
  })];
}

export function scoreImprovementTasks(applicant, needWeights, options = {}) {
  const vc = applicant.vendor_class || applicant.vendor_role;
  if (vc === "merchant") return [];

  const selectionContext = options.selectionContext || {};
  const score = options.score || {};
  const components = score.components || {};
  const weights = score.weights || resolveScoringWeights(selectionContext);

  const tasks = [
    ...socialReachTasks(applicant, weights.social_reach || 0, components),
    ...capabilityTasks(applicant, components, weights),
    ...menuFitTasks(applicant, needWeights, components),
    ...brandFocusTasks(applicant, components, weights),
    ...depositTask(applicant),
  ];

  const prio = { high: 0, medium: 1, low: 2 };
  tasks.sort((a, b) => {
    const pd = (prio[a.priority] ?? 9) - (prio[b.priority] ?? 9);
    if (pd !== 0) return pd;
    return (b.estimated_gain || 0) - (a.estimated_gain || 0);
  });
  return tasks;
}
