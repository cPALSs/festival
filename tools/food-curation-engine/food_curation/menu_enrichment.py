"""Clean menu labels and infer dietary tags for guest filters."""

from __future__ import annotations

import re
from typing import Any

from food_curation.needs import normalize_need_tag

_NON_FOOD = re.compile(
    r"\b(banner|t-?shirt|sweater|merch|branded|hoodie|hat|souvenir|decoration)\b",
    re.I,
)
# Take-home retail — exclude from guest menus; merchant vendor_class.
_TAKEHOME_MERCHANT = re.compile(
    r"\b("
    r"sold\s*frozen|\bfrozen\b|"
    r"chili\s*oil|"
    r"meats?\s*&\s*seafood"
    r")\b",
    re.I,
)
# Optional walk-around packaged snacks — snack vendor_class, not meal throughput.
_SNACK_PREPACK = re.compile(
    r"\b("
    r"pre[\s-]?packaged|prepackaged|"
    r"colombian\s+candy|"
    r"freeze[\s-]?dried|"
    r"(beef|wild\s+game).*jerky|jerky.*(beef|wild\s+game)|"
    r"pre[\s-]?packaged\s+(cookies|dessert|treats|cand)|"
    r"prepackaged\s+(dessert|treats)|"
    r"\bjerky\b|\bcandy\b"
    r")\b",
    re.I,
)
# Legacy alias — take-home only (snacks stay on optional snack menus).
_RETAIL_MERCHANT = _TAKEHOME_MERCHANT
_JUNK = re.compile(r"^\.+$|^\?+$|^\.{2,}$")

# Per-vendor item_id or normalized-name overrides from seed cleanup JSON.
_LABEL_OVERRIDES: dict[str, dict[str, str]] = {}

_NUT_RISK = re.compile(
    r"\b(peanut|satay|pad\s*thai|pesto|almond|cashew|walnut|pecan|"
    r"hazelnut|pistachio|macadamia|mole|kare[\s-]?kare|adobo.*peanut)\b",
    re.I,
)
_GLUTEN_RISK = re.compile(
    r"\b(banh\s*mi|bánh\s*mì|bread|bun|sandwich|pizza|tortilla|lumpia|"
    r"egg\s*roll|chow\s*mein|chowmein|noodle(?!\s*soup)|pasta|waffle|"
    r"funnel\s*cake|pita|gyro|musubi|corndog|corn\s*dog|quesadilla|"
    r"nachos|cookie|korean\s*corn\s*dog|banh\s*trang)\b",
    re.I,
)
_DAIRY_RISK = re.compile(
    r"\b(cheese|queso|latte|cream|milk|butter|cheesedog|nachos|"
    r"birria|yogurt|ice\s*cream)\b",
    re.I,
)
_PORK = re.compile(
    r"\b(pork|bacon|ham|lechon|sisig|carnitas|chorizo|spareribs|"
    r"bbq\s*pork|pulled\s*pork|hot\s*dog|belly)\b",
    re.I,
)
_MEAT = re.compile(
    r"\b(chicken|beef|turkey|lamb|fish|shrimp|crawfish|meatball|"
    r"brisket|tri\s*tip|sausage|ribs|wings|drumstick|gyro)\b",
    re.I,
)
_VEGAN = re.compile(r"\b(vegan)\b", re.I)
# Latin / SEA cold drinks — parity with sugarcane juice for guest-filter tags.
_REFRESHER_DRINK = re.compile(
    r"\b("
    r"aguas?\s*frescas?|aquas?\s*freseas?|agua\s*fresca|"
    r"fruit\s*refresher|sugarcane|calamansi|mocktail|melon\s*refresher|"
    r"lemonade|pitaya|dragon\s*fruit|tamarindo|agua\s*de\s*jamaica|"
    r"watermelon\s*juice|mango\s*juice|fresh\s*fruit\s*juice"
    r")\b",
    re.I,
)
_FRUIT_CUP = re.compile(r"\b(fruit\s*cups?|fresh\s*fruit\s*cups?|cup\s*of\s*fruit)\b", re.I)
_VEGETARIAN = re.compile(
    r"\b(veggie|vegetable|all[\s-]?veggie|elote|papaya\s*salad|"
    r"margherita|"
    r"rice\s*paper\s*salad|banh\s*trang|bánh\s*tráng|"
    r"fried\s*banana|fruit\s*refresher|sugarcane|cotton\s*candy|"
    r"aguas?\s*frescas?|aquas?\s*freseas?|agua\s*fresca|calamansi|pitaya|"
    r"fruit\s*cups?|fresh\s*fruit\s*cups?)\b",
    re.I,
)
_PLANT_DRINK = re.compile(
    r"\b(coffee|tea|juice|water|soda|boba|matcha|refresher|sugarcane|"
    r"aguas?\s*frescas?|aquas?\s*freseas?|agua\s*fresca|calamansi|lemonade|pitaya)\b",
    re.I,
)
_SPICY = re.compile(
    r"\b(spicy|chili|chile|jalape|sriracha|cayenne|extra\s*hot|mapo|kimchi|hot\s*sauce)\b",
    re.I,
)
_HARD_CHEW = re.compile(
    r"\b(ribs|spareribs|turkey\s*leg|lechon|brisket|jerky|balut|whole\s*fish)\b",
    re.I,
)
_MILD_ITEM = re.compile(
    r"\b("
    r"pho|noodle\s*soup|congee|jook|plain\s*rice|steamed\s*rice|teriyaki|musubi|"
    r"banh\s*mi|bánh\s*mì|"
    r"corn\s*dog|hot\s*dog|cheese\s*pizza|pizza|snow\s*cone|cotton\s*candy|"
    r"fruit\s*refresher|sugarcane|mocktail|elote|fried\s*rice|steamed\s*bun|bao|"
    r"aguas?\s*frescas?|aquas?\s*freseas?|agua\s*fresca|calamansi|lemonade|pitaya"
    r")\b",
    re.I,
)
_EASY_CHEW = re.compile(
    r"\b("
    r"pho|noodle\s*soup|congee|jook|porridge|soup|steamed\s*bun|bao|soft\s*tofu|"
    r"teriyaki\s*bowl|over\s*rice|rice\s*plate|steamed\s*rice|"
    r"bun\s*thit|bún\s*thịt|bun\s*bo|bún\s*bo|vermicelli|garlic\s*noodles?"
    r")\b",
    re.I,
)
_KID_FRIENDLY = re.compile(
    r"\b("
    r"corn\s*dog|musubi|pizza|lumpia|elote|snow\s*cone|cotton\s*candy|"
    r"banh\s*mi|bánh\s*mì|egg\s*rolls?|fried\s*banana|"
    r"chicken\s*tender|nugget|plain\s*rice|fried\s*rice|hot\s*dog|"
    r"cheeseburger|fruit\s*refresher|sugarcane|mocktail|potato\s*swirl|"
    r"aguas?\s*frescas?|aquas?\s*freseas?|agua\s*fresca|fruit\s*cups?|pitaya"
    r")\b",
    re.I,
)
# Infer lower_sugar only when the menu name explicitly says so — not from savory guesses.
_LOWER_SUGAR = re.compile(
    r"\b("
    r"unsweetened|sugar[\s-]?free|no\s*added\s*sugar|zero\s*sugar|"
    r"diet\s*(soda|coke|drink)?|plain\s*water|^water$|black\s*coffee|"
    r"sugar[\s-]?free\s*boba|half\s*sugar|50\s*%\s*sugar|less\s*sugar|no\s*sugar"
    r")\b",
    re.I,
)


def _norm_key(s: str) -> str:
    return re.sub(r"\s+", " ", s.lower().strip())


def is_non_food_item(name: str) -> bool:
    n = name.strip()
    if not n or _JUNK.match(n):
        return True
    return bool(_NON_FOOD.search(n))


def is_takehome_merchant_item(name: str) -> bool:
    """Take-home retail — frozen packs, jarred sauces; not festival snack lane."""
    n = name.strip()
    if not n or _JUNK.match(n):
        return False
    return bool(_TAKEHOME_MERCHANT.search(n))


def is_snack_packaged_item(name: str) -> bool:
    """Optional packaged / treat items — snack vendor pool, not meal throughput."""
    n = name.strip()
    if not n or _JUNK.match(n):
        return False
    if is_takehome_merchant_item(n):
        return False
    return bool(_SNACK_PREPACK.search(n))


def is_retail_merchant_item(name: str) -> bool:
    """Alias for take-home merchant items (legacy name)."""
    return is_takehome_merchant_item(name)


def filter_onsite_menu_items(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Drop merch and take-home retail; keep meal + optional snack items."""
    return [
        i for i in items
        if not is_non_food_item(i.get("name", ""))
        and not is_takehome_merchant_item(i.get("name", ""))
    ]


# Tokens that stay uppercase inside sentence-cased item labels.
_ITEM_ACRONYMS = frozenset({"bbq", "us", "usa"})


def sentence_case_item_label(name: str) -> str:
    """First letter upper, remainder lower; preserve acronyms and unicode."""
    s = re.sub(r"\s+", " ", (name or "").strip())
    if not s:
        return s
    lower = s.lower()
    cased = lower[0].upper() + lower[1:] if len(lower) > 1 else lower.upper()
    for acr in _ITEM_ACRONYMS:
        cased = re.sub(rf"\b{re.escape(acr)}\b", acr.upper(), cased, flags=re.I)
    return cased


def clean_item_label(name: str, vendor_id: str = "", item_id: str = "") -> str:
    """Normalize display labels; apply vendor-specific overrides when present."""
    if item_id and vendor_id:
        vid_map = _LABEL_OVERRIDES.get(vendor_id, {})
        if item_id in vid_map:
            return sentence_case_item_label(vid_map[item_id])[:120]
        nk = _norm_key(name)
        if nk in vid_map:
            return sentence_case_item_label(vid_map[nk])[:120]

    label = name.strip()
    label = re.sub(r"^plus\s+", "", label, flags=re.I)
    label = re.sub(r"^and\s+", "", label, flags=re.I)
    label = re.sub(r"^including\s+", "", label, flags=re.I)
    label = re.sub(r"^or a\s+", "", label, flags=re.I)
    label = re.sub(r"\s+and\s*$", "", label, flags=re.I)
    label = re.sub(r"\bfreseas\b", "frescas", label, flags=re.I)
    label = re.sub(r"\bcops\b", "cups", label, flags=re.I)
    label = re.sub(r"\bcolumbian\b", "colombian", label, flags=re.I)
    label = re.sub(r"\bpop corn\b", "popcorn", label, flags=re.I)
    label = re.sub(r"\bpaop\b", "pao", label, flags=re.I)
    label = re.sub(r"\bsome tom papaya\b", "som tum papaya", label, flags=re.I)
    label = re.sub(r"\s*\.\s*$", "", label)
    label = re.sub(r"\?$", "", label)
    label = re.sub(r"\bw/\b", "with", label, flags=re.I)
    label = re.sub(r"\bw\s*$", "with veggies", label, flags=re.I)
    label = re.sub(r"\bconsume\b", "consommé", label, flags=re.I)
    label = re.sub(r"\bcofee\b", "coffee", label, flags=re.I)
    label = re.sub(r"\bjalepeno\b", "jalapeño", label, flags=re.I)
    label = re.sub(r"^legs$", "chicken legs", label, flags=re.I)
    label = re.sub(r"^eggrolls$", "egg rolls", label, flags=re.I)
    label = re.sub(r"\bchowmein\b", "chow mein", label, flags=re.I)
    label = re.sub(r"\bchow-mein\b", "chow mein", label, flags=re.I)
    label = re.sub(r"^gumbo$", "gumbo", label, flags=re.I)
    label = re.sub(r"^elotes$", "elote", label, flags=re.I)
    label = re.sub(r"^wings$", "wings", label, flags=re.I)
    label = re.sub(r"^tacos$", "tacos", label, flags=re.I)
    label = re.sub(r"^lumpia$", "lumpia", label, flags=re.I)
    label = re.sub(r"^gyros$", "gyros", label, flags=re.I)
    label = re.sub(r"^sisig$", "sisig", label, flags=re.I)
    label = re.sub(r"^nachos$", "nachos", label, flags=re.I)
    label = re.sub(r"^quesadillas$", "quesadillas", label, flags=re.I)
    label = re.sub(r"^sodas$", "soda", label, flags=re.I)
    label = re.sub(r"^coffee$", "coffee", label, flags=re.I)
    label = re.sub(r"^skewers$", "grilled skewers", label, flags=re.I)
    label = re.sub(r"^pork chicken$", "pork & chicken skewers", label, flags=re.I)
    label = re.sub(
        r"^chicken basil w$",
        "chicken basil with fried egg & steamed rice",
        label,
        flags=re.I,
    )
    label = re.sub(r"^sushi\?$", "sushi roll", label, flags=re.I)
    label = re.sub(r"^phat pa phao$", "phat paa pao", label, flags=re.I)
    label = re.sub(r"^laos sausage musubi$", "lao sausage musubi", label, flags=re.I)

    return sentence_case_item_label(label)[:120]


def infer_dietary_tags(
    name: str,
    *,
    category: str = "meals",
    vendor_dietary: list[str] | None = None,
) -> list[str]:
    """
    Heuristic guest-filter tags. Positive tags mean 'likely fits this need'
    for festival preview — not medical certification.
    """
    n = _norm_key(name)
    if not n or is_non_food_item(name):
        return []

    tags: list[str] = []
    vendor_dietary = vendor_dietary or []
    vendor_halal = "halal_certified" in vendor_dietary

    has_pork = bool(_PORK.search(n))
    has_meat = bool(_MEAT.search(n)) or has_pork
    nut_risk = bool(_NUT_RISK.search(n))
    gluten_risk = bool(_GLUTEN_RISK.search(n))
    dairy_risk = bool(_DAIRY_RISK.search(n))

    if _VEGAN.search(n):
        tags.extend(["vegan", "vegetarian", "dairy_free"])
    elif _VEGETARIAN.search(n) and not has_meat:
        tags.append("vegetarian")

    if not has_pork and has_meat:
        tags.append("pork_free")
    elif not has_meat and category != "drinks":
        if "vegetarian" not in tags and _VEGETARIAN.search(n):
            tags.append("vegetarian")
        if not dairy_risk and category in ("snacks", "meals"):
            tags.append("pork_free")

    if vendor_halal and not has_pork:
        tags.append("halal")

    # Grilled proteins, fries, rice plates — likely nut-free unless sauce suggests otherwise.
    if not nut_risk:
        likely_nut_free = (
            "fries" in n
            or "skewer" in n
            or "sausage" in n
            or "rice" in n
            or "bbq" in n
            or "brisket" in n
            or "turkey" in n
            or "wings" in n
            or "salad" in n
            or "juice" in n
            or "sugarcane" in n
            or bool(_REFRESHER_DRINK.search(n))
            or bool(_FRUIT_CUP.search(n))
            or "boba" in n
            or "tea" in n
            or "coffee" in n
            or "water" in n
            or "soda" in n
            or "banana" in n
            or "elote" in n
            or "crawfish" in n
            or "musubi" in n
            or "taco" in n
            or category == "drinks"
            or (has_meat and "sauce" not in n and "curry" not in n)
        )
        if likely_nut_free or (not has_meat and not nut_risk):
            tags.append("nut_free")

    if not gluten_risk:
        gf_likely = (
            "fries" in n
            or "rice" in n
            or "salad" in n
            or "papaya" in n
            or "sisig" in n
            or "bbq" in n
            or "brisket" in n
            or "wings" in n
            or "skewer" in n
            or "sausage" in n
            or "soup" in n
            or "bun thit" in n
            or "garlic noodles" in n
            or category == "drinks"
        )
        if gf_likely:
            tags.append("gluten_free")

    if not dairy_risk:
        df_likely = (
            _PLANT_DRINK.search(n)
            or "fries" in n
            or "salad" in n
            or "papaya" in n
            or "rice" in n
            or "bbq" in n
            or "brisket" in n
            or "wings" in n
            or "skewer" in n
            or "sisig" in n
            or "lumpia" in n
            or "taco" in n
            or "banh trang" in n
            or "banh trang tron" in n
        )
        if df_likely and "latte" not in n and "cheese" not in n:
            tags.append("dairy_free")

    spicy = bool(_SPICY.search(n))
    hard_chew = bool(_HARD_CHEW.search(n))
    if not spicy and not hard_chew:
        if _MILD_ITEM.search(n) or (category == "drinks" and "coffee" not in n):
            tags.append("mild_spice")
    if _EASY_CHEW.search(n) and not hard_chew:
        tags.append("easy_chew")
    if (
        (_KID_FRIENDLY.search(n) or _FRUIT_CUP.search(n))
        and not spicy
        and not hard_chew
    ):
        tags.append("kid_friendly")
    if _LOWER_SUGAR.search(n):
        tags.append("lower_sugar")

    # De-dupe preserving order
    seen: set[str] = set()
    out: list[str] = []
    for t in tags:
        if t not in seen:
            seen.add(t)
            out.append(t)
    return out


def canonicalize_dietary_tags(tags: list[str]) -> list[str]:
    """Map item tags to regional-need-profile keys (vegetarian → vegetarian_options, etc.)."""
    seen: set[str] = set()
    out: list[str] = []
    for tag in tags:
        if not tag:
            continue
        canonical = normalize_need_tag(tag)
        if canonical not in seen:
            seen.add(canonical)
            out.append(canonical)
    return out


def infer_dietary_warnings(
    name: str,
    *,
    category: str = "meals",
) -> list[str]:
    """Likely contains — shown as allergen emojis on the guest menu."""
    n = _norm_key(name)
    if not n or is_non_food_item(name):
        return []

    warnings: list[str] = []
    has_pork = bool(_PORK.search(n))
    has_meat = bool(_MEAT.search(n)) or has_pork

    if bool(_NUT_RISK.search(n)):
        warnings.append("contains_nuts")
    if bool(_GLUTEN_RISK.search(n)):
        warnings.append("contains_gluten")
    if bool(_DAIRY_RISK.search(n)):
        warnings.append("contains_dairy")
    if has_pork:
        warnings.append("contains_pork")
    elif has_meat and category != "drinks":
        warnings.append("contains_meat")

    seen: set[str] = set()
    out: list[str] = []
    for w in warnings:
        if w not in seen:
            seen.add(w)
            out.append(w)
    return out


def load_label_overrides(cleanup: dict[str, Any]) -> None:
    """Load per-vendor label overrides from menu cleanup seed."""
    global _LABEL_OVERRIDES
    _LABEL_OVERRIDES = {}
    for vid, spec in cleanup.items():
        if vid.startswith("_") or not isinstance(spec, dict):
            continue
        labels = spec.get("item_labels") or {}
        if labels:
            _LABEL_OVERRIDES[vid] = labels


def enrich_menu_items(
    items: list[dict[str, Any]],
    vendor_id: str,
    vendor_dietary: list[str] | None = None,
) -> list[dict[str, Any]]:
    """Clean labels, drop non-food junk, infer dietary_tags."""
    enriched: list[dict[str, Any]] = []
    seen_names: set[str] = set()

    for item in items:
        raw_name = item.get("name", "")
        if is_non_food_item(raw_name) or is_takehome_merchant_item(raw_name):
            continue

        name = clean_item_label(raw_name, vendor_id, item.get("item_id", ""))
        nk = _norm_key(name)
        if nk in seen_names or not name:
            continue
        seen_names.add(nk)

        category = item.get("category", "meals")
        vendor_tags = list(item.get("dietary_tags") or [])
        inferred = infer_dietary_tags(name, category=category, vendor_dietary=vendor_dietary)
        tags: list[str] = []
        seen_tags: set[str] = set()
        for t in vendor_tags + inferred:
            if t and t not in seen_tags:
                seen_tags.add(t)
                tags.append(t)
        tags = canonicalize_dietary_tags(tags)
        warnings = infer_dietary_warnings(name, category=category)
        merged = {**item, "name": name, "dietary_tags": tags, "dietary_warnings": warnings}
        enriched.append(merged)

    return enriched
