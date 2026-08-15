/** Festival cuisine lanes for public menu “By cuisine” browse. */

/** Meal cuisine lanes, then Snacks, then Drinks (format buckets). */
export const CUISINE_ORDER = [
  "vietnamese",
  "chinese",
  "filipino",
  "lao_thai",
  "japanese_korean",
  "asian",
  "mexican_latin",
  "mediterranean",
  "american",
  "fusion",
  "other",
  "snacks",
  "sweets",
  "drinks",
];

export const CUISINE_LABELS = {
  vietnamese: "Vietnamese",
  chinese: "Chinese",
  filipino: "Filipino",
  lao_thai: "Lao / Thai",
  japanese_korean: "Japanese / Korean",
  asian: "Asian",
  mexican_latin: "Mexican / Latin",
  mediterranean: "Mediterranean",
  american: "American / fair classics",
  fusion: "Fusion",
  other: "Other",
  snacks: "Snacks",
  sweets: "Sweets",
  drinks: "Drinks",
};

/** Meal-only cuisine ids (snacks/sweets/drinks are format sections). */
export const MEAL_CUISINE_IDS = [
  "vietnamese",
  "chinese",
  "filipino",
  "lao_thai",
  "japanese_korean",
  "asian",
  "mexican_latin",
  "mediterranean",
  "american",
  "fusion",
  "other",
];

/** Specific Asian lanes — preferred over pan-Asian when vendor disambiguates. */
const SPECIFIC_ASIAN_IDS = new Set([
  "vietnamese",
  "chinese",
  "filipino",
  "lao_thai",
  "japanese_korean",
]);

/** Item-name rules — most specific first. */
const ITEM_RULES = [
  [
    "vietnamese",
    // Avoid trailing \b — breaks on Vietnamese diacritics (bánh mì, etc.).
    /(?:^|[^A-Za-z])(ph[oở]|b[aá]nh\s*m[iì]|b[aá]nh\s*tr[aá]ng|b[aá]nh\s*x[eẻ]o|c[oơ]m\b|b[uú]n\b|h[uủ]\s*ti[eế]u|ch[aả]\s*gi[oò]|g[oỏ]i\s*cu[oố]n|viet(?:namese)?(?:\s+coffee|\s+iced)?|c[aà]\s*ph[eê]|bo\s*luc\s*lac|b[oò]\s*l[uú]c\s*l[aá]c|lemongrass\s+(steak|chicken|pork)|bun\s*bo)/i,
  ],
  [
    "lao_thai",
    /\b(pad\s*thai|papaya\s*salad|som\s*tum|lao\s+sausage|larb|laab|tom\s*yum|green\s*curry|panang|thai\s+(tea|ice\s*tea|iced\s*tea|basil)|khao\s*(poon|piak)|phat\s*(kengo|paa\s*pao)|chicken\s+basil|basil\s+with\s+fried\s+egg)\b/i,
  ],
  [
    "filipino",
    /\b(sisig|lumpia|tocino|lechon|adobo|longanisa|longganisa|pancit|halo[\s-]?halo|calamansi|ube\b|buko|pandan|sago|puto|balut|gang\s*wangs?)\b/i,
  ],
  [
    "chinese",
    /\b(chow\s*mein|orange\s*chicken|general\s*tso|kung\s*pao|mongolian|siu\s*mai|dim\s*sum|wonton|lo\s*mein|chinese)\b/i,
  ],
  [
    "japanese_korean",
    /\b(teriyaki|musubi|katsu|bulgogi|korean\s+corn\s*dogs?|korean\s+cheesedogs?|cheese\s*dogs?|ramen|sushi|gyoza|bibimbap|tonkatsu|japchae|korean\s+bbq)\b/i,
  ],
  [
    "mexican_latin",
    /\b(tacos?|elote|carnitas|aguas?\b|horchata|pupusas?|nachos?|burrito|quesadillas?|tamales?|asada|churro|fruit\s*cups?|corn\s*cups?|pitaya|mangonada|huaraches?)\b/i,
  ],
  [
    "mediterranean",
    /\b(gyros?|shawarma|falafel|hummus|(?:chicken|lamb)\s+over\s+rice)\b/i,
  ],
  [
    "american",
    /\b(funnel\s*cakes?|potato\s*swirls?|turkey\s*legs?|loaded\s*fries|garlic\s*fries|french\s*fries|corn\s*dogs?|hot\s*dogs?|tri[\s-]?tip|brisket|pulled\s*pork|spareribs|spare\s*ribs|(?:bbq\s+)?(?:beef\s+or\s+pork\s+)?ribs\b|hot\s*links?|hotlinks?|jambalaya|dirty\s*rice|mac\s*&\s*cheese|mac\s*and\s*cheese|collard\s*greens|gumbo|southern\s+fried|fried\s+or\s+baked\s+chicken|baked\s*potato|wings?\b|drumstick|chicken\s*legs?|polish|cajun|cotton\s*candy|cheeseburgers?|pizza)\b/i,
  ],
  ["fusion", /\bfusion\b/i],
];

/**
 * Pan-Asian generics (DoorDash-style “Asian”) — after specific cuisine rules.
 * Prefer a specific Asian vendor lane when the name is also ambiguous.
 */
const ASIAN_GENERIC_RE =
  /\b(fried\s*rice|noodle\s*soup|sticky\s*rice|garlic\s*noodles?|asian\s+sausages?|curry\s+noodles?(?:\s+soup)?|fried\s+egg\s*(?:&|and)\s*steamed\s*rice|dragon\s*roll|kabobs?\s*sticks?|kebabs?\s*sticks?|pork\s+kabobs?(?:\s*sticks?)?|steamed\s*rice|rice\s*plates?)\b|^pork\s+belly(?:\s+over\s+rice)?$/i;

/** Commodity sides — never inherit vendor cuisine. */
const COMMODITY_SIDE_RE =
  /^(bottled\s+)?water$|^canned\s+soda$|^soda$|^(bottled\s+water|canned\s+soda)(\s*&\s*canned\s+soda)?$/i;

/**
 * Generic dish names where vendor is useful for disambiguation
 * (e.g. “Skewers” at Lien’s Chinese → Chinese).
 */
const AMBIGUOUS_DISH_PATTERNS = [
  /^(rice\s*plates?|noodles?|noodle\s*soup|fried\s*rice|skewers?|sausages?|meatballs?|wings?|fries|plates?|bowls?|combo|special|egg\s*rolls?)$/i,
  /rice\s+plates?$/i,
  /^(pork|chicken|beef|shrimp)([,&\s]+(pork|chicken|beef|shrimp))*\s*(&|and)?\s*(skewers?|sausages?|wings?)$/i,
  /^beef\s+sausages?$/i,
  /^(pork|chicken)\s*&\s*(chicken|beef|pork)\s+skewers?$/i,
  /^pork,\s*chicken\s*&\s*beef\s+skewers?$/i,
];

/** Vendor-name hints — only when the item name is ambiguous / pan-Asian generic. */
const VENDOR_RULES = [
  ["chinese", /lien'?s\s*chinese|\bchinese\b/i],
  ["filipino", /filipin|sisig|lumpia|lechon|baboy|pinorrito|rhome/i],
  ["lao_thai", /papaya\s*salad|thai\b|lao\b|stockton'?s\s*best|tiger\s*bite/i],
  ["mexican_latin", /pitayas?\s*locas|elote|taco|mexican|latin|\bmaiz\b/i],
  ["mediterranean", /ray'?s\s*kitchen|gyro|shawarma|halal\s*kitchen/i],
  ["japanese_korean", /\bkorean\b|teriyaki|musubi|ramen|bowli/i],
  ["vietnamese", /viet|saigon|\bpho\b|b[aá]nh|zummi/i],
  ["fusion", /\bfusion\b/i],
  [
    "american",
    /southern|soul\s*food|low\s*&\s*slow|\bbbq\b|barbecue|aroma\s*concessions|potato\s*swirl|rowe'?s|pizza\s*lovers|lizetta/i,
  ],
];

function isCommoditySide(name) {
  return COMMODITY_SIDE_RE.test(String(name || "").trim());
}

function isAmbiguousDishName(name) {
  const n = String(name || "").trim();
  if (!n || isCommoditySide(n)) return false;
  return AMBIGUOUS_DISH_PATTERNS.some((re) => re.test(n));
}

function isAsianGenericName(name) {
  return ASIAN_GENERIC_RE.test(String(name || "").trim());
}

function vendorCuisine(vendorName, { specificAsianOnly = false } = {}) {
  for (const [id, re] of VENDOR_RULES) {
    if (specificAsianOnly && !SPECIFIC_ASIAN_IDS.has(id)) continue;
    if (re.test(vendorName)) return id;
  }
  return null;
}

/**
 * Resolve meal cuisine lane (not snacks/drinks format buckets).
 * Item name first; vendor only to disambiguate generic dish names.
 * Pan-Asian generics → Asian (DoorDash-style), unless a specific Asian vendor applies.
 * Unclassified meals → Other. Fusion only when name/vendor/item says so.
 * Never inherit vendor cuisine for commodity sides (bottled water, canned soda).
 * @param {{ name?: string, category?: string, cuisine?: string }} item
 * @param {{ name?: string, cuisine?: string }} [vendor]
 */
export function classifyCuisine(item, vendor = {}) {
  // Item-level override only — do not blanket-apply vendor.cuisine to every line.
  if (item?.cuisine && MEAL_CUISINE_IDS.includes(item.cuisine)) return item.cuisine;
  // Legacy combined id
  if (item?.cuisine === "fusion_other") return "other";

  const name = String(item?.name || "");
  const vendorName = String(vendor?.name || "");

  if (isCommoditySide(name)) return "other";

  for (const [id, re] of ITEM_RULES) {
    if (re.test(name)) return id;
  }

  // Vendor is guidance for disambiguation, not a category stamp.
  if (isAmbiguousDishName(name)) {
    const fromVendor = vendorCuisine(vendorName);
    // Bare “Rice plates” are pan-Asian generics — don’t park them in Fusion
    // just because the booth is named Fusion Bites.
    if (fromVendor === "fusion" && /\brice\s*plates?\b/i.test(name)) {
      return "asian";
    }
    if (fromVendor) return fromVendor;
    if (/\brice\s*plates?\b/i.test(name)) return "asian";
  }

  // DoorDash-style pan-Asian bucket for generics (fried rice, sticky rice, …).
  if (isAsianGenericName(name)) {
    return vendorCuisine(vendorName, { specificAsianOnly: true }) || "asian";
  }

  return "other";
}

/**
 * Sections an item belongs to in By cuisine view.
 * Snacks / sweets appear in their cuisine lane **and** format section when cuisine is known.
 * Unclassified snacks/sweets stay under Snacks / Sweets only — not Other / Fusion.
 * Drinks appear only under Drinks (last).
 * @returns {string[]}
 */
export function cuisineSectionsForItem(item, vendor = {}) {
  const category = String(item?.category || "meals");
  if (category === "drinks" || isCommoditySide(item?.name)) return ["drinks"];
  const cuisine = classifyCuisine(item, vendor);
  if (category === "snacks" || category === "sweets") {
    if (cuisine === "other") return [category];
    return [cuisine, category];
  }
  return [cuisine];
}

/** Max length for public item notes (translation / flavors). */
export const ITEM_NOTE_MAX_LEN = 100;
