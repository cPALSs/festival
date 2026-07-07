#!/usr/bin/env python3
"""Unit tests for food curation engine."""

import json
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from food_curation.capacity import capacity_plan  # noqa: E402
from food_curation.classify import classify_applicant  # noqa: E402
from food_curation.select import select_roster  # noqa: E402
from food_curation.offer import validate_offer_menu  # noqa: E402
from food_curation.eventeny import import_eventeny_csv, parse_eventeny_yes_no  # noqa: E402
from food_curation.policy import (  # noqa: E402
    is_elk_grove_based,
    policy_preference_score,
    vendor_business_residency_summary,
)
from food_curation.select import score_applicant  # noqa: E402


class TestCapacity(unittest.TestCase):
    def test_6k_family_general_slots(self):
        cfg = {
            "attendance": 6000,
            "audience_preset": "family_general",
            "food_buy_rate": 0.40,
            "items_per_buyer": 1.1,
            "hours_per_day": 6,
            "festival_days": 2,
        }
        result = capacity_plan(cfg)
        self.assertGreaterEqual(result["open_prep_slots"], 12)
        self.assertLessEqual(result["open_prep_slots"], 16)
        self.assertGreaterEqual(result["drink_slots"], 3)
        self.assertLessEqual(result["drink_slots"], 5)
        self.assertGreaterEqual(result["food_slots"], 15)
        self.assertAlmostEqual(result["fleet_utilization"], 0.75, delta=0.12)


class TestSelection(unittest.TestCase):
    def test_boba_exclusivity(self):
        cfg = {"attendance": 6000, "food_buy_rate": 0.40, "items_per_buyer": 1.1}
        cap = capacity_plan(cfg)
        apps = [
            {
                "id": "a",
                "business_name": "Bobette",
                "vendor_class": "drinks",
                "primary_archetype_id": "boba_milk_tea",
                "signature_menu_items": [{"item_id": "a1", "name": "boba tea"}],
                "capability_menu_items": [{"item_id": "a1", "name": "boba tea"}],
                "booth_kind": "prepack",
                "deposit_applied_at": "2026-01-02T00:00:00",
                "status": "submitted",
            },
            {
                "id": "b",
                "business_name": "Boba Meet Up",
                "vendor_class": "drinks",
                "primary_archetype_id": "boba_milk_tea",
                "signature_menu_items": [{"item_id": "b1", "name": "milk tea"}],
                "capability_menu_items": [{"item_id": "b1", "name": "milk tea"}],
                "booth_kind": "prepack",
                "deposit_applied_at": "2026-01-01T00:00:00",
                "status": "submitted",
            },
        ]
        for a in apps:
            classify_applicant(a)
        result = select_roster(apps, cap)
        boba_accepted = [
            x for x in result["drinks_accepted"]
            if (x.get("primary_archetype_id") == "boba_milk_tea")
        ]
        self.assertLessEqual(len(boba_accepted), cap["slots_by_archetype"].get("boba_milk_tea", 1))


class TestOffer(unittest.TestCase):
    def test_offer_must_be_subset_of_capability(self):
        app = {
            "booth_kind": "open_cooking",
            "capability_menu_items": [{"item_id": "x1", "name": "pad thai"}],
            "signature_menu_items": [],
        }
        errs = validate_offer_menu(app, ["x2"])
        self.assertTrue(errs)


class TestSignatureInference(unittest.TestCase):
    def test_excludes_commodity_from_signatures(self):
        cap = [
            {"item_id": "v-item-0", "name": "Spam musubi", "category": "snacks", "archetype_id": "fast_handheld"},
            {"item_id": "v-item-1", "name": "bomb azz tacos", "category": "meals", "archetype_id": "fast_handheld"},
            {"item_id": "v-item-2", "name": "bottle water & canned soda", "category": "snacks", "archetype_id": None},
        ]
        from food_curation.classify import infer_signature_items  # noqa: E402

        sig = infer_signature_items(cap, "open_cooking", primary_archetype="fast_handheld")
        names = [i["name"] for i in sig]
        self.assertNotIn("bottle water & canned soda", names)
        self.assertIn("Spam musubi", names)

    def test_signatures_subset_of_capability(self):
        seed_path = ROOT.parent.parent / "assets/shared/food-curation/seeds/lny-2026-applicants.json"
        if not seed_path.is_file():
            self.skipTest("seed not built")
        data = json.loads(seed_path.read_text())
        for app in data["applicants"]:
            cap_ids = {i["item_id"] for i in app["capability_menu_items"]}
            for item in app["signature_menu_items"]:
                self.assertIn(item["item_id"], cap_ids, app["business_name"])
            self.assertLessEqual(len(app["signature_menu_items"]), app["signature_limit"])


class TestMenuEnrichment(unittest.TestCase):
    def test_sentence_case_item_label(self):
        from food_curation.menu_enrichment import sentence_case_item_label  # noqa: E402

        self.assertEqual(sentence_case_item_label("Korean Corn Dogs"), "Korean corn dogs")
        self.assertEqual(sentence_case_item_label("BBQ beef or pork ribs"), "BBQ beef or pork ribs")
        self.assertEqual(sentence_case_item_label("US beef with veggie lumpia"), "US beef with veggie lumpia")
        self.assertEqual(sentence_case_item_label("Bánh mì"), "Bánh mì")

    def test_sentence_case_strips_leading_plus(self):
        from food_curation.menu_enrichment import clean_item_label  # noqa: E402

        self.assertEqual(
            clean_item_label("plus fluffy Cotton Candy", "mr-pops"),
            "Fluffy cotton candy",
        )

    def test_chowmein_label(self):
        from food_curation.menu_enrichment import clean_item_label  # noqa: E402

        self.assertEqual(clean_item_label("Chowmein"), "Chow mein")
        self.assertEqual(clean_item_label("chow-mein"), "Chow mein")

    def test_garlic_fries_nut_free(self):
        from food_curation.menu_enrichment import infer_dietary_tags  # noqa: E402

        tags = infer_dietary_tags("garlic fries", category="snacks")
        self.assertIn("nut_free", tags)

    def test_pad_thai_not_nut_free(self):
        from food_curation.menu_enrichment import infer_dietary_tags, infer_dietary_warnings  # noqa: E402

        tags = infer_dietary_tags("Pad Thai", category="meals")
        self.assertNotIn("nut_free", tags)
        warnings = infer_dietary_warnings("Pad Thai", category="meals")
        self.assertIn("contains_nuts", warnings)

    def test_skewer_nut_free(self):
        from food_curation.menu_enrichment import infer_dietary_tags  # noqa: E402

        tags = infer_dietary_tags("Pork & chicken skewers", category="meals")
        self.assertIn("nut_free", tags)
        self.assertNotIn("pork_free", tags)

    def test_pho_mild_and_easy_chew(self):
        from food_curation.menu_enrichment import infer_dietary_tags  # noqa: E402

        tags = infer_dietary_tags("Beef pho", category="meals")
        self.assertIn("mild_spice", tags)
        self.assertIn("easy_chew", tags)

    def test_ribs_not_easy_chew(self):
        from food_curation.menu_enrichment import infer_dietary_tags  # noqa: E402

        tags = infer_dietary_tags("BBQ spareribs", category="meals")
        self.assertNotIn("easy_chew", tags)
        self.assertNotIn("kid_friendly", tags)

    def test_corn_dog_kid_friendly(self):
        from food_curation.menu_enrichment import infer_dietary_tags  # noqa: E402

        tags = infer_dietary_tags("Korean corn dog", category="snacks")
        self.assertIn("kid_friendly", tags)
        self.assertIn("mild_spice", tags)

    def test_vendor_tags_preserved_on_enrich(self):
        from food_curation.menu_enrichment import enrich_menu_items  # noqa: E402

        items = enrich_menu_items(
            [{"item_id": "x1", "name": "Spicy mapo tofu", "dietary_tags": ["vegetarian"]}],
            "test-vendor",
        )
        self.assertIn("vegetarian_options", items[0]["dietary_tags"])
        self.assertNotIn("mild_spice", items[0]["dietary_tags"])

    def test_canonicalize_dietary_tags(self):
        from food_curation.menu_enrichment import canonicalize_dietary_tags  # noqa: E402

        tags = canonicalize_dietary_tags(
            ["vegetarian", "gluten_free", "halal", "nut_free", "vegetarian"],
        )
        self.assertEqual(
            tags,
            ["vegetarian_options", "gluten_free_options", "halal_certified", "nut_free"],
        )

    def test_banh_mi_family_experience_tags(self):
        from food_curation.menu_enrichment import infer_dietary_tags  # noqa: E402

        tags = infer_dietary_tags("Bánh mì", category="meals")
        self.assertIn("kid_friendly", tags)
        self.assertIn("mild_spice", tags)

    def test_bun_thit_easy_chew(self):
        from food_curation.menu_enrichment import infer_dietary_tags  # noqa: E402

        tags = infer_dietary_tags("Bún thịt nướng", category="meals")
        self.assertIn("easy_chew", tags)

    def test_rice_paper_salad_vegetarian_options_after_enrich(self):
        from food_curation.menu_enrichment import enrich_menu_items  # noqa: E402

        items = enrich_menu_items(
            [{"item_id": "x1", "name": "Bánh tráng trộn (rice paper salad)", "category": "meals"}],
            "zummi-food-llc",
        )
        self.assertIn("vegetarian_options", items[0]["dietary_tags"])
        self.assertIn("gluten_free_options", items[0]["dietary_tags"])

    def test_menu_fit_scores_normalized_dietary_tags(self):
        from food_curation.select import score_applicant  # noqa: E402

        need = {"vegetarian_options": 0.06}
        app = {
            "signature_menu_items": [
                {"item_id": "a1", "name": "Papaya salad", "dietary_tags": ["vegetarian"]},
            ],
            "booth_fee": 750,
            "primary_archetype_id": "fast_handheld",
        }
        cap = {"slots_by_archetype": {"fast_handheld": 2}, "open_prep_orders": 1000, "rows": []}
        scored = score_applicant(app, cap, need, pool=[])
        self.assertGreater(scored["components"]["menu_fit"], 0.1)

    def test_menu_fit_diminishing_redundant_tags(self):
        from food_curation.menu_recommendation import menu_fit_from_items  # noqa: E402

        need_weights = {"nut_free": 0.03}
        one_item = [{"item_id": "a", "dietary_tags": ["nut_free"], "archetype_id": "fast_handheld"}]
        five_items = [
            {"item_id": f"a{i}", "dietary_tags": ["nut_free"], "archetype_id": "fast_handheld"}
            for i in range(5)
        ]
        linear = 5 * (0.03 * 2 + 0.1)
        self.assertLess(menu_fit_from_items(five_items, need_weights), min(linear, 1.0))
        self.assertGreater(
            menu_fit_from_items(five_items, need_weights),
            menu_fit_from_items(one_item, need_weights),
        )

    def test_recommended_menu_drives_menu_fit(self):
        from food_curation.classify import classify_applicant  # noqa: E402
        from food_curation.menu_recommendation import attach_recommended_menu, recommend_menu_items  # noqa: E402
        from food_curation.needs import merge_need_weights  # noqa: E402
        from food_curation.select import score_applicant  # noqa: E402

        need_weights = merge_need_weights({
            "dietary_need_weights": {"vegetarian_options": 0.06, "gluten_free_options": 0.04},
            "experience_need_weights": {"kid_friendly": 0.06},
            "audience_preset": "family_general",
        })
        cap_items = [
            {
                "item_id": "v-0",
                "name": "Bánh mì",
                "category": "meals",
                "archetype_id": "fast_handheld",
                "dietary_tags": ["nut_free", "kid_friendly", "mild_spice"],
            },
            {
                "item_id": "v-1",
                "name": "Plain rice",
                "category": "meals",
                "dietary_tags": ["nut_free"],
            },
            {
                "item_id": "v-2",
                "name": "Rice paper salad",
                "category": "meals",
                "dietary_tags": ["vegetarian_options", "gluten_free_options", "nut_free"],
            },
        ]
        app = {
            "id": "test-v",
            "booth_kind": "food_truck",
            "primary_archetype_id": "fast_handheld",
            "capability_menu_items": cap_items,
            "signature_menu_items": [{"item_id": "v-1", "name": "Plain rice", "dietary_tags": ["nut_free"]}],
            "booth_fee": 750,
        }
        recommended = recommend_menu_items(cap_items, "food_truck", need_weights, primary_archetype="fast_handheld")
        self.assertIn("v-2", {i["item_id"] for i in recommended})
        enriched = attach_recommended_menu(classify_applicant(app), need_weights)
        cap = {"slots_by_archetype": {"fast_handheld": 2}, "open_prep_orders": 1000, "rows": []}
        sig_only = score_applicant(classify_applicant(app), cap, need_weights, pool=[])
        with_rec = score_applicant(enriched, cap, need_weights, pool=[enriched])
        self.assertGreater(with_rec["components"]["menu_fit"], sig_only["components"]["menu_fit"])

    def test_unsweetened_tea_lower_sugar(self):
        from food_curation.menu_enrichment import infer_dietary_tags  # noqa: E402

        tags = infer_dietary_tags("Unsweetened jasmine tea", category="drinks")
        self.assertIn("lower_sugar", tags)

    def test_boba_not_lower_sugar(self):
        from food_curation.menu_enrichment import infer_dietary_tags  # noqa: E402

        tags = infer_dietary_tags("Brown sugar boba milk tea", category="drinks")
        self.assertNotIn("lower_sugar", tags)

    def test_sugar_free_boba_lower_sugar(self):
        from food_curation.menu_enrichment import infer_dietary_tags  # noqa: E402

        tags = infer_dietary_tags("Sugar-free boba tea", category="drinks")
        self.assertIn("lower_sugar", tags)

    def test_aguas_frescas_parity_with_sugarcane_juice(self):
        from food_curation.menu_enrichment import infer_dietary_tags  # noqa: E402

        aguas = infer_dietary_tags("Aguas frescas", category="drinks")
        sugar = infer_dietary_tags("Sugarcane juice", category="drinks")
        for tag in (
            "vegetarian",
            "nut_free",
            "gluten_free",
            "dairy_free",
            "mild_spice",
            "kid_friendly",
        ):
            self.assertIn(tag, aguas, tag)
            self.assertIn(tag, sugar, tag)

    def test_aguas_frescas_typo_freseas(self):
        from food_curation.menu_enrichment import infer_dietary_tags  # noqa: E402

        tags = infer_dietary_tags("Aquas freseas", category="drinks")
        self.assertIn("vegetarian", tags)
        self.assertIn("kid_friendly", tags)

    def test_fruit_cup_kid_friendly(self):
        from food_curation.menu_enrichment import infer_dietary_tags  # noqa: E402

        tags = infer_dietary_tags("Fruit cups", category="snacks")
        self.assertIn("kid_friendly", tags)
        self.assertIn("vegetarian", tags)

    def test_merge_need_weights(self):
        from food_curation.needs import merge_need_weights  # noqa: E402

        merged = merge_need_weights({
            "dietary_need_weights": {"halal_certified": 0.08},
            "experience_need_weights": {"mild_spice": 0.07, "kid_friendly": 0.06},
        })
        self.assertEqual(merged["halal_certified"], 0.08)
        self.assertEqual(merged["mild_spice"], 0.07)

    def test_audience_preset_adjusts_need_weights(self):
        from food_curation.needs import merge_need_weights  # noqa: E402

        base = {
            "experience_need_weights": {"kid_friendly": 0.06, "mild_spice": 0.07},
        }
        family = merge_need_weights({**base, "audience_preset": "family_general"})
        campus = merge_need_weights({**base, "audience_preset": "campus_foodie"})
        self.assertAlmostEqual(family["kid_friendly"], 0.075)
        self.assertAlmostEqual(campus["kid_friendly"], 0.03)

    def test_campus_audience_increases_drink_slots(self):
        base = {
            "attendance": 6000,
            "food_buy_rate": 0.40,
            "items_per_buyer": 1.1,
            "hours_per_day": 6,
            "festival_days": 2,
        }
        family = capacity_plan({**base, "audience_preset": "family_general"})
        campus = capacity_plan({**base, "audience_preset": "campus_foodie"})
        self.assertGreater(campus["drink_slots"], family["drink_slots"])
        self.assertGreater(campus["food_buy_rate"], family["food_buy_rate"])

    def test_social_reach_score(self):
        from food_curation.select import _social_reach_score  # noqa: E402

        self.assertEqual(_social_reach_score({}), 0.0)
        self.assertEqual(_social_reach_score({"instagram_handle": "@cafe"}), 0.15)
        self.assertGreater(_social_reach_score({
            "instagram_handle": "@cafe",
            "instagram_followers": 10000,
        }), 0.5)

    def test_brand_focus_allows_two_archetypes(self):
        from food_curation.select import _brand_focus_score  # noqa: E402

        two_styles = {
            "recommended_archetype_spread": 2,
            "recommended_primary_archetype_purity": 0.25,
        }
        three_styles = {
            "recommended_archetype_spread": 3,
            "recommended_primary_archetype_purity": 0.4,
        }
        self.assertEqual(_brand_focus_score(two_styles), 1.0)
        self.assertEqual(_brand_focus_score(three_styles), 0.4)

    def test_festival_legacy_score(self):
        from food_curation.legacy import legacy_score, legacy_score_from_count  # noqa: E402

        self.assertEqual(legacy_score_from_count(0), 0.0)
        self.assertEqual(legacy_score_from_count(1), 0.4)
        self.assertEqual(legacy_score_from_count(2), 0.7)
        self.assertEqual(legacy_score_from_count(5), 1.0)
        self.assertEqual(legacy_score({}), 0.0)
        self.assertEqual(legacy_score({"festival_legacy": {"prior_count": 2}}), 0.7)

    def test_festival_legacy_in_total_score(self):
        from food_curation.select import score_applicant  # noqa: E402

        base = {
            "primary_archetype_id": "fast_handheld",
            "archetype_spread": 1,
            "booth_fee": 750,
            "signature_menu_items": [],
            "dietary": [],
        }
        capacity = {"slots_by_archetype": {"fast_handheld": 2}, "open_prep_orders": 1000, "rows": []}
        no_legacy = score_applicant(base, capacity, {}, pool=[])
        with_legacy = score_applicant(
            {**base, "festival_legacy": {"prior_count": 3, "seasons": ["lny_2023", "lny_2025", "maf_2023"]}},
            capacity,
            {},
            pool=[],
        )
        self.assertGreater(with_legacy["total"], no_legacy["total"])
        self.assertEqual(with_legacy["components"]["festival_legacy"], 1.0)

    def test_attach_vendor_legacy_from_seed(self):
        from food_curation.legacy import attach_vendor_legacy, legacy_score  # noqa: E402

        seed_path = ROOT.parent.parent / "assets/shared/food-curation/seeds/lny-2026-applicants.json"
        if not seed_path.is_file():
            self.skipTest("seed not built")
        data = json.loads(seed_path.read_text())
        with_legacy = [a for a in data["applicants"] if a.get("festival_legacy")]
        self.assertGreaterEqual(len(with_legacy), 10, "seed should embed prior-season vendors")
        top = max(with_legacy, key=lambda a: a["festival_legacy"].get("prior_count", 0))
        self.assertEqual(legacy_score(top), 1.0)

    def test_fielded_capability_has_dietary_tags(self):
        seed_path = ROOT.parent.parent / "assets/shared/food-curation/seeds/lny-2026-applicants.json"
        if not seed_path.is_file():
            self.skipTest("seed not built")
        data = json.loads(seed_path.read_text())
        fielded = [a for a in data["applicants"] if a.get("manual_accepted_2026")]
        tagged = sum(
            1 for a in fielded for i in a["capability_menu_items"] if i.get("dietary_tags")
        )
        total = sum(len(a["capability_menu_items"]) for a in fielded)
        self.assertGreater(tagged, total * 0.5, "most field items should have inferred tags")

    def test_retail_merchant_items_excluded(self):
        from food_curation.menu_enrichment import (  # noqa: E402
            enrich_menu_items,
            is_snack_packaged_item,
            is_takehome_merchant_item,
        )

        self.assertTrue(is_takehome_merchant_item("Pre-packaged meats & seafood (sold frozen)"))
        self.assertTrue(is_takehome_merchant_item("Chili oil"))
        self.assertTrue(is_snack_packaged_item("Colombian candy"))
        self.assertTrue(is_snack_packaged_item("Pre-packaged beef & wild game jerky"))
        self.assertFalse(is_takehome_merchant_item("Spam musubi"))
        self.assertFalse(is_takehome_merchant_item("Matcha drinks"))

        enriched = enrich_menu_items(
            [
                {"item_id": "x-0", "name": "Matcha drinks", "category": "drinks"},
                {"item_id": "x-1", "name": "Pre-packaged cookies", "category": "snacks"},
            ],
            "matcha-drinks-pre",
        )
        names = [i["name"] for i in enriched]
        self.assertIn("Matcha drinks", names)
        self.assertIn("Pre-packaged cookies", names)

    def test_publish_uses_vendor_committed_menu(self):
        from food_curation.publish import publish_public_menu  # noqa: E402

        roster = [
            {
                "id": "v1",
                "business_name": "Test Vendor",
                "recommended_action": "accept",
                "signature_menu_items": [{"name": "Signature only", "category": "meals"}],
                "conditional_offer": {
                    "status": "accepted",
                    "offered_menu_items": [
                        {"name": "Offered A", "category": "meals"},
                        {"name": "Offered B", "category": "meals"},
                    ],
                    "committed_menu_items": [{"name": "Offered A", "category": "meals"}],
                },
            },
        ]
        menu = publish_public_menu(roster, "Test")
        self.assertEqual(len(menu["vendors"]), 1)
        self.assertEqual(len(menu["vendors"][0]["items"]), 1)
        self.assertEqual(menu["vendors"][0]["items"][0]["name"], "Offered A")

    def test_merchant_vendors_excluded_from_public_menu(self):
        from food_curation.publish import publish_public_menu  # noqa: E402

        roster = [
            {
                "id": "truckee",
                "business_name": "Truckee Meadows",
                "manual_accepted_2026": True,
                "vendor_class": "merchant",
                "capability_menu_items": [{"name": "Pre-packaged meats (sold frozen)", "category": "snacks"}],
            },
            {
                "id": "jerky-jerky",
                "business_name": "Jerky Jerky",
                "manual_accepted_2026": True,
                "vendor_class": "snack",
                "capability_menu_items": [{"name": "Pre-packaged beef jerky", "category": "snacks"}],
            },
            {
                "id": "boba-meet-up",
                "business_name": "Boba Meet Up",
                "manual_accepted_2026": True,
                "vendor_class": "drinks",
                "capability_menu_items": [{"name": "Boba drinks", "category": "drinks"}],
            },
        ]
        menu = publish_public_menu(roster, "Test", items_source="capability")
        ids = [v["id"] for v in menu["vendors"]]
        self.assertNotIn("truckee", ids)
        self.assertIn("jerky-jerky", ids)
        self.assertIn("boba-meet-up", ids)


class TestScoreImprovements(unittest.TestCase):
    def test_lien_style_missing_instagram(self):
        from food_curation.improvements import score_improvement_tasks  # noqa: E402

        applicant = {
            "booth_kind": "open_cooking",
            "capability_menu_items": [
                {"item_id": "a", "name": "Pork skewers", "dietary_tags": ["nut_free"]},
                {"item_id": "b", "name": "Chicken skewers", "dietary_tags": ["nut_free"]},
                {"item_id": "c", "name": "Beef sausage", "dietary_tags": ["pork_free"]},
                {"item_id": "d", "name": "Bottled water", "dietary_tags": []},
                {"item_id": "e", "name": "Soda", "dietary_tags": []},
            ],
            "signature_menu_items": [
                {"item_id": "a", "name": "Pork skewers"},
                {"item_id": "b", "name": "Chicken skewers"},
                {"item_id": "c", "name": "Beef sausage"},
            ],
        }
        need = {"nut_free": 0.03, "kid_friendly": 0.06}
        tasks = score_improvement_tasks(
            applicant,
            need,
            score={"components": {"social_reach": 0, "menu_fit": 0.5}},
            selection_context={"audience_preset": "family_general"},
        )
        ids = {t["id"] for t in tasks}
        self.assertIn("add_instagram", ids)
        self.assertIn("expand_capability_menu", ids)
        ig = next(t for t in tasks if t["id"] == "add_instagram")
        self.assertAlmostEqual(ig["estimated_gain"], 0.02, places=4)
        expand = next(t for t in tasks if t["id"] == "expand_capability_menu")
        self.assertIn("ignored", expand["detail"].lower())
        self.assertIsNotNone(expand.get("estimated_gain"))
        self.assertIn("pts", expand["detail"])

    def test_signatures_required_over_five_capability(self):
        from food_curation.classify import classify_applicant  # noqa: E402
        from food_curation.improvements import score_improvement_tasks  # noqa: E402

        cap = [
            {"item_id": f"i{n}", "name": f"Dish {n}", "dietary_tags": ["nut_free"]}
            for n in range(7)
        ]
        app = classify_applicant({
            "booth_kind": "food_truck",
            "capability_menu_items": cap,
            "signature_menu_items": [],
        })
        self.assertIn("SIGNATURES_REQUIRED", app.get("classification_flags", []))
        tasks = score_improvement_tasks(app, {"nut_free": 0.03})
        self.assertTrue(any(t["id"] == "pick_signatures" for t in tasks))


class TestRosterCoverage(unittest.TestCase):
    def test_publish_roster_coverage_from_committed_menus(self):
        from food_curation.publish import publish_public_menu  # noqa: E402
        from food_curation.roster_coverage import publish_roster_coverage  # noqa: E402

        need_profile = {
            "dietary_need_weights": {"vegetarian_options": 0.06, "halal_certified": 0.08},
            "experience_need_weights": {"kid_friendly": 0.06},
            "need_catalog": [
                {"id": "vegetarian_options", "label": "Vegetarian options", "vendor_level": False},
                {"id": "halal_certified", "label": "Halal certified", "vendor_level": True},
            ],
        }
        roster = [
            {
                "id": "a",
                "business_name": "Veg Truck",
                "conditional_offer": {
                    "status": "accepted",
                    "committed_menu_items": [
                        {"name": "Tofu plate", "dietary_tags": ["vegetarian_options", "kid_friendly"]},
                    ],
                },
            },
            {
                "id": "b",
                "business_name": "Meat Truck",
                "signature_menu_items": [
                    {"name": "BBQ plate", "dietary_tags": ["nut_free"]},
                ],
            },
        ]
        coverage = publish_roster_coverage(roster, need_profile)
        veg = next(r for r in coverage["needs"] if r["id"] == "vegetarian_options")
        halal = next(r for r in coverage["needs"] if r["id"] == "halal_certified")
        self.assertEqual(veg["item_count"], 1)
        self.assertEqual(veg["status"], "limited")
        self.assertEqual(halal["status"], "gap")
        menu = publish_public_menu(roster, "Test Fest", need_profile=need_profile)
        self.assertIn("roster_coverage", menu)
        self.assertEqual(menu["roster_coverage"]["gap_count"], 1)


class TestVendorTaxonomy(unittest.TestCase):
    def test_setup_type_trailer_vs_truck(self):
        from food_curation.vendor_taxonomy import infer_setup_type  # noqa: E402

        self.assertEqual(infer_setup_type("MFF", "FOOD TRUCK"), "open_food_truck")
        self.assertEqual(infer_setup_type("TFF PREP", "FOOD TRAILER"), "open_food_trailer")
        self.assertEqual(infer_setup_type("TFF PRE-PKG", "10x10"), "prepack_booth")
        self.assertEqual(infer_setup_type("MEV", "10x20"), "open_food_canopy")

    def test_sugarcane_not_prepack_booth(self):
        from food_curation.vendor_taxonomy import infer_setup_type  # noqa: E402

        cap = [{"name": "Sugarcane juice", "category": "drinks"}]
        # Kenrick MEV wins even if Zeffy ticket says prepackaged
        setup = infer_setup_type(
            "MEV",
            "10x20",
            zeffy_ticket="Prepackaged food 10x10",
            capability=cap,
        )
        self.assertEqual(setup, "open_food_canopy")

    def test_live_prep_menu_overrides_prepack_ticket(self):
        from food_curation.vendor_taxonomy import infer_setup_type  # noqa: E402

        cap = [{"name": "Seasonal mocktails", "category": "drinks"}]
        setup = infer_setup_type("", "", zeffy_ticket="Prepackaged food", capability=cap)
        self.assertEqual(setup, "open_food_canopy")

    def test_vendor_class_merchant_from_menu(self):
        from food_curation.vendor_taxonomy import infer_vendor_class  # noqa: E402

        hot_boi = {"capability_menu_items": [{"name": "Chili oil"}]}
        self.assertEqual(infer_vendor_class(hot_boi), "merchant")
        jerky = {"capability_menu_items": [{"name": "Pre-packaged beef jerky"}]}
        self.assertEqual(infer_vendor_class(jerky), "snack")
        pops = {"capability_menu_items": [{"name": "Kettle corn"}]}
        self.assertEqual(infer_vendor_class(pops), "snack")
        boba = {"capability_menu_items": [{"name": "Boba drinks"}]}
        self.assertEqual(infer_vendor_class(boba), "drinks")

    def test_explicit_vendor_class_override_beats_menu_inference(self):
        from food_curation.vendor_taxonomy import infer_vendor_class  # noqa: E402

        messy_boba = {
            "vendor_class": "drinks",
            "capability_menu_items": [
                {"name": "Milk teas", "category": "drinks"},
                {"name": "Green color drink", "category": "meals"},
            ],
        }
        self.assertEqual(infer_vendor_class(messy_boba), "drinks")

    def test_food_primary_beats_side_boba(self):
        from food_curation.classify import classify_applicant, selection_archetype_id  # noqa: E402

        mixed = {
            "booth_kind": "open_cooking",
            "vendor_class": "open_prep",
            "capability_menu_items": [
                {"item_id": "p0", "name": "Potato swirls", "category": "meals"},
                {"item_id": "p1", "name": "Funnel cakes", "category": "meals"},
                {"item_id": "p2", "name": "Boba drinks", "category": "drinks"},
                {"item_id": "p3", "name": "Pad thai", "category": "meals"},
            ],
            "signature_menu_items": [
                {"item_id": "p2", "name": "Boba drinks"},
                {"item_id": "p0", "name": "Potato swirls"},
            ],
        }
        c = classify_applicant(mixed)
        self.assertEqual(c["inferred_primary_archetype_id"], "fast_handheld")
        self.assertEqual(selection_archetype_id(c), "fast_handheld")
        self.assertIn("DRINK_SIDE_IN_SIGNATURES", c.get("classification_flags", []))

    def test_snack_archetype_classify(self):
        from food_curation.classify import classify_item  # noqa: E402

        self.assertEqual(classify_item("Beef jerky")[0], "packaged_savory")
        self.assertEqual(classify_item("Kettle corn")[0], "popcorn_fair")
        self.assertEqual(classify_item("Caramel corn")[0], "popcorn_fair")
        self.assertEqual(classify_item("Colombian candy")[0], "packaged_sweets")
        self.assertEqual(classify_item("Snow cone")[0], "ice_treat")

    def test_snack_coverage_first_at_6k(self):
        from food_curation.capacity import capacity_plan  # noqa: E402
        from food_curation.classify import classify_applicant, selection_archetype_id  # noqa: E402
        from food_curation.select import select_roster  # noqa: E402

        config = {"attendance": 6000}
        cap = capacity_plan(config)
        self.assertEqual(cap["snack_slots"], 4)
        self.assertEqual(cap["snack_slots_demand"], 2)
        self.assertTrue(cap["snack_policy"]["coverage_first"])
        menus = [
            ("Beef jerky", "jerky"),
            ("Kettle corn", "pops"),
            ("Colombian candy", "candy"),
            ("Snow cone", "ice"),
        ]
        apps = []
        for item, vid in menus:
            apps.append({
                "id": vid,
                "business_name": vid,
                "vendor_class": "snack",
                "status": "submitted",
                "capability_menu_items": [{"item_id": f"{vid}-1", "name": item}],
                "signature_menu_items": [{"item_id": f"{vid}-1", "name": item}],
            })
        result = select_roster([classify_applicant(a, config) for a in apps], cap, config)
        self.assertEqual(len(result["snack_accepted"]), 4)
        arches = {selection_archetype_id(a) for a in result["snack_accepted"]}
        self.assertEqual(len(arches), 4)

    def test_fusion_bites_open_prep_not_wrong_lane(self):
        from food_curation.classify import classify_applicant, classify_item, selection_archetype_id  # noqa: E402
        from food_curation.select import select_roster  # noqa: E402

        seed_path = ROOT.parent.parent / "assets/shared/food-curation/seeds/lny-2026-applicants.json"
        fb = next(a for a in json.loads(seed_path.read_text())["applicants"] if a["id"] == "fusion-bites")
        config = {"attendance": 6000}

        self.assertEqual(classify_item("Loaded nachos & chips")[0], "fast_handheld")
        self.assertEqual(fb.get("vendor_class"), "open_prep")

        classified = classify_applicant(fb, config)
        arch = selection_archetype_id(classified)
        self.assertIn(arch, {"fast_handheld", "bbq_smoke_carved", "rice_plates_bowls"})
        self.assertNotIn(arch, {"packaged_savory", "packaged_sweets", "popcorn_fair", "ice_treat"})

        cap = capacity_plan(config)
        sel = select_roster(
            [classify_applicant(a, config) for a in json.loads(seed_path.read_text())["applicants"] if a.get("status") != "rejected"],
            cap,
            config,
        )
        fb_row = next(
            a for a in sel["open_prep_accepted"] + sel["open_prep_waitlisted"] if a["id"] == "fusion-bites"
        )
        self.assertNotEqual(fb_row.get("action_reason"), "wrong_lane")

    def test_snack_composite_scores_glam_vs_root(self):
        from food_curation.needs import merge_need_weights  # noqa: E402
        from food_curation.select import score_snack_applicant  # noqa: E402

        seed_path = ROOT.parent.parent / "assets/shared/food-curation/seeds/lny-2026-applicants.json"
        seed = json.loads(seed_path.read_text())
        by_id = {a["id"]: a for a in seed["applicants"]}
        glam = by_id["glammeme"]
        root = by_id["root-and-cane"]
        config = {"attendance": 6000}
        cap = capacity_plan(config)
        need_weights = merge_need_weights(config)
        snack_pool = [a for a in seed["applicants"] if a.get("vendor_class") == "snack"]

        glam_score = score_snack_applicant(glam, cap, need_weights, pool=snack_pool, config=config)
        root_score = score_snack_applicant(root, cap, need_weights, pool=snack_pool, config=config)

        for key in (
            "menu_fit", "need_anchor", "brand_focus", "vendor_roi",
            "demographic", "social_reach", "festival_legacy", "policy_preference",
        ):
            self.assertIn(key, glam_score["components"])
            self.assertIn(key, root_score["components"])

        self.assertGreater(
            glam_score["components"]["social_reach"],
            root_score["components"]["social_reach"],
            "Glam MeMe should score higher on social reach than Root & Cane",
        )
        self.assertGreater(
            glam_score["total"],
            root_score["total"],
            "Composite total should reflect Glam MeMe's stronger social reach",
        )
        self.assertEqual(
            glam_score["components"]["vendor_roi"],
            root_score["components"]["vendor_roi"],
            "Same archetype slot economics → equal snack ROI at planning attendance",
        )

    def test_snack_vendor_cap(self):
        from food_curation.capacity import capacity_plan  # noqa: E402
        from food_curation.classify import classify_applicant, selection_archetype_id  # noqa: E402
        from food_curation.select import select_roster  # noqa: E402

        cap = capacity_plan({
            "attendance": 25000,
            "snack_vendors": {"coverage_first": False, "coverage_floor_slots": 0},
        })
        self.assertGreater(cap["snack_slots"], 0)
        snack_menus = [
            ("Beef jerky", "packaged_savory"),
            ("Colombian candy", "packaged_sweets"),
            ("Kettle corn", "popcorn_fair"),
            ("Snow cone", "ice_treat"),
        ]
        apps = []
        for i, (item, _arch) in enumerate(snack_menus * 2):
            apps.append({
                "id": f"snack-{i}",
                "business_name": f"Snack {i}",
                "vendor_class": "snack",
                "status": "submitted",
                "capability_menu_items": [{"item_id": f"s{i}", "name": item}],
                "signature_menu_items": [{"item_id": f"s{i}", "name": item}],
                "deposit_applied_at": f"2026-01-{i+1:02d}T00:00:00",
            })
        classified = [classify_applicant(a) for a in apps]
        result = select_roster(classified, cap)
        self.assertLessEqual(len(result["snack_accepted"]), cap["snack_slots"])
        by_arch: dict[str, int] = {}
        for a in result["snack_accepted"]:
            arch = selection_archetype_id(a) or "unknown"
            by_arch[arch] = by_arch.get(arch, 0) + 1
        for arch, count in by_arch.items():
            self.assertLessEqual(count, cap["slots_by_archetype"].get(arch, 0))

    def test_merchants_excluded_from_meal_selection(self):
        from food_curation.select import select_roster  # noqa: E402
        from food_curation.capacity import capacity_plan  # noqa: E402

        cap = capacity_plan({"attendance": 6000})
        apps = [
            {
                "id": "take-home-v",
                "business_name": "Hot Boi",
                "vendor_class": "merchant",
                "status": "submitted",
                "capability_menu_items": [{"item_id": "m1", "name": "Chili oil"}],
                "signature_menu_items": [{"item_id": "m1", "name": "Chili oil"}],
            },
            {
                "id": "food",
                "business_name": "Boba",
                "vendor_class": "drinks",
                "primary_archetype_id": "boba_milk_tea",
                "status": "submitted",
                "capability_menu_items": [{"item_id": "f1", "name": "boba tea"}],
                "signature_menu_items": [{"item_id": "f1", "name": "boba tea"}],
                "deposit_applied_at": "2026-01-01T00:00:00",
            },
        ]
        result = select_roster(apps, cap)
        self.assertEqual(len(result["merchants"]), 1)
        self.assertEqual(result["merchants"][0]["id"], "take-home-v")
        self.assertTrue(result["merchants"][0].get("requires_tff_pre_pkg"))
        self.assertTrue(any(a["id"] == "food" for a in result["drinks_accepted"]))

    def test_need_coverage_promotes_sole_halal_vendor(self):
        cap = capacity_plan({"attendance": 6000, "food_buy_rate": 0.40, "items_per_buyer": 1.1})
        cap["slots_by_archetype"]["fast_handheld"] = 2
        need = {"dietary_need_weights": {"halal_certified": 0.08, "vegetarian_options": 0.06}}

        def handheld_app(vid, name, deposit, *, halal=False, vietnamese=False):
            app = {
                "id": vid,
                "business_name": name,
                "vendor_class": "open_prep",
                "primary_archetype_id": "fast_handheld",
                "signature_menu_items": [
                    {"item_id": f"{vid}-1", "name": "Street tacos"},
                    {"item_id": f"{vid}-2", "name": "Loaded fries"},
                ],
                "capability_menu_items": [
                    {"item_id": f"{vid}-1", "name": "Street tacos"},
                    {"item_id": f"{vid}-2", "name": "Loaded fries"},
                ],
                "booth_fee": 750,
                "deposit_applied_at": deposit,
                "status": "submitted",
            }
            if halal:
                app["dietary"] = ["halal_certified"]
                app["signature_menu_items"][0]["dietary_tags"] = ["halal"]
            if vietnamese:
                app["vietnamese_anchor"] = True
            return app

        apps = [
            handheld_app("a", "Alpha Tacos", "2026-01-01T00:00:00", vietnamese=True),
            handheld_app("b", "Beta Tacos", "2026-01-02T00:00:00"),
            handheld_app("c", "Halal Gyro Truck", "2026-01-03T00:00:00", halal=True),
        ]
        result = select_roster(apps, cap, need)
        accepted_ids = {a["id"] for a in result["open_prep_accepted"]}
        self.assertIn("c", accepted_ids)
        halal_vendor = next(a for a in result["open_prep_accepted"] if a["id"] == "c")
        self.assertIn(halal_vendor.get("action_reason"), ("need_coverage", "menu_fit_rank"))


class TestPolicyPreference(unittest.TestCase):
    def test_neither_anchor_nor_local(self):
        app = {"id": "x", "business_city": "Sacramento"}
        self.assertFalse(is_elk_grove_based(app))
        self.assertEqual(policy_preference_score(app), 0.5)

    def test_vietnamese_anchor_only(self):
        app = {"id": "x", "vietnamese_anchor": True}
        self.assertEqual(policy_preference_score(app), 1.0)

    def test_elk_grove_only(self):
        app = {"id": "x", "elk_grove_based": True}
        self.assertEqual(policy_preference_score(app), 0.75)

    def test_both_stack_capped_at_one(self):
        app = {"id": "x", "vietnamese_anchor": True, "elk_grove_based": True}
        self.assertEqual(policy_preference_score(app), 1.0)

    def test_elk_grove_inferred_from_city(self):
        app = {"id": "x", "business_city": "Elk Grove, CA"}
        self.assertTrue(is_elk_grove_based(app))
        self.assertEqual(policy_preference_score(app), 0.75)

    def test_elk_grove_inferred_from_zip(self):
        app = {"id": "x", "business_zip": "95758-1234"}
        self.assertTrue(is_elk_grove_based(app))

    def test_elk_grove_bonus_disabled_in_config(self):
        app = {"id": "x", "elk_grove_based": True}
        cfg = {"policy": {"elk_grove_local_bonus": False}}
        self.assertEqual(policy_preference_score(app, cfg), 0.5)

    def test_score_applicant_wires_policy_component(self):
        cap = capacity_plan({"attendance": 6000, "food_buy_rate": 0.40, "items_per_buyer": 1.1})
        need = {"dietary_need_weights": {}}
        base = {
            "id": "v",
            "vendor_class": "open_prep",
            "primary_archetype_id": "fast_handheld",
            "signature_menu_items": [{"item_id": "1", "name": "Taco"}],
            "capability_menu_items": [{"item_id": "1", "name": "Taco"}],
            "booth_fee": 750,
        }
        eg = score_applicant({**base, "elk_grove_based": True}, cap, need)
        self.assertEqual(eg["components"]["policy_preference"], 0.75)


class TestEventenyImport(unittest.TestCase):
    def test_parse_eventeny_yes_no(self):
        self.assertTrue(parse_eventeny_yes_no("Yes"))
        self.assertFalse(parse_eventeny_yes_no("no"))
        self.assertIsNone(parse_eventeny_yes_no(""))

    def test_import_vendor_sku(self):
        from food_curation.eventeny import import_eventeny_csv  # noqa: E402

        csv_text = (
            "Company Name,Vendor SKU,Setup Type,Menu\n"
            "Treat Cart,LNY-VENDOR-SN,prepack_booth,Kettle corn\n"
            "Boba Bar,LNY-VENDOR-DR,open_food_trailer,Boba milk tea\n"
        )
        apps = import_eventeny_csv(csv_text)
        snack = next(a for a in apps if a["business_name"] == "Treat Cart")
        drink = next(a for a in apps if a["business_name"] == "Boba Bar")
        self.assertEqual(snack["vendor_class"], "snack")
        self.assertEqual(snack["booth_fee"], 400)
        self.assertEqual(drink["vendor_class"], "drinks")
        self.assertEqual(drink["booth_fee"], 500)
        self.assertEqual(drink["setup_type"], "open_food_trailer")

    def test_import_elk_grove_and_address_columns(self):
        csv_text = (
            "Company Name,Elk Grove Business,Business City,Business ZIP,Menu\n"
            "Foo Truck,Yes,Elk Grove,95758,\n"
            "Bar Cart,No,Sacramento,95822,\n"
        )
        apps = import_eventeny_csv(csv_text)
        self.assertTrue(apps[0]["elk_grove_based"])
        self.assertEqual(apps[0]["business_city"], "Elk Grove")
        self.assertFalse(apps[1]["elk_grove_based"])

    def test_vendor_business_residency_summary(self):
        apps = [
            {"id": "a", "elk_grove_based": True},
            {"id": "b", "elk_grove_based": False},
            {"id": "c", "business_city": "Elk Grove"},
            {"id": "d"},
        ]
        summary = vendor_business_residency_summary(apps)
        self.assertEqual(summary, {"elk_grove": 2, "non_elk_grove": 1, "unknown": 1, "total": 4})


class TestPyJsParity(unittest.TestCase):
    def test_py_js_scores_and_selection_match(self):
        script = ROOT / "scripts" / "compare_py_js_scores.py"
        proc = subprocess.run(
            [sys.executable, str(script)],
            capture_output=True,
            text=True,
            cwd=ROOT,
        )
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)


if __name__ == "__main__":
    unittest.main()
