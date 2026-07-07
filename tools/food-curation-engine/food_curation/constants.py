"""Shared constants — archetypes, signature limits, classification keywords."""

from __future__ import annotations

# Open prep food — plates, handhelds, BBQ (throughput × order share).
OPEN_PREP_ARCHETYPES = [
    ("fast_handheld", "Fast handheld", 0.35, 32, "open", 750, 0,
     "Bánh mì, tacos, musubi, lumpia, elote"),
    ("rice_plates_bowls", "Rice plates & bowls", 0.27, 18, "open", 750, 0,
     "Sisig rice, tocino plate, teriyaki bowl"),
    ("noodle_wok_soup", "Noodle / wok / soup", 0.15, 12, "open", 750, 0,
     "Pad thai, chow mein, noodle soup"),
    ("bbq_smoke_carved", "BBQ / smoke / carved", 0.23, 14, "open", 750, 0,
     "Lechon, ribs, turkey leg, brisket plate"),
]

# Drinks — live-prep beverage anchors (separate buy rate + exclusivity caps).
DRINK_ARCHETYPES = [
    ("boba_milk_tea", "Boba / milk tea anchor", 0.58, 50, "drink", 500, 1,
     "Bobette Tea, Boba Meet Up (2026)"),
    ("sugarcane_fruit_refresher", "Sugarcane / fruit refresher anchor", 0.42, 55, "drink", 500, 1,
     "Sugarcane Hut, calamansi, aguas frescas (2026)"),
]

OPEN_PREP_ARCHETYPE_IDS = frozenset(a[0] for a in OPEN_PREP_ARCHETYPES)
DRINK_ARCHETYPE_IDS = frozenset(a[0] for a in DRINK_ARCHETYPES)

# Legacy combined list — open prep + drinks (budget scripts, backward compat).
FOOD_FLOW_ARCHETYPES = OPEN_PREP_ARCHETYPES + DRINK_ARCHETYPES

# Snack lane — vendor-count caps split by treat archetype (not meal throughput).
# Tuple: id, label, vendor_share, max_slots, booth_kind, fee, min_slots, examples
SNACK_ARCHETYPES = [
    ("packaged_savory", "Packaged savory", 0.20, 2, "prepack", 400, 0,
     "Jerky, chips, nuts"),
    ("packaged_sweets", "Packaged sweets", 0.30, 3, "prepack", 400, 0,
     "Candy, cookies, freeze-dried treats"),
    ("popcorn_fair", "Popcorn & fair treats", 0.25, 2, "prepack", 400, 0,
     "Kettle corn, cotton candy, caramel corn"),
    ("ice_treat", "Shaved ice & frozen treats", 0.25, 2, "prepack", 400, 0,
     "Snow cone, shaved ice, halo-halo"),
]

SNACK_ARCHETYPE_IDS = frozenset(a[0] for a in SNACK_ARCHETYPES)

SNACK_VENDOR_DEFAULTS = {
    "snack_buy_rate": 0.10,
    "buyers_per_vendor_weekend": 550,
    "max_vendors": 6,
    "booth_fee": 400,
    # Snacks are optional treats — prioritize archetype board over strict 3× fee rule.
    "viability_mult": 2.0,
    "coverage_first": True,
    # When coverage_first: total slots = max(demand-based, floor), capped at max_vendors.
    "coverage_floor_slots": 4,
}

# Live-prep drink lane — separate attendance buy rate from open prep meals.
DRINK_VENDOR_DEFAULTS = {
    "drink_buy_rate": 0.30,
    "items_per_buyer": 1.0,
}

# Take-home retail uses the merchant / exhibitor booth program (TFF PRE-PKG when sealed food).

# Booth fee tiers (2027 pricing TBD — placeholders for engine ROI).
BOOTH_FEE_TIERS = {
    "open_prep": 750,
    "drinks": 500,
    "snack": SNACK_VENDOR_DEFAULTS["booth_fee"],
    "merchant": 350,
    # Legacy keys
    "meal_open": 750,
    "meal_prepack_drink": 500,
    "take_home": 350,
}

EXCLUSIVITY_GROUPS = {
    "boba_milk_tea": "beverage_anchor_1",
    "sugarcane_fruit_refresher": "beverage_anchor_2",
}

SIGNATURE_LIMITS = {
    "open_cooking": 5,
    "food_truck": 5,
    "food_trailer": 5,
    "prepack": 8,
    "prepack_snacks": 10,
}

BOOTH_KIND_MAP = {
    "TFF PREP": "open_cooking",
    "MEV": "open_cooking",
    "MFF": "food_truck",
    "TFF PRE-PKG": "prepack",
    "FOOD TRUCK": "food_truck",
    "TRAILER/ FOOD TRUCK": "food_truck",
    "FOOD TRAILER": "food_truck",
    "BOOTH/ TRAILER": "food_truck",
}

# Staff UI displays scores as integers on this scale (internal math stays 0–1).
SCORE_DISPLAY_SCALE = 10_000

DEFAULT_SCORING_WEIGHTS = {
    "menu_fit": 0.30,
    "need_anchor": 0.10,
    "brand_focus": 0.10,
    "vendor_roi": 0.15,
    "demographic": 0.10,
    "social_reach": 0.05,
    "festival_legacy": 0.05,
    "policy_preference": 0.05,
    "deposit_fifo": 0.10,
}

# Map item-level dietary tags to vendor-level need keys in regional-need-profile.json.
NEED_TAG_ALIASES = {
    "halal": "halal_certified",
    "vegan": "vegan_options",
    "vegetarian": "vegetarian_options",
    "gluten_free": "gluten_free_options",
    "dairy_free": "dairy_free_options",
    "mild": "mild_spice",
    "low_spice": "mild_spice",
    "no_spice": "mild_spice",
    "mild_spice": "mild_spice",
    "kids": "kid_friendly",
    "kid_friendly": "kid_friendly",
    "soft": "easy_chew",
    "easy_chew": "easy_chew",
    "lower_sugar": "lower_sugar",
    "sugar_free": "lower_sugar",
    "unsweetened": "lower_sugar",
    "no_added_sugar": "lower_sugar",
}

NEED_COVERAGE_MIN_WEIGHT = 0.06
NEED_SWAP_MAX_SCORE_GAP = 0.15

AUDIENCE_PRESETS = {
    "family_general": {
        "food_buy_rate_delta": 0.0,
        "drink_buy_rate_delta": 0.0,
        "share_multipliers": {
            "rice_plates_bowls": 1.08,
            "fast_handheld": 1.05,
            "boba_milk_tea": 0.95,
        },
        "need_multipliers": {
            "kid_friendly": 1.25,
            "easy_chew": 1.15,
            "mild_spice": 1.10,
        },
        "scoring_weight_overrides": {
            "menu_fit": 0.33,
            "social_reach": 0.02,
            "festival_legacy": 0.05,
        },
    },
    "campus_foodie": {
        "food_buy_rate_delta": 0.06,
        "drink_buy_rate_delta": 0.04,
        "share_multipliers": {
            "boba_milk_tea": 1.12,
            "sugarcane_fruit_refresher": 1.08,
            "fast_handheld": 1.05,
            "rice_plates_bowls": 0.92,
        },
        "need_multipliers": {
            "kid_friendly": 0.50,
            "easy_chew": 0.75,
            "mild_spice": 0.90,
        },
        "scoring_weight_overrides": {
            "menu_fit": 0.30,
            "social_reach": 0.10,
        },
    },
}

# Keyword → archetype_id (first match wins; order matters)
ITEM_KEYWORDS: list[tuple[str, list[str]]] = [
    ("boba_milk_tea", ["boba", "milk tea", "bubble tea", "pearl tea", "matcha drink", "matcha latte", "vietnamese coffee"]),
    ("sugarcane_fruit_refresher", ["sugarcane", "calamansi", "fruit refresher", "aguas frescas", "aquas freseas", "mocktail"]),
    ("ice_treat", [
        "snow cone", "shaved ice", "halo halo", "halo-halo", "ube sago", "buko pandan",
        "sago dessert", "ice cream", "popsicle", "paletas",
    ]),
    ("popcorn_fair", [
        "cotton candy", "kettle corn", "caramel corn", "cheddar corn", "popcorn",
    ]),
    ("packaged_savory", [
        "jerky", "beef stick", "meat snack", "chips", "trail mix", "nuts", "crackers",
    ]),
    ("packaged_sweets", [
        "candy", "cookies", "freeze dried", "freeze-dried", "dessert treat", "sweets",
        "gummy", "chocolate", "brownie", "macaron",
    ]),
    ("fast_handheld", ["banh mi", "bánh mì", "taco", "musubi", "lumpia", "elote", "sandwich", "skewer", "corn dog", "cheesedog", "wonton taco", "egg roll", "eggroll", "potato swirl", "funnel cake", "tornado potato", "pizza", "sausage"]),
    ("rice_plates_bowls", ["rice plate", "over rice", "sisig", "tocino", "teriyaki bowl", "orange chicken bowl", "drumstick bowl", "basil with fried egg", "chicken basil", "adobo plate"]),
    ("noodle_wok_soup", ["noodle soup", "pad thai", "chow mein", "chowmein", "garlic noodle", "curry noodle", "pho", "khao poon", "wok", "fried rice"]),
    ("bbq_smoke_carved", ["lechon", "bbq", "barbecue", "brisket", "ribs", "turkey leg", "smoked", "pulled pork", "tri tip", "oxtail", "balut", "gumbo", "jambalaya"]),
]

CATEGORY_KEYWORDS = {
    "meals": ["rice", "plate", "bowl", "noodle", "soup", "bbq", "lechon", "sisig", "taco", "banh mi", "pizza", "gyro", "adobo"],
    "snacks": ["lumpia", "egg roll", "fries", "jerky", "musubi", "corn dog", "wings", "popcorn", "cotton", "elote", "nachos", "sago", "snow cone", "shaved ice"],
    "drinks": ["boba", "tea", "coffee", "juice", "sugarcane", "lemonade", "soda", "water", "refresher", "matcha"],
}

FILTER_FACETS = [
    "nut_free", "gluten_free", "dairy_free", "vegan", "vegetarian", "halal", "pork_free",
    "mild_spice", "kid_friendly", "easy_chew", "lower_sugar",
]
