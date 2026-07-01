/** Shared shell for festival.cpalss.com — scoped to avoid clashing with build/app.js globals */
(function () {
  const SITE_DATA_URL = "data/site.json";
  const SKU_CATALOG_URL = "data/sku-catalog.json";
  const THEME_STORAGE_KEY = "maf-theme";
  const VALID_THEMES = new Set(["auto", "light", "dark"]);

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatProse(text) {
    return escapeHtml(text).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }

  function loadThemeFromStorage() {
    try {
      const theme = localStorage.getItem(THEME_STORAGE_KEY);
      return VALID_THEMES.has(theme) ? theme : "auto";
    } catch {
      return "auto";
    }
  }

  function themeIconMarkup(theme) {
    const icons = {
      auto: `<svg class="theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3v18"/></svg>`,
      light: `<svg class="theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`,
      dark: `<svg class="theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    };
    return icons[theme] ?? icons.auto;
  }

  function themeLabel(theme) {
    return { auto: "System", light: "Light", dark: "Dark" }[theme] ?? "System";
  }

  function renderThemeControl() {
    const options = ["auto", "light", "dark"]
      .map(
        (value) =>
          `<button type="button" class="theme-menu-item" role="menuitemradio" data-theme-option="${value}" aria-checked="false">${themeLabel(value)}</button>`,
      )
      .join("");

    return `
      <div class="theme-dropdown">
        <button type="button" class="icon-btn theme-toggle" id="theme-toggle" aria-expanded="false" aria-haspopup="menu" aria-controls="theme-menu" aria-label="Color theme">
          ${themeIconMarkup("auto")}
        </button>
        <div id="theme-menu" class="theme-menu" role="menu" hidden>
          ${options}
        </div>
      </div>`;
  }

  function applyTheme(theme) {
    const next = VALID_THEMES.has(theme) ? theme : "auto";
    document.documentElement.setAttribute("data-theme", next);

    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.innerHTML = `${themeIconMarkup(next)}<span class="sr-only">Color theme: ${themeLabel(next)}</span>`;
      toggle.setAttribute("aria-label", `Color theme: ${themeLabel(next)}`);
    }

    document.querySelectorAll("[data-theme-option]").forEach((item) => {
      item.setAttribute("aria-checked", item.dataset.themeOption === next ? "true" : "false");
    });
  }

  function setTheme(theme) {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }

  let closeNavMenu = () => {};

  function closeThemeMenu() {
    const dropdown = document.querySelector(".theme-dropdown");
    const toggle = document.getElementById("theme-toggle");
    const menu = document.getElementById("theme-menu");
    if (!dropdown || !toggle || !menu) return;
    dropdown.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  }

  function initThemeDropdown() {
    const dropdown = document.querySelector(".theme-dropdown");
    const toggle = document.getElementById("theme-toggle");
    const menu = document.getElementById("theme-menu");
    if (!dropdown || !toggle || !menu) return;

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const opening = !dropdown.classList.contains("is-open");
      closeThemeMenu();
      if (opening) {
        closeNavMenu();
        dropdown.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        menu.hidden = false;
      }
    });

    menu.querySelectorAll("[data-theme-option]").forEach((item) => {
      item.addEventListener("click", () => {
        setTheme(item.dataset.themeOption);
        closeThemeMenu();
      });
    });

    document.addEventListener("click", (event) => {
      if (!dropdown.contains(event.target)) closeThemeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeThemeMenu();
    });
  }

  function initTheme() {
    applyTheme(loadThemeFromStorage());
    initThemeDropdown();
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (loadThemeFromStorage() === "auto") applyTheme("auto");
    });
  }

  function navPrefix() {
    const inSubdir =
      window.location.pathname.includes("/build/") ||
      window.location.pathname.includes("/2026/");
    if (
      inSubdir ||
      window.location.pathname.endsWith("/build") ||
      window.location.pathname.endsWith("/2026")
    ) {
      return "../";
    }
    return "";
  }

  function toTitleCase(title) {
    const small = new Set(["a", "an", "the", "and", "or", "but", "for", "nor", "on", "at", "to", "by", "of", "in"]);
    return title
      .split(/(\s+|—|--)/)
      .map((part, index, parts) => {
        if (/^(\s+|—|--)$/.test(part)) return part;
        const lower = part.toLowerCase();
        const wordIndex = parts.slice(0, index).filter((p) => !/^(\s+|—|--)$/.test(p)).length;
        if (wordIndex > 0 && small.has(lower)) return lower;
        if (/^\d/.test(part)) {
          return part.replace(/[a-z]+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
        }
        return lower.replace(/(^|[\s-])([\p{L}])/gu, (match, prefix, letter) => prefix + letter.toUpperCase());
      })
      .join("");
  }

  function getNavPages(prefix) {
    return [
      { id: "home", label: "Home", href: `${prefix}index.html` },
      { id: "about", label: "About", href: `${prefix}about.html` },
      { id: "team", label: "Team", href: `${prefix}team.html` },
      {
        id: "production",
        label: "Production",
        href: `${prefix}host.html`,
        children: [
          { id: "host", label: "Custom Zones", href: `${prefix}host.html` },
          { id: "build", label: "Fund the Festival", href: `${prefix}build/` },
        ],
      },
    ];
  }

  function renderNavLinks(pages, activePage) {
    return pages
      .map((page) => {
        if (page.children?.length) {
          const parentCurrent = page.id === activePage ? ' aria-current="page"' : "";
          const childActive = page.children.some((child) => child.id === activePage);
          const sublinks = page.children
            .map((child) => {
              const childCurrent = child.id === activePage ? ' aria-current="page"' : "";
              const external = child.external ? ' target="_blank" rel="noopener"' : "";
              return `<a class="site-nav-sublink" href="${child.href}"${childCurrent}${external}>${escapeHtml(toTitleCase(child.label))}</a>`;
            })
            .join("");
          return `<div class="site-nav-group${childActive ? " is-active" : ""}"><a class="site-nav-parent" href="${page.href}"${parentCurrent}>${escapeHtml(toTitleCase(page.label))}</a><div class="site-nav-submenu">${sublinks}</div></div>`;
        }
        const current = page.id === activePage ? ' aria-current="page"' : "";
        return `<a href="${page.href}"${current}>${escapeHtml(toTitleCase(page.label))}</a>`;
      })
      .join("");
  }

  function renderNav(activePage) {
    const prefix = navPrefix();
    const pages = getNavPages(prefix);

    const links = renderNavLinks(pages, activePage);

    return `
    <nav class="site-nav" aria-label="Main">
      <div class="site-nav-bar">
        <a class="site-nav-brand" href="${prefix}index.html">
          <span class="site-nav-brand-full">Mid-Autumn <span>Festival 2026</span></span>
          <span class="site-nav-brand-short">MAF <span>2026</span></span>
        </a>
        <div class="site-nav-end">
          ${renderThemeControl()}
          <button type="button" class="icon-btn site-nav-toggle" aria-expanded="false" aria-controls="site-nav-drawer">
            <span class="site-nav-toggle-bars" aria-hidden="true"><span></span><span></span><span></span></span>
            <span class="sr-only">Open menu</span>
          </button>
        </div>
      </div>
      <div class="site-nav-backdrop" hidden aria-hidden="true"></div>
      <div id="site-nav-drawer" class="site-nav-drawer" aria-hidden="true">
        <div class="site-nav-links">${links}</div>
      </div>
    </nav>
  `;
  }

  function initNavMenu() {
    const nav = document.querySelector(".site-nav");
    if (!nav) return;

    const toggle = nav.querySelector(".site-nav-toggle");
    const drawer = nav.querySelector("#site-nav-drawer");
    const backdrop = nav.querySelector(".site-nav-backdrop");
    const srLabel = toggle?.querySelector(".sr-only");
    if (!toggle || !drawer) return;

    const desktopQuery = window.matchMedia("(min-width: 880px)");

    function setOpen(open) {
      if (desktopQuery.matches) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        drawer.setAttribute("aria-hidden", "false");
        if (backdrop) {
          backdrop.hidden = true;
          backdrop.setAttribute("aria-hidden", "true");
        }
        document.body.classList.remove("nav-open");
        if (srLabel) srLabel.textContent = "Open menu";
        return;
      }
      if (open) closeThemeMenu();
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
      if (backdrop) {
        backdrop.hidden = !open;
        backdrop.setAttribute("aria-hidden", open ? "false" : "true");
      }
      document.body.classList.toggle("nav-open", open);
      if (srLabel) srLabel.textContent = open ? "Close menu" : "Open menu";
    }

    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));

    if (backdrop) {
      backdrop.addEventListener("click", () => setOpen(false));
    }

    nav.querySelectorAll(".site-nav-links a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) setOpen(false);
    });

    desktopQuery.addEventListener("change", (event) => {
      if (event.matches) setOpen(false);
    });

    closeNavMenu = () => setOpen(false);

    if (desktopQuery.matches) {
      drawer.setAttribute("aria-hidden", "false");
    }
  }

  function mountNav(activePage) {
    const slot = document.getElementById("site-nav");
    if (slot) slot.innerHTML = renderNav(activePage);
  }

  function renderFooterNavLinks(pages) {
    return pages
      .flatMap((page) => {
        const items = [`<a href="${page.href}">${escapeHtml(toTitleCase(page.label))}</a>`];
        if (page.children?.length) {
          for (const child of page.children) {
            const external = child.external ? ' target="_blank" rel="noopener"' : "";
            items.push(`<a href="${child.href}"${external}>${escapeHtml(toTitleCase(child.label))}</a>`);
          }
        }
        return items;
      })
      .join("");
  }

  function renderFooter(site) {
    const prefix = navPrefix();
    const navLinks = renderFooterNavLinks(getNavPages(prefix));
    const footer = site?.footer ?? {};
    const coalition = (footer.coalitionLinks ?? [])
      .map((link) => `<a href="${escapeHtml(link.href)}" target="_blank" rel="noopener">${escapeHtml(link.label)}</a>`)
      .join(" + ");

    return `
    <footer class="site-footer">
      <nav class="site-footer-nav" aria-label="Footer">${navLinks}</nav>
      <p class="site-footer-meta">midautumn@cpalss.com${coalition ? ` · (${coalition})` : ""}</p>
    </footer>
  `;
  }

  function mountFooter(site) {
    const slot = document.getElementById("site-footer");
    if (!slot) return;
    slot.innerHTML = renderFooter(site);
  }

  async function loadSkuCatalog() {
    const prefix = navPrefix();
    const res = await fetch(`${prefix}${SKU_CATALOG_URL}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Could not load SKU catalog (${res.status})`);
    return res.json();
  }

  function skuById(catalog, id) {
    const pools = [catalog.vendors, catalog.zoneBaselines, catalog.hosted, catalog.addons, catalog.packageTemplates];
    for (const pool of pools) {
      const hit = (pool ?? []).find((item) => item.id === id);
      if (hit) return hit;
    }
    return null;
  }

  function renderSkuStack(addonIds, catalog) {
    if (!addonIds?.length) return "";
    const items = addonIds
      .map((id) => {
        const sku = skuById(catalog, id);
        return sku ? `<li><code>${escapeHtml(id)}</code> — ${escapeHtml(sku.name)}</li>` : `<li><code>${escapeHtml(id)}</code></li>`;
      })
      .join("");
    return `<ul class="sku-stack">${items}</ul>`;
  }

  function zoneStandardSpaceCount(zone) {
    return zone.standardSpaceCount ?? zone.boothPadCapacity ?? 0;
  }

  function formatStandardSpaces(count) {
    if (count === 1) return "1 adjacent spot (10×10)";
    return `${count} adjacent spots (10×10 each)`;
  }

  function zoneOpenCookingCap(zone) {
    return zone.openCookingSpotCap ?? 0;
  }

  function formatOpenCookingCap(count) {
    if (count === 0) return "No open-cooking upgrades";
    if (count === 1) return "Up to 1 spot → open cooking";
    return `Up to ${count} spots → open cooking`;
  }

  function zoneZonesRemaining(zone) {
    const remaining = zone.inventory?.zonesRemaining;
    return remaining === undefined || remaining === null ? null : Number(remaining);
  }

  function formatZoneAvailability(zone) {
    const remaining = zoneZonesRemaining(zone);
    if (remaining === null) return null;
    const cap = zone.inventory?.siteCap;
    if (remaining <= 0) {
      return cap ? `0 of ${cap} on the map` : "Sold out";
    }
    const zoneWord = remaining === 1 ? "zone" : "zones";
    if (cap && cap !== remaining) {
      return `${remaining} ${zoneWord} remaining · ${cap} on the map`;
    }
    if (cap) {
      return `${remaining} of ${cap} on the map`;
    }
    return `${remaining} ${zoneWord} remaining`;
  }

  function renderZoneAvailabilityBadge(zone) {
    const remaining = zoneZonesRemaining(zone);
    if (remaining === null) return "";
    const label = formatZoneAvailability(zone);
    const soldOut = remaining <= 0;
    return `<span class="zone-availability-badge${soldOut ? " zone-availability-badge--sold-out" : ""}">${escapeHtml(label)}</span>`;
  }

  function formatZoneRemainingShort(zone) {
    const remaining = zoneZonesRemaining(zone);
    if (remaining === null) return "";
    if (remaining <= 0) return "Sold out";
    return `${remaining} remaining`;
  }

  function formatZoneFoodLine(zone) {
    const openCook = zoneOpenCookingCap(zone);
    if (openCook === 0) return "No open-cooking spots. Any spot can sell prepacked food.";
    if (openCook === 1) return "Up to 1 open-cooking spot 🍳. Any spot can sell prepacked food.";
    return `Up to ${openCook} open-cooking spots 🍳. Any spot can sell prepacked food.`;
  }

  function sortZonesBySize(zones) {
    const order = { Small: 0, Medium: 1, Large: 2 };
    return [...zones].sort((a, b) => (order[a.sizeLabel] ?? 99) - (order[b.sizeLabel] ?? 99));
  }

  function renderZoneTierCard(zone, diy) {
    const count = zoneStandardSpaceCount(zone);
    const remaining = formatZoneRemainingShort(zone);
    const soldOut = zoneZonesRemaining(zone) !== null && zoneZonesRemaining(zone) <= 0;
    const badge = remaining
      ? `<span class="zone-availability-badge${soldOut ? " zone-availability-badge--sold-out" : ""}">${escapeHtml(remaining)}</span>`
      : "";

    return `
    <article class="zone-tier-card">
      <header class="zone-tier-header">
        <div class="zone-tier-header-main">
          <h3 class="zone-tier-name">${escapeHtml(zone.sizeLabel)}</h3>
          <p class="zone-tier-audience">${escapeHtml(zone.guestCapacityGuide ?? "")}</p>
        </div>
        ${badge}
      </header>
      <div class="zone-tier-diagram">${renderZoneDiagramSvg(zone, diy?.plazaHint, { layout: "tier" })}</div>
      <dl class="zone-tier-stats">
        <div><dt>Spots</dt><dd>${escapeHtml(formatStandardSpaces(count))}</dd></div>
        <div><dt>Food</dt><dd>${escapeHtml(formatZoneFoodLine(zone))}</dd></div>
      </dl>
    </article>`;
  }

  function renderZonePricingTiers(zones, diy) {
    const sorted = sortZonesBySize(zones);
    const cards = sorted
      .map((zone) => renderZoneTierCard(zone, diy))
      .join("");

    return `<div class="zone-pricing-grid" role="list">${cards}</div>`;
  }

  function renderZoneDiagramSvg(zone, plazaHint, options = {}) {
    const count = zoneStandardSpaceCount(zone);
    const openCook = zoneOpenCookingCap(zone);
    const hint = plazaHint ?? "Tables, chairs, decor allowed";
    const tierLayout = options.layout === "tier";

    let spotSize;
    let gap;
    let padX;
    let spotY;
    let plazaY;
    let plazaH;
    let svgW;
    let svgH;
    let rowWidth;
    let spotsX;
    let plazaW;
    let plazaX;

    if (tierLayout) {
      svgW = 320;
      padX = 20;
      gap = 8;
      spotY = 14;
      plazaH = 52;
      plazaY = 66;
      svgH = plazaY + plazaH + 8;
      const usableW = svgW - padX * 2;
      spotSize = Math.min(40, Math.floor((usableW - (count - 1) * gap) / count));
      rowWidth = count * spotSize + (count - 1) * gap;
      spotsX = (svgW - rowWidth) / 2;
      plazaW = Math.min(rowWidth + 24, svgW - padX);
      plazaX = (svgW - plazaW) / 2;
    } else {
      spotSize = count > 6 ? 36 : 44;
      gap = count > 6 ? 8 : 10;
      rowWidth = count * spotSize + (count - 1) * gap;
      padX = 20;
      spotY = 20;
      plazaY = spotY + spotSize + 14;
      plazaH = 56;
      svgW = Math.max(rowWidth + padX * 2, 260);
      svgH = plazaY + plazaH + 8;
      plazaW = rowWidth + 24;
      plazaX = (svgW - plazaW) / 2;
      spotsX = (svgW - rowWidth) / 2;
    }

    const spotLabelSize = spotSize <= 32 ? 8 : spotSize <= 36 ? 9 : 10;
    const flameSize = spotSize <= 32 ? 11 : spotSize <= 36 ? 12 : 14;
    const spots = Array.from({ length: count }, (_, i) => {
      const x = spotsX + i * (spotSize + gap);
      const cx = x + spotSize / 2;
      const cy = spotY + spotSize / 2 + (spotLabelSize <= 8 ? 2.5 : 3.5);
      const isCooking = i < openCook;
      const spotClass = isCooking ? "zone-diagram-spot zone-diagram-spot--open" : "zone-diagram-spot";
      const label = isCooking
        ? `<text class="zone-diagram-cook-icon" x="${cx}" y="${cy}" text-anchor="middle" font-size="${flameSize}" aria-hidden="true">🍳</text>`
        : `<text class="zone-diagram-spot-label" x="${cx}" y="${cy}" text-anchor="middle" font-size="${spotLabelSize}">10×10</text>`;
      return `<rect class="${spotClass}" x="${x}" y="${spotY}" width="${spotSize}" height="${spotSize}" rx="4"/>${label}`;
    }).join("");

    const svgClass = tierLayout ? "zone-diagram-svg zone-diagram-svg--tier" : "zone-diagram-svg";

    return `
    <svg class="${svgClass}" viewBox="0 0 ${svgW} ${svgH}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${escapeHtml(zone.sizeLabel)} zone — ${count} spots above plaza">
      ${spots}
      <rect class="zone-diagram-plaza" x="${plazaX}" y="${plazaY}" width="${plazaW}" height="${plazaH}" rx="6"/>
      <text class="zone-diagram-plaza-label" x="${svgW / 2}" y="${plazaY + 22}" text-anchor="middle">Plaza</text>
      <text class="zone-diagram-plaza-hint" x="${svgW / 2}" y="${plazaY + 40}" text-anchor="middle">${escapeHtml(hint)}</text>
    </svg>`;
  }

  function renderAddonCategorySlide(cat, addons, index, defaultIndex) {
    const items = addons.filter((a) => a.category === cat.id);
    const list = items
      .map(
        (addon) => `
        <li class="host-addon-item">
          <p class="host-addon-name">${escapeHtml(addon.name)}</p>
          <p class="muted host-addon-desc">${escapeHtml(addon.publicDescription)}</p>
        </li>`,
      )
      .join("");

    return `
    <article class="zone-carousel-slide help-addon-slide${index === defaultIndex ? " is-active" : ""}" data-slide="${index}" aria-hidden="${index === defaultIndex ? "false" : "true"}">
      ${cat.description ? `<p class="muted help-addon-slide-desc">${formatProse(cat.description)}</p>` : ""}
      <ul class="host-addon-list host-addon-list--cols">${list}</ul>
    </article>`;
  }

  function renderAddonCard(addons, categories) {
    const cats = (categories ?? []).filter((cat) => addons.some((a) => a.category === cat.id));
    if (!cats.length) return "";
    const activeIndex = 0;
    const tabs = cats
      .map(
        (cat, i) =>
          `<button type="button" class="zone-size-tab help-addon-tab${i === activeIndex ? " is-active" : ""}" role="tab" aria-selected="${i === activeIndex ? "true" : "false"}" data-slide-to="${i}">${escapeHtml(cat.label)}</button>`,
      )
      .join("");
    const slides = cats.map((cat, i) => renderAddonCategorySlide(cat, addons, i, activeIndex)).join("");

    return `
    <div class="zone-size-card help-addon-card" data-addon-carousel data-default-slide="${activeIndex}">
      <header class="zone-size-card-header help-addon-card-header">
        <div class="help-addon-tabs" role="tablist" aria-label="Add-on categories">${tabs}</div>
      </header>
      <div class="zone-size-card-body">
        <div class="zone-carousel-track">${slides}</div>
      </div>
    </div>`;
  }

  function renderHelpSection(helpSection, ha, catalog) {
    if (!helpSection) return "";
    const sectionId = helpSection.id ?? "bring-to-life";
    const addons = catalog.addons ?? [];
    const categories = ha.addonCategories ?? [];

    return `
    <section id="${escapeHtml(sectionId)}" class="host-doc-section host-help-section" data-host-section data-path="help">
      <h2>${escapeHtml(helpSection.title ?? "Help me bring it to life")}</h2>
      <p class="host-help-lead">${escapeHtml(helpSection.intro ?? "")}</p>
      ${renderAddonCard(addons, categories)}
      ${helpSection.note ? `<p class="muted host-help-note">${escapeHtml(helpSection.note)}</p>` : ""}
    </section>`;
  }

  function renderDiySection(diy, catalog) {
    if (!diy) return "";
    const zones = catalog.zoneBaselines ?? [];
    const sectionId = diy.id ?? "decorate-yourself";

    return `
    <section id="${escapeHtml(sectionId)}" class="host-doc-section host-diy-section" data-host-section data-path="diy">
      <h2>${escapeHtml(diy.title ?? "Decorate it yourself")}</h2>
      <p class="host-diy-lead">${escapeHtml(diy.intro ?? "")}</p>
      ${renderZonePricingTiers(zones, diy)}
      ${diy.inventoryNote ? `<p class="muted host-diy-inventory-note">${escapeHtml(diy.inventoryNote)}</p>` : ""}
    </section>`;
  }

  function initZoneCarousel() {
    document.querySelectorAll("[data-addon-carousel]").forEach((root) => {
      const slides = [...root.querySelectorAll(".zone-carousel-slide")];
      const tabs = [...root.querySelectorAll(".zone-size-tab")];
      const remainingEl = root.querySelector("[data-zone-remaining]");
      if (!slides.length) return;

      let index = Number(root.getAttribute("data-default-slide"));
      if (Number.isNaN(index) || index < 0) {
        index = slides.findIndex((slide) => slide.classList.contains("is-active"));
      }
      if (index < 0) index = 0;

      function setSlide(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, i) => {
          const active = i === index;
          slide.classList.toggle("is-active", active);
          slide.setAttribute("aria-hidden", active ? "false" : "true");
        });
        tabs.forEach((tab, i) => {
          tab.classList.toggle("is-active", i === index);
          tab.setAttribute("aria-selected", i === index ? "true" : "false");
        });
        if (remainingEl) {
          const label = slides[index]?.getAttribute("data-remaining") ?? "";
          remainingEl.textContent = label;
          remainingEl.classList.toggle("zone-availability-badge--sold-out", label === "Sold out");
        }
      }

      tabs.forEach((tab) => {
        tab.addEventListener("click", () => setSlide(Number(tab.getAttribute("data-slide-to"))));
      });

      setSlide(index);
      root.setSlide = setSlide;
    });
  }

  function renderAddonGrid(addons, categories) {
    return categories
      .map((cat) => {
        const items = addons.filter((a) => a.category === cat.id);
        if (!items.length) return "";
        const cards = items
          .map(
            (addon) => `
          <div class="addon-item">
            <p class="addon-name"><code>${escapeHtml(addon.id)}</code> — ${escapeHtml(addon.name)}</p>
            <p class="muted">${escapeHtml(addon.publicDescription)}</p>
          </div>`,
          )
          .join("");
        return `<div class="addon-category"><h3>${escapeHtml(cat.label)}</h3>${cat.description ? `<p class="muted addon-tier-desc">${escapeHtml(cat.description)}</p>` : ""}${cards}</div>`;
      })
      .join("");
  }

  function renderHostStoryCard(study, heroImage, prefix) {
    const you = study.tenantBrings.slice(0, 3).join(" · ");
    const us = study.platformProvides.slice(0, 2).join(" · ");
    const modeAttr = study.mode ? ` data-mode="${escapeHtml(study.mode)}"` : "";
    const imageSrc = study.image ? `${prefix}${study.image}` : heroImage;
    const thumb = imageSrc
      ? `<div class="host-story-thumb" style="background-image:url('${escapeHtml(imageSrc)}')" role="img" aria-label="${escapeHtml(study.title ?? "Example")}"></div>`
      : "";

    return `
    <article class="host-story-card"${modeAttr}>
      ${thumb}
      <div class="host-story-body">
        <p class="host-story-path">${escapeHtml(study.pathLabel ?? study.title)}</p>
        <h3>${escapeHtml(study.title)}</h3>
        <p>${escapeHtml(study.summary)}</p>
        <p class="host-story-meta"><span>You bring</span> ${escapeHtml(you)}</p>
        <p class="host-story-meta"><span>We provide</span> ${escapeHtml(us)}</p>
      </div>
    </article>`;
  }

  function renderVendorSpotModal(vs) {
    const modal = vs?.modal ?? vs ?? {};
    const title = modal.title ?? "Vendor spot";
    const message = modal.message ?? "Vendor registration will open later.";
    const waitlistUrl = modal.waitlistUrl;
    const waitlistLabel = modal.waitlistLabel ?? "Join the vendor waitlist";
    const closeLabel = modal.closeLabel ?? "Close";
    const waitlistBtn = waitlistUrl
      ? `<a class="btn btn-primary" href="${escapeHtml(waitlistUrl)}" target="_blank" rel="noopener">${escapeHtml(waitlistLabel)}</a>`
      : "";

    return `
    <dialog id="vendor-spot-modal" class="site-dialog">
      <form method="dialog" class="site-dialog-inner">
        <header class="site-dialog-header">
          <h2>${escapeHtml(title)}</h2>
        </header>
        <div class="site-dialog-body">
          <p>${escapeHtml(message)}</p>
        </div>
        <footer class="site-dialog-footer">
          ${waitlistBtn}
          <button type="submit" class="btn btn-secondary">${escapeHtml(closeLabel)}</button>
        </footer>
      </form>
    </dialog>`;
  }

  function renderHostPrompts(prompts) {
    const diy = prompts.diy;
    const help = prompts.help;
    const vendor = prompts.vendor;

    return `
    <div class="host-prompt-row">
      <button type="button" class="btn btn-primary host-prompt-btn" data-host-prompt="diy">${escapeHtml(diy.label)}</button>
      <button type="button" class="btn btn-primary host-prompt-btn" data-host-prompt="help">${escapeHtml(help.label)}</button>
      <button type="button" class="host-prompt-vendor" data-host-prompt="vendor">${escapeHtml(vendor.label)}</button>
    </div>`;
  }

  function renderHostToc(tocItems) {
    const links = (tocItems ?? [])
      .map(
        (item) =>
          `<a class="host-doc-toc-link" href="#${escapeHtml(item.id)}" data-toc-target="${escapeHtml(item.id)}">${escapeHtml(item.label)}</a>`,
      )
      .join("");
    return `<nav class="host-doc-toc" aria-label="On this page"><p class="host-doc-toc-label">On this page</p>${links}</nav>`;
  }

  function renderHostApplyBlock(hostApply, prominent) {
    const formUrl = hostApply.formUrl ?? "";
    const formLabel = hostApply.formLabel ?? "Fill out the inquiry form";
    const mailto = hostApply.email
      ? `mailto:${hostApply.email}?subject=${encodeURIComponent(hostApply.emailSubject ?? "MAF 2026 — host inquiry")}`
      : "";

    return `
    <div class="apply-block${prominent ? " apply-block--prominent" : ""}">
      <p>${escapeHtml(hostApply.intro ?? "")}</p>
      <div class="cta-row">
        ${formUrl ? `<a class="btn btn-primary" id="host-contact-form" href="${escapeHtml(formUrl)}">${escapeHtml(formLabel)}</a>` : ""}
        ${mailto ? `<a class="btn btn-secondary" id="host-contact-email" href="${mailto}">Email ${escapeHtml(hostApply.email)}</a>` : ""}
      </div>
      ${hostApply.detailNote ? `<p class="muted">${escapeHtml(hostApply.detailNote)}</p>` : ""}
      ${hostApply.vendorNote ? `<p class="muted">${escapeHtml(hostApply.vendorNote)}</p>` : ""}
      ${hostApply.responseNote ? `<p class="muted">${escapeHtml(hostApply.responseNote)}</p>` : ""}
    </div>`;
  }

  function initHostPageToc(hostApply, prompts) {
    const tocLinks = document.querySelectorAll("[data-toc-target]");
    const sections = document.querySelectorAll("[data-host-section]");
    const vendorModal = document.getElementById("vendor-spot-modal");

    function openVendorModal() {
      if (!vendorModal) return;
      if (typeof vendorModal.showModal === "function") {
        vendorModal.showModal();
      }
    }

    function scrollToSection(id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function setActiveSection(id) {
      tocLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("data-toc-target") === id);
      });
    }

    function updateFormLink(mode) {
      const formLink = document.getElementById("host-contact-form");
      if (!formLink || !hostApply) return;
      const url =
        mode === "diy" && hostApply.prefill?.diy
          ? hostApply.prefill.diy
          : mode === "help" && hostApply.prefill?.help
            ? hostApply.prefill.help
            : hostApply.formUrl;
      if (url) {
        formLink.href = url;
      }
    }

    function updateMailto(mode) {
      const emailLink = document.getElementById("host-contact-email");
      if (!emailLink || !hostApply?.email) return;
      const subject =
        mode === "diy"
          ? prompts?.diy?.mailtoSubject
          : mode === "help"
            ? prompts?.help?.mailtoSubject
            : hostApply.emailSubject;
      if (subject) {
        emailLink.href = `mailto:${hostApply.email}?subject=${encodeURIComponent(subject)}`;
      }
    }

    function highlightStories(mode) {
      document.querySelectorAll(".host-story-card").forEach((card) => {
        const cardMode = card.getAttribute("data-mode");
        card.classList.toggle("is-dimmed", mode && cardMode && cardMode !== mode);
        card.classList.toggle("is-highlighted", mode && cardMode === mode);
      });
    }

    document.querySelectorAll("[data-host-prompt]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const prompt = btn.getAttribute("data-host-prompt");
        if (prompt === "vendor") {
          highlightStories(null);
          openVendorModal();
          return;
        }
        highlightStories(null);
        updateFormLink(prompt);
        updateMailto(prompt);
        const scrollTarget =
          prompt === "diy"
            ? prompts?.diy?.scrollTo ?? "decorate-yourself"
            : prompt === "help"
              ? prompts?.help?.scrollTo ?? "bring-to-life"
              : "examples";
        scrollToSection(scrollTarget);
      });
    });

    tocLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        scrollToSection(link.getAttribute("data-toc-target"));
      });
    });

    function getScrollSpyOffsetPx() {
      const styles = getComputedStyle(document.documentElement);
      const navHeight = parseFloat(styles.getPropertyValue("--nav-height")) || 52;
      const rem = parseFloat(styles.fontSize) || 16;
      return navHeight + rem;
    }

    function pickActiveSection(sectionList) {
      if (!sectionList.length) return null;

      const offset = getScrollSpyOffsetPx();
      const doc = document.documentElement;
      const nearBottom = window.scrollY + window.innerHeight >= doc.scrollHeight - offset;

      if (nearBottom) {
        return sectionList[sectionList.length - 1].id;
      }

      let activeId = sectionList[0].id;
      for (const section of sectionList) {
        if (section.getBoundingClientRect().top <= offset + 1) {
          activeId = section.id;
        }
      }
      return activeId;
    }

    const sectionList = [...sections];
    let scrollSpyScheduled = false;

    function updateScrollSpy() {
      const activeId = pickActiveSection(sectionList);
      if (activeId) setActiveSection(activeId);
    }

    function scheduleScrollSpyUpdate() {
      if (scrollSpyScheduled) return;
      scrollSpyScheduled = true;
      requestAnimationFrame(() => {
        scrollSpyScheduled = false;
        updateScrollSpy();
      });
    }

    window.addEventListener("scroll", scheduleScrollSpyUpdate, { passive: true });
    window.addEventListener("resize", scheduleScrollSpyUpdate, { passive: true });
    if ("onscrollend" in window) {
      window.addEventListener("scrollend", scheduleScrollSpyUpdate, { passive: true });
    }
    scheduleScrollSpyUpdate();

    const hash = window.location.hash.replace("#", "");
    if (hash === "diy" || hash === "decorate-yourself") {
      updateMailto("diy");
      scrollToSection("decorate-yourself");
    } else if (hash === "help" || hash === "bring-to-life") {
      updateMailto("help");
      scrollToSection("bring-to-life");
    }
  }

  function renderAddonMenuSimple(addons, categories) {
    return categories
      .map((cat) => {
        const items = addons.filter((a) => a.category === cat.id);
        if (!items.length) return "";
        const list = items.map((addon) => `<li><strong>${escapeHtml(addon.name)}</strong> — ${escapeHtml(addon.publicDescription)}</li>`).join("");
        return `<div class="host-extras-group"><h4>${escapeHtml(cat.label)}</h4><ul class="host-extras-list">${list}</ul></div>`;
      })
      .join("");
  }

  function renderHostActivations(site, catalog) {
    const ha = site.hostActivations;
    if (!ha) return `<p class="error-panel">Host activations content not configured.</p>`;

    const prefix = navPrefix();
    const heroImage = ha.hero?.heroImage ? `${prefix}${ha.hero.heroImage}` : null;
    const featuredIds = new Set(ha.featuredStoryIds ?? []);
    const featuredStories = (ha.caseStudies ?? []).filter((s) => featuredIds.has(s.id));

    const featuredHtml = featuredStories.map((s) => renderHostStoryCard(s, heroImage, prefix)).join("");
    const faqHtml = (ha.faq ?? [])
      .map((f) => {
        const paragraphs = String(f.a ?? "")
          .split(/\n\n+/)
          .filter(Boolean)
          .map((p) => `<p>${formatProse(p)}</p>`)
          .join("");
        return `<div class="faq-item"><h3>${escapeHtml(f.q)}</h3>${paragraphs}</div>`;
      })
      .join("");

    const vs = ha.vendorSpot ?? {};

    return `
    <div class="host-hero" style="background-image:url('${escapeHtml(heroImage ?? "")}')">
      <div class="host-hero-overlay">
        <div class="host-hero-inner">
          <div class="host-hero-copy">
            <h1 class="host-hero-title">${escapeHtml(ha.hero?.displayTitle ?? "Custom Zones")}</h1>
            ${ha.hero?.tagline ? `<p class="host-hero-tagline">${escapeHtml(ha.hero.tagline)}</p>` : ""}
          </div>
        </div>
      </div>
    </div>

    <section class="host-prompts-section">
      ${renderHostPrompts(ha.prompts ?? {})}
    </section>

    <div class="host-doc-layout">
      ${renderHostToc(ha.toc)}
      <div class="host-doc-main">
        <section id="examples" class="host-doc-section" data-host-section>
          <h2>${escapeHtml(ha.storiesSection?.title ?? "Examples")}</h2>
          <p class="muted">${escapeHtml(ha.storiesSection?.intro ?? "")}</p>
          <div class="host-story-grid">${featuredHtml}</div>
        </section>

        ${renderDiySection(ha.diySection, catalog)}
        ${renderHelpSection(ha.helpSection, ha, catalog)}

        <section id="contact" class="host-doc-section" data-host-section>
          <h2>${escapeHtml(ha.apply?.title ?? "Email us to start")}</h2>
          ${renderHostApplyBlock(ha.apply, true)}
        </section>

        <section id="faq" class="host-doc-section" data-host-section>
          <h2>FAQ</h2>
          ${faqHtml}
        </section>
      </div>
    </div>
    ${renderVendorSpotModal(vs)}`;
  }

  async function loadSiteData() {
    const prefix = navPrefix();
    const res = await fetch(`${prefix}${SITE_DATA_URL}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Could not load site data (${res.status})`);
    return res.json();
  }

  function renderRoleCard(role) {
    const title = role.emoji ? `${role.emoji} ${role.title}` : role.title;
    const phase2 = role.phase2 ? " phase2" : "";
    let body = "<dl>";

    if (role.experience) {
      body += `<dt>What guests experience</dt><dd>${escapeHtml(role.experience)}</dd>`;
    }
    if (role.test) {
      body += `<dt>You'd test</dt><dd>${escapeHtml(role.test)}</dd>`;
    }
    const deliverable = role.ship ?? role.own;
    if (deliverable) {
      body += `<dt>You'd ship</dt><dd>${escapeHtml(deliverable)}</dd>`;
    }
    if (role.get) {
      body += `<dt>You'd get</dt><dd>${escapeHtml(role.get)}</dd>`;
    }
    if (role.fit) body += `<dt>Good fit if you</dt><dd>${escapeHtml(role.fit)}</dd>`;
    body += "</dl>";

    const note = role.note ? `<p class="role-note">${escapeHtml(role.note)}</p>` : "";

    return `<article class="role-card${phase2}"><h3>${escapeHtml(title)}</h3>${body}${note}</article>`;
  }

  function renderApplyBlock(site) {
    const apply = site.apply;
    const idealist = site.meta?.idealistUrl;
    const idealistBtn = idealist
      ? `<a class="btn btn-primary" href="${escapeHtml(idealist)}" target="_blank" rel="noopener">Apply on Idealist</a>`
      : `<span class="btn btn-primary" style="opacity:0.65;cursor:default" title="Idealist link coming soon">Apply on Idealist</span>`;

    const mailto = `mailto:${apply.email}?subject=${encodeURIComponent(apply.emailSubject)}`;

    return `
    <div class="cta-row">
      ${idealistBtn}
      <a class="btn btn-secondary" href="${mailto}">Email ${escapeHtml(apply.email)}</a>
    </div>
    <ol class="steps-list">
      ${apply.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}
    </ol>
    <p class="muted">${escapeHtml(apply.idealistFallback)}</p>
  `;
  }

  function renderCoChairs(site) {
    return site.coChairs
      .map(
        (c) => `
    <div class="co-chair">
      <p class="co-chair-name">${escapeHtml(c.name)}</p>
      <p class="co-chair-title">${escapeHtml(c.title)}</p>
    </div>`,
      )
      .join("");
  }

  function setPageTitle(site, pageTitle) {
    const suffix = site.meta?.titleSuffix ?? "Mid-Autumn Festival 2026";
    document.title = pageTitle
      ? `${toTitleCase(pageTitle)} — ${suffix}`
      : site.meta?.siteName ?? suffix;
  }

  function eventMetaLine1(event) {
    return [event.zodiacYear, event.dates].filter(Boolean).join(" · ");
  }

  function eventMetaLine2(event) {
    return [event.venue, event.tagline].filter(Boolean).join(" · ");
  }

  function renderEventSummary(site) {
    const e = site.event;
    return `<div class="event-summary">
      <p class="event-summary-dates">${escapeHtml(eventMetaLine1(e))}</p>
      <p class="event-summary-meta">${escapeHtml(eventMetaLine2(e))}</p>
    </div>`;
  }

  function renderAboutSections(about) {
    const sections = about.sections ?? [];
    if (sections.length) {
      return sections
        .map(
          (section) => `
      <section class="about-section">
        <h2>${escapeHtml(section.title)}</h2>
        ${section.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("")}
      </section>`,
        )
        .join("");
    }
    return (about.paragraphs ?? []).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  }

  function renderPosterWall(posterWall) {
    if (!posterWall) return "";
    const prefix = navPrefix();
    const cards = (posterWall.posters ?? [])
      .map((poster) => {
        const alt = `Mid-Autumn Festival ${poster.year} — ${poster.venue}`;
        const image = poster.image
          ? `<img class="poster-image" src="${escapeHtml(prefix + poster.image)}" alt="${escapeHtml(alt)}" loading="lazy" />`
          : "";
        return `
      <figure class="poster-card">
        ${image}
        <figcaption class="poster-caption">
          <span class="poster-year">${escapeHtml(String(poster.year))}</span>
          <span class="poster-venue">${escapeHtml(poster.venue)}</span>
        </figcaption>
      </figure>`;
      })
      .join("");

    return `
    <section class="poster-wall">
      <h2>${escapeHtml(posterWall.title ?? "Festival posters over the years")}</h2>
      ${posterWall.intro ? `<p class="muted">${escapeHtml(posterWall.intro)}</p>` : ""}
      <div class="poster-grid">${cards}</div>
      ${posterWall.note ? `<p class="muted">${escapeHtml(posterWall.note)}</p>` : ""}
    </section>`;
  }

  function initPageShell(activePage) {
    mountNav(activePage);
    initTheme();
    initNavMenu();
  }

  window.MafSite = {
    initPageShell,
    loadSiteData,
    loadSkuCatalog,
    mountFooter,
    renderAboutSections,
    renderPosterWall,
    renderApplyBlock,
    renderCoChairs,
    renderEventSummary,
    initHostPageToc,
    initZoneCarousel,
    renderHostActivations,
    renderRoleCard,
    setPageTitle,
    escapeHtml,
    navPrefix,
  };
})();
