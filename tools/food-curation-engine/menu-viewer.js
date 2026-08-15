import { WARNING_EMOJI, tagEmojiMeta, setupIconLegendToggle, buildIconLegendHtml } from "./menu-legend.js";
import {
  FILTER_GROUPS,
  FILTER_LABELS,
  renderFilterGroupsHtml,
  attachFilterHandlers,
  filterMatchesTag,
} from "./menu-filters.js";
import {
  CUISINE_ORDER,
  CUISINE_LABELS,
  cuisineSectionsForItem,
  ITEM_NOTE_MAX_LEN,
} from "./menu-cuisine.js";

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderBadge(meta, className) {
  return `<button type="button" class="tag ${className} diet-badge" aria-label="${escapeHtml(meta.label)}">
    <span class="tag-emoji" aria-hidden="true">${meta.emoji}</span>
    <span class="tag-tip" role="tooltip">${escapeHtml(meta.label)}</span>
  </button>`;
}

function renderDietaryBadges(item) {
  const warnings = item.dietary_warnings || [];
  const tags = item.dietary_tags || [];
  if (!warnings.length && !tags.length) return "";

  const parts = [];
  const seenTagLabels = new Set();
  for (const w of warnings) {
    const meta = WARNING_EMOJI[w];
    if (meta) parts.push(renderBadge(meta, "tag-warn"));
  }
  for (const t of tags) {
    const meta = tagEmojiMeta(t);
    if (!meta || seenTagLabels.has(meta.label)) continue;
    seenTagLabels.add(meta.label);
    parts.push(renderBadge(meta, "tag-safe"));
  }
  return parts.length ? `<span class="dietary-badges">${parts.join("")}</span>` : "";
}

function setupDietBadgeHandlers(root) {
  root.addEventListener("click", (e) => {
    const badge = e.target.closest(".diet-badge");
    if (badge) {
      e.preventDefault();
      e.stopPropagation();
      const wasOpen = badge.classList.contains("is-open");
      root.querySelectorAll(".diet-badge.is-open").forEach((b) => b.classList.remove("is-open"));
      if (!wasOpen) badge.classList.add("is-open");
      return;
    }
    root.querySelectorAll(".diet-badge.is-open").forEach((b) => b.classList.remove("is-open"));
  });
}

function itemMatchesFilter(item, vendor, f) {
  const tags = new Set([...(item.dietary_tags || []), ...(vendor.dietary || [])]);
  for (const t of tags) {
    if (filterMatchesTag(f, t)) return true;
  }
  return false;
}

function itemMatchesFilters(item, vendor, activeFilters) {
  if (activeFilters.size === 0) return true;
  for (const f of activeFilters) {
    if (!itemMatchesFilter(item, vendor, f)) return false;
  }
  return true;
}

function itemMatchesQuery(item, vendor, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return item.name.toLowerCase().includes(q) || vendor.name.toLowerCase().includes(q);
}

function filteredVendors(menu, activeFilters, query) {
  return menu.vendors
    .map((v) => ({
      ...v,
      items: v.items.filter((i) => itemMatchesFilters(i, v, activeFilters) && itemMatchesQuery(i, v, query)),
    }))
    .filter((v) => v.items.length);
}

function hasBoothLabel(vendor) {
  return Boolean(String(vendor.booth_label ?? "").trim());
}

/** Assigned booths first (F01, V02, …); unassigned vendors A→Z by name. */
export function compareVendorsByLocation(a, b) {
  const aAssigned = hasBoothLabel(a);
  const bAssigned = hasBoothLabel(b);
  if (aAssigned && bAssigned) {
    return String(a.booth_label).localeCompare(String(b.booth_label), undefined, {
      numeric: true,
      sensitivity: "base",
    });
  }
  if (aAssigned !== bAssigned) return aAssigned ? -1 : 1;
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

function sortVendorsByLocation(vendors) {
  return [...vendors].sort(compareVendorsByLocation);
}

function itemNoteText(item) {
  const note = String(item?.note || "").trim();
  if (!note) return "";
  return note.length > ITEM_NOTE_MAX_LEN ? `${note.slice(0, ITEM_NOTE_MAX_LEN - 1)}…` : note;
}

function renderItemPrimary(item, { showVendor = false } = {}) {
  const note = itemNoteText(item);
  const vendorBit =
    showVendor && item.vendorName
      ? ` <em>— ${escapeHtml(item.vendorName)}</em>`
      : "";
  const noteBit = note ? `<span class="item-note muted">${escapeHtml(note)}</span>` : "";
  return `<span class="item-text"><span class="item-name">${escapeHtml(item.name)}${renderDietaryBadges(item)}${vendorBit}</span>${noteBit}</span>`;
}

function renderVendorView(vendors) {
  return sortVendorsByLocation(vendors)
    .map(
      (v) => `
    <article class="vendor-card">
      <div class="vendor-card-head">
        <h2>${escapeHtml(v.name)}</h2>
        ${v.booth_label ? `<p class="booth">${escapeHtml(v.booth_label)}</p>` : ""}
      </div>
      <ul class="items">${v.items
        .map(
          (i) => `
        <li>${renderItemPrimary(i)}
        ${i.price ? `<span>$${i.price}</span>` : ""}</li>`,
        )
        .join("")}
      </ul>
    </article>`,
    )
    .join("");
}

function renderCuisineView(vendors) {
  const bySection = Object.fromEntries(CUISINE_ORDER.map((id) => [id, []]));
  vendors.forEach((v) => {
    v.items.forEach((i) => {
      const row = { ...i, vendorName: v.name };
      for (const section of cuisineSectionsForItem(i, v)) {
        (bySection[section] = bySection[section] || []).push(row);
      }
    });
  });
  return CUISINE_ORDER.filter((id) => (bySection[id] || []).length)
    .map((section) => {
      const items = bySection[section];
      items.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
      const id = `menu-cuisine-${section}`;
      return `
    <section class="category-block" id="${id}">
      <h3>${escapeHtml(CUISINE_LABELS[section] || section)}</h3>
      <ul class="items">${items
        .map(
          (i) => `
        <li>${renderItemPrimary(i, { showVendor: true })}
        ${i.price ? `<span>$${i.price}</span>` : ""}</li>`,
        )
        .join("")}
      </ul>
    </section>`;
    })
    .join("");
}

function dietFacetOrder(facets) {
  const available = new Set(facets || []);
  const grouped = new Set(FILTER_GROUPS.flatMap((g) => g.facets));
  return [
    ...FILTER_GROUPS.flatMap((g) => g.facets.filter((f) => available.has(f))),
    ...(facets || []).filter((f) => !grouped.has(f)),
  ];
}

function renderDietView(vendors, facets) {
  const sections = dietFacetOrder(facets)
    .map((facet) => {
      const items = [];
      vendors.forEach((v) => {
        v.items.forEach((i) => {
          if (itemMatchesFilter(i, v, facet)) {
            items.push({ ...i, vendorName: v.name });
          }
        });
      });
      if (!items.length) return "";
      items.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
      const label = FILTER_LABELS[facet] || facet;
      const id = `menu-diet-${facet}`;
      return `
    <section class="category-block diet-block" id="${id}">
      <h3>${escapeHtml(label)}</h3>
      <ul class="items">${items
        .map(
          (i) => `
        <li>${renderItemPrimary(i, { showVendor: true })}
        ${i.price ? `<span>$${i.price}</span>` : ""}</li>`,
        )
        .join("")}
      </ul>
    </section>`;
    })
    .filter(Boolean)
    .join("");

  return (
    sections ||
    "<p class='muted'>No dietary tags on the current menu items. Try clearing filters or switch to By vendor.</p>"
  );
}

/**
 * Mount interactive public menu UI into container.
 * Returns { setMenu(menu) } to refresh when roster changes.
 */
export function mountMenuViewer(container, menu) {
  let activeFilters = new Set();
  let view = "cuisine";
  let query = "";
  let currentMenu = menu;

  container.innerHTML = `
    <header>
      <h1 class="menu-title"></h1>
      <p class="menu-meta muted"><span class="menu-disclaimer"></span><span class="menu-updated"></span></p>
    </header>
    <div class="menu-layout">
      <aside class="menu-sidebar">
        <div class="menu-sidebar-toolbar">
          <input type="search" id="menu-search-input" class="menu-search" placeholder="Search items or vendors..." aria-label="Search items or vendors" />
          <button type="button" class="menu-filters-open" aria-haspopup="dialog" aria-controls="menu-filters-sheet" aria-expanded="false">
            Filters<span class="menu-filters-count" hidden></span>
          </button>
          <button type="button" class="menu-legend-open" aria-haspopup="dialog" aria-controls="menu-legend-sheet" aria-expanded="false">
            Legend
          </button>
        </div>
        <div class="menu-sidebar-filters">
          <div class="menu-filter-panel">
            <div class="menu-filter-heading">
              <p class="menu-filter-label">Meets all criteria:</p>
              <button type="button" class="filter-reset" disabled>Reset filters</button>
            </div>
            <div class="menu-filter-chips">
              <div class="menu-filters filters"></div>
            </div>
          </div>
        </div>
        <div class="menu-icon-legend-block">
          <button type="button" class="icon-legend-link" aria-expanded="false" aria-controls="menu-icon-legend">
            Icon legend<span class="icon-legend-caret" aria-hidden="true"></span>
          </button>
          <div id="menu-icon-legend" class="icon-legend" hidden></div>
        </div>
      </aside>
      <div class="menu-main">
        <div class="menu-main-sticky">
          <div class="menu-tabs-row">
            <nav class="menu-view-tabs" role="tablist" aria-label="Menu view">
              <button type="button" class="view-btn active" data-view="cuisine" role="tab" aria-selected="true">By cuisine</button>
              <button type="button" class="view-btn" data-view="vendor" role="tab" aria-selected="false">By vendor</button>
              <button type="button" class="view-btn" data-view="diet" role="tab" aria-selected="false">By diet</button>
            </nav>
          </div>
          <nav class="menu-section-chips" aria-label="Jump to section" hidden></nav>
        </div>
        <div class="menu-content"></div>
      </div>
    </div>
    <div id="menu-filters-sheet" class="menu-filters-sheet" role="dialog" aria-modal="true" aria-label="Filters" hidden>
      <div class="menu-filters-sheet-panel">
        <div class="menu-filters-sheet-bar">
          <p class="menu-filters-sheet-title">Filters</p>
          <button type="button" class="menu-filters-close" aria-label="Close filters">Close</button>
        </div>
        <div class="menu-filters-sheet-body"></div>
      </div>
    </div>
    <div id="menu-legend-sheet" class="menu-legend-sheet" role="dialog" aria-modal="true" aria-label="Icon legend" hidden>
      <div class="menu-legend-sheet-panel">
        <div class="menu-legend-sheet-bar">
          <p class="menu-legend-sheet-title">Icon legend</p>
          <button type="button" class="menu-legend-close" aria-label="Close legend">Close</button>
        </div>
        <div class="menu-legend-sheet-body"></div>
      </div>
    </div>
  `;

  const titleEl = container.querySelector(".menu-title");
  const disclaimerEl = container.querySelector(".menu-disclaimer");
  const updatedEl = container.querySelector(".menu-updated");
  const filtersEl = container.querySelector(".menu-filters");
  const resetFiltersEl = container.querySelector(".filter-reset");
  const contentEl = container.querySelector(".menu-content");
  const searchEl = container.querySelector(".menu-search");
  const sectionChipsEl = container.querySelector(".menu-section-chips");
  const stickyHeadEl = container.querySelector(".menu-main-sticky");
  const filtersSheetEl = container.querySelector(".menu-filters-sheet");
  const filtersOpenBtn = container.querySelector(".menu-filters-open");
  const filtersCloseBtn = container.querySelector(".menu-filters-close");
  const filtersCountEl = container.querySelector(".menu-filters-count");
  const sidebarFiltersEl = container.querySelector(".menu-sidebar-filters");
  const filtersSheetBodyEl = container.querySelector(".menu-filters-sheet-body");
  const menuSidebarEl = container.querySelector(".menu-sidebar");
  const legendSheetEl = container.querySelector(".menu-legend-sheet");
  const legendOpenBtn = container.querySelector(".menu-legend-open");
  const legendCloseBtn = container.querySelector(".menu-legend-close");
  const legendSheetBodyEl = container.querySelector(".menu-legend-sheet-body");
  let sectionSpyCleanup = null;

  if (legendSheetBodyEl && !legendSheetBodyEl.innerHTML.trim()) {
    legendSheetBodyEl.innerHTML = buildIconLegendHtml();
  }

  function isMobileFiltersSheet() {
    return window.matchMedia("(max-width: 1099px)").matches;
  }

  function placeFiltersForViewport() {
    if (!sidebarFiltersEl || !filtersSheetBodyEl || !menuSidebarEl) return;
    if (isMobileFiltersSheet()) {
      if (sidebarFiltersEl.parentElement !== filtersSheetBodyEl) {
        filtersSheetBodyEl.appendChild(sidebarFiltersEl);
      }
    } else if (sidebarFiltersEl.parentElement !== menuSidebarEl) {
      menuSidebarEl.appendChild(sidebarFiltersEl);
    }
  }

  function setFiltersSheetOpen(open) {
    if (!filtersSheetEl || !filtersOpenBtn) return;
    if (!isMobileFiltersSheet()) {
      filtersSheetEl.hidden = true;
      filtersSheetEl.classList.remove("is-open");
      filtersOpenBtn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-filters-sheet-open");
      return;
    }
    if (open) setLegendSheetOpen(false);
    placeFiltersForViewport();
    filtersSheetEl.hidden = !open;
    filtersSheetEl.classList.toggle("is-open", open);
    filtersOpenBtn.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("menu-filters-sheet-open", open);
    if (open) filtersCloseBtn?.focus();
  }

  function setLegendSheetOpen(open) {
    if (!legendSheetEl || !legendOpenBtn) return;
    if (!isMobileFiltersSheet()) {
      legendSheetEl.hidden = true;
      legendSheetEl.classList.remove("is-open");
      legendOpenBtn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-legend-sheet-open");
      return;
    }
    if (open) setFiltersSheetOpen(false);
    legendSheetEl.hidden = !open;
    legendSheetEl.classList.toggle("is-open", open);
    legendOpenBtn.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("menu-legend-sheet-open", open);
    if (open) legendCloseBtn?.focus();
  }

  function updateFiltersOpenLabel() {
    const n = activeFilters.size;
    if (!filtersCountEl) return;
    if (n > 0) {
      filtersCountEl.hidden = false;
      filtersCountEl.textContent = String(n);
    } else {
      filtersCountEl.hidden = true;
      filtersCountEl.textContent = "";
    }
  }

  function renderFilters() {
    filtersEl.innerHTML = renderFilterGroupsHtml(currentMenu.filter_facets, activeFilters);
    attachFilterHandlers(filtersEl, activeFilters, render);
    resetFiltersEl.disabled = activeFilters.size === 0;
    updateFiltersOpenLabel();
  }

  function syncSectionScrollMargin() {
    const offset = stickyHeadEl ? Math.ceil(stickyHeadEl.getBoundingClientRect().height + 8) : 96;
    contentEl.style.setProperty("--menu-section-scroll-margin", `${offset}px`);
  }

  function syncMobileToolbarStickyOffset() {
    const sidebar = container.querySelector(".menu-sidebar");
    if (!sidebar || !window.matchMedia("(max-width: 1099px)").matches) {
      container.style.removeProperty("--menu-mobile-toolbar-height");
      return;
    }
    container.style.setProperty("--menu-mobile-toolbar-height", `${Math.ceil(sidebar.offsetHeight)}px`);
  }

  function syncStickyMetrics() {
    syncMobileToolbarStickyOffset();
    syncSectionScrollMargin();
  }

  function setupSectionNav() {
    if (sectionSpyCleanup) {
      sectionSpyCleanup();
      sectionSpyCleanup = null;
    }

    const sections = [...contentEl.querySelectorAll(".category-block[id]")];
    if (view === "vendor" || !sections.length) {
      sectionChipsEl.hidden = true;
      sectionChipsEl.innerHTML = "";
      syncStickyMetrics();
      return;
    }

    sectionChipsEl.hidden = false;
    sectionChipsEl.innerHTML = sections
      .map((sec) => {
        const label = sec.querySelector("h3")?.textContent?.trim() || sec.id;
        return `<button type="button" class="menu-section-chip" data-section="${escapeHtml(sec.id)}">${escapeHtml(label)}</button>`;
      })
      .join("");

    sectionChipsEl.querySelectorAll(".menu-section-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = document.getElementById(btn.dataset.section);
        if (!target) return;
        syncStickyMetrics();
        lastActiveId = btn.dataset.section;
        sectionChipsEl.querySelectorAll(".menu-section-chip").forEach((b) => {
          const on = b === btn;
          b.classList.toggle("active", on);
          b.setAttribute("aria-current", on ? "true" : "false");
        });
        ensureChipFullyVisible(btn);
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    function ensureChipFullyVisible(chip) {
      if (!chip) return;
      const navRect = sectionChipsEl.getBoundingClientRect();
      const chipRect = chip.getBoundingClientRect();
      const pad = 6;
      if (chipRect.left < navRect.left + pad) {
        sectionChipsEl.scrollBy({
          left: chipRect.left - navRect.left - pad,
          behavior: "smooth",
        });
      } else if (chipRect.right > navRect.right - pad) {
        sectionChipsEl.scrollBy({
          left: chipRect.right - navRect.right + pad,
          behavior: "smooth",
        });
      }
    }

    let lastActiveId = null;
    function updateActive() {
      syncStickyMetrics();
      const marker = stickyHeadEl.getBoundingClientRect().bottom + 4;
      let current = sections[0];
      for (const sec of sections) {
        if (sec.getBoundingClientRect().top <= marker) current = sec;
      }

      // Short final sections never reach the sticky marker — when the page is
      // scrollable and we're at the bottom, force the last section active.
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (maxScroll > 8 && window.scrollY >= maxScroll - 12) {
        current = sections[sections.length - 1];
      }

      let activeChip = null;
      sectionChipsEl.querySelectorAll(".menu-section-chip").forEach((btn) => {
        const on = btn.dataset.section === current?.id;
        btn.classList.toggle("active", on);
        btn.setAttribute("aria-current", on ? "true" : "false");
        if (on) activeChip = btn;
      });
      if (current?.id !== lastActiveId) {
        lastActiveId = current?.id ?? null;
        ensureChipFullyVisible(activeChip);
      }
    }

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    sectionSpyCleanup = () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }

  function render() {
    titleEl.textContent = currentMenu.festival || "Festival Food";
    const disclaimer = currentMenu.disclaimer || "";
    disclaimerEl.textContent = disclaimer;
    updatedEl.textContent = currentMenu.published_at
      ? `${disclaimer ? " · " : ""}Menu updated ${currentMenu.published_at}`
      : "";
    renderFilters();

    const vendors = filteredVendors(currentMenu, activeFilters, query);
    if (!vendors.length) {
      contentEl.innerHTML = "<p class='muted'>No menu items for the current filters.</p>";
      setupSectionNav();
      return;
    }
    if (view === "vendor") contentEl.innerHTML = renderVendorView(vendors);
    else if (view === "cuisine") contentEl.innerHTML = renderCuisineView(vendors);
    else contentEl.innerHTML = renderDietView(vendors, currentMenu.filter_facets);
    setupSectionNav();
    requestAnimationFrame(syncStickyMetrics);
  }

  searchEl.addEventListener("input", (e) => {
    query = e.target.value;
    render();
  });

  resetFiltersEl.addEventListener("click", () => {
    activeFilters.clear();
    render();
  });

  filtersOpenBtn?.addEventListener("click", () => setFiltersSheetOpen(true));
  filtersCloseBtn?.addEventListener("click", () => setFiltersSheetOpen(false));
  filtersSheetEl?.addEventListener("click", (e) => {
    if (e.target === filtersSheetEl) setFiltersSheetOpen(false);
  });
  legendOpenBtn?.addEventListener("click", () => setLegendSheetOpen(true));
  legendCloseBtn?.addEventListener("click", () => setLegendSheetOpen(false));
  legendSheetEl?.addEventListener("click", (e) => {
    if (e.target === legendSheetEl) setLegendSheetOpen(false);
  });
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (legendSheetEl?.classList.contains("is-open")) setLegendSheetOpen(false);
    else if (filtersSheetEl?.classList.contains("is-open")) setFiltersSheetOpen(false);
  });
  window.addEventListener("resize", () => {
    placeFiltersForViewport();
    if (!isMobileFiltersSheet()) {
      setFiltersSheetOpen(false);
      setLegendSheetOpen(false);
    }
    syncStickyMetrics();
  });

  container.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".view-btn").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      view = btn.dataset.view;
      render();
    });
  });

  setupDietBadgeHandlers(container);
  setupIconLegendToggle(container);

  placeFiltersForViewport();
  render();

  return {
    setMenu(nextMenu) {
      currentMenu = nextMenu;
      render();
    },
  };
}
