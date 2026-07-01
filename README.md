# festival.cpalss.com — site source (monorepo)

**Public site:** https://festival.cpalss.com · GitHub Pages repo [`cPALSs/festival`](https://github.com/cPALSs/festival)

Unified MAF hub — clean URLs, no `.html` in public paths.

## Pages

| URL | Source |
|-----|--------|
| `/` | `index.html` (redirects `/index.html` → `/`) |
| `/team/` | `team/index.html` |
| `/about/` | `about/index.html` |
| `/custom-zones/` | **Custom Zones** — hero, prompts, examples, desktop TOC |
| `/fund-the-festival/` | **Fund the Festival** — interactive sponsor registry (MAF only) |

Legacy redirects (via `clean-urls.js`): `/host.html` → `/custom-zones/`, `/build/` → `/fund-the-festival/`, `/about.html` → `/about/`, `/team.html` → `/team/`.

## Content

- **`data/site.json`** — recruitment + about + Custom Zones copy
- **`data/sku-catalog.json`** — SKU inventory master (vendor Eventeny sync + zone Partnerships quotes)
- **`data/maf-2026.json`** — Fund the Festival data (from `build_maf_budget.py`)
- **`data/festivals.json`** — BTF manifest — MAF only
- **`assets/custom-zones-hero.webp`** — Custom Zones hero image (replace with photography when ready)

## Local preview

```bash
cd "Projects - Mid-Autumn Festival/2026/Marketing/maf-site"
python3 -m http.server 8765
```

- http://localhost:8765/
- http://localhost:8765/custom-zones/
- http://localhost:8765/fund-the-festival/

## Publish

From repo root:

```bash
./scripts/publish_festival_site.sh /Users/bao/festival
```

Live: https://festival.cpalss.com
