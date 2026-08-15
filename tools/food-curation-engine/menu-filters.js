/** Public menu filter labels and sidebar grouping. */

import { tagEmojiMeta } from "./menu-legend.js";

const NEED_TAG_ALIASES = {
  halal: "halal_certified",
  vegan: "vegan_options",
  vegetarian: "vegetarian_options",
  gluten_free: "gluten_free_options",
  dairy_free: "dairy_free_options",
};

function normalizeNeedTag(tag) {
  return NEED_TAG_ALIASES[tag] || tag;
}

export function filterMatchesTag(filterFacet, itemTag) {
  const facet = normalizeNeedTag(filterFacet);
  const tag = normalizeNeedTag(itemTag);
  return filterFacet === itemTag || facet === itemTag || filterFacet === tag || facet === tag;
}

export const FILTER_LABELS = {
  nut_free: "Nut-free",
  gluten_free: "Gluten-free",
  dairy_free: "Dairy-free",
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  halal: "Halal",
  pork_free: "Pork-free",
  mild_spice: "Mild",
  kid_friendly: "Kid-friendly",
  easy_chew: "Easy chew",
  lower_sugar: "Lower sugar",
};

export const FILTER_GROUPS = [
  {
    id: "free_from",
    label: "Free-from",
    facets: ["nut_free", "gluten_free", "dairy_free", "pork_free"],
  },
  {
    id: "dietary",
    label: "Dietary restrictions",
    facets: ["halal", "vegan", "vegetarian"],
  },
  {
    id: "experience",
    label: "Guest experience",
    facets: ["mild_spice", "kid_friendly", "easy_chew", "lower_sugar"],
  },
];

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function renderFilterGroupsHtml(facets, activeFilters) {
  const available = new Set(facets || []);
  const grouped = new Set(FILTER_GROUPS.flatMap((g) => g.facets));
  const ordered = [
    ...FILTER_GROUPS.flatMap((g) => g.facets.filter((f) => available.has(f))),
    ...(facets || []).filter((f) => !grouped.has(f)),
  ];
  if (!ordered.length) return "";
  return ordered
    .map((f) => {
      const label = FILTER_LABELS[f] || f;
      const meta = tagEmojiMeta(f);
      const icon = meta?.emoji
        ? `<span class="chip-emoji" aria-hidden="true">${meta.emoji}</span>`
        : "";
      return `<button type="button" class="chip ${activeFilters.has(f) ? "active" : ""}" data-f="${f}">${icon}${escapeHtml(label)}</button>`;
    })
    .join("");
}

export function attachFilterHandlers(container, activeFilters, onChange) {
  container.querySelectorAll(".chip[data-f]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.f;
      if (activeFilters.has(f)) activeFilters.delete(f);
      else activeFilters.add(f);
      onChange();
    });
  });
}
