#!/usr/bin/env node
/**
 * Score all meal-lane applicants with the JS engine — JSON lines to stdout.
 * Invoked by compare_py_js_scores.py
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const here = dirname(fileURLToPath(import.meta.url));
const staffApp = join(here, "../staff-app");
const assets = join(here, "../../../assets/shared/food-curation");

const {
  classifyApplicant,
  attachRecommendedMenu,
  capacityPlan,
  mergeNeedWeights,
  buildSelectionContext,
  scoreApplicant,
  scoreSnackApplicant,
  selectRoster,
  isOpenPrepVendor,
  isDrinksVendor,
  isSnackVendor,
} = await import(join(staffApp, "engine.js"));

const config = JSON.parse(readFileSync(join(assets, "presets/lny-2027.json"), "utf8"));
config.attendance = 6000;
const needProfile = JSON.parse(readFileSync(join(assets, "regional-need-profile.json"), "utf8"));
const seed = JSON.parse(readFileSync(join(assets, "seeds/lny-2026-applicants.json"), "utf8"));

const selectionContext = buildSelectionContext(config, needProfile);
const needWeights = mergeNeedWeights(selectionContext);
const capacity = capacityPlan(config);

const applicants = seed.applicants.filter((a) => a.status !== "rejected");
const openPrep = applicants.filter(isOpenPrepVendor).map((a) => attachRecommendedMenu(classifyApplicant(a), needWeights));
const drinks = applicants.filter(isDrinksVendor).map((a) => attachRecommendedMenu(classifyApplicant(a), needWeights));
const mealPool = [...openPrep, ...drinks];

const scores = {};
for (const a of mealPool) {
  scores[a.id] = scoreApplicant(a, capacity, needWeights, mealPool, selectionContext);
}
const snackPool = applicants.filter(isSnackVendor);
for (const a of snackPool) {
  scores[a.id] = scoreSnackApplicant(a, capacity, needWeights, snackPool, selectionContext);
}

const selection = selectRoster(applicants, capacity, selectionContext);
const actions = {};
for (const a of [
  ...selection.open_prep_accepted,
  ...selection.open_prep_waitlisted,
  ...selection.drinks_accepted,
  ...selection.drinks_waitlisted,
  ...selection.snack_accepted,
  ...selection.snack_waitlisted,
]) {
  actions[a.id] = {
    recommended_action: a.recommended_action,
    action_reason: a.action_reason,
    total: a.score?.total,
  };
}

console.log(JSON.stringify({ scores, actions, engine: "js" }));
