/** Shared dietary icon legend — used by menu-viewer and public festival food pages. */

export const HALAL_LABEL = "Halal";

export const WARNING_EMOJI = {
  contains_nuts: { emoji: "🥜", label: "Likely contains nuts" },
  contains_gluten: { emoji: "🌾", label: "Likely contains gluten" },
  contains_dairy: { emoji: "🥛", label: "Likely contains dairy" },
  contains_pork: { emoji: "🐷", label: "Contains pork" },
  contains_meat: { emoji: "🍖", label: "Contains meat" },
};

export const TAG_EMOJI = {
  vegan: { emoji: "🌱", label: "Vegan" },
  vegetarian: { emoji: "🥬", label: "Vegetarian" },
  halal: { emoji: "☪️", label: HALAL_LABEL },
  mild_spice: { emoji: "🌶️", label: "Mild" },
  kid_friendly: { emoji: "👶", label: "Kid-friendly" },
  easy_chew: { emoji: "🥣", label: "Easy chew" },
  lower_sugar: { emoji: "🍬", label: "Lower sugar" },
};

export function tagEmojiMeta(tag) {
  const displayKey = {
    halal_certified: "halal",
    vegetarian_options: "vegetarian",
    vegan_options: "vegan",
    gluten_free_options: "gluten_free",
    dairy_free_options: "dairy_free",
  }[tag] || tag;
  if (displayKey === "halal" || tag === "halal_certified") return TAG_EMOJI.halal;
  return TAG_EMOJI[displayKey];
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function buildIconLegendHtml() {
  const rows = [
    ...Object.values(WARNING_EMOJI).map((meta) => ({ ...meta, kind: "warn" })),
    ...Object.values(TAG_EMOJI).map((meta) => ({ ...meta, kind: "safe" })),
  ];
  return `<ul class="icon-legend-list">${rows
    .map(
      (r) => `<li class="icon-legend-item icon-legend-${r.kind}">
        <span class="icon-legend-emoji" aria-hidden="true">${r.emoji}</span>
        <span class="icon-legend-label">${escapeHtml(r.label)}</span>
      </li>`,
    )
    .join("")}</ul>`;
}

export function setupIconLegendToggle(root) {
  const toggle = root.querySelector(".icon-legend-link");
  const panel = root.querySelector(".icon-legend");
  if (!toggle || !panel) return;

  if (!panel.innerHTML.trim()) {
    panel.innerHTML = buildIconLegendHtml();
  }

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", open ? "false" : "true");
    panel.hidden = open;
  });
}
