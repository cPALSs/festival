# festival.cpalss.com — site source (monorepo)

**Public site:** https://festival.cpalss.com · GitHub Pages repo [`cPALSs/festival`](https://github.com/cPALSs/festival)

Unified MAF hub — home, team, about, **Fund the Festival** at `/build/`, **Custom Zones** at `/host.html`.

## Pages

| Path | File |
|------|------|
| `/` | `index.html` |
| `/team.html` | Product lane recruitment (from `data/site.json`) |
| `/host.html` | **Custom Zones** — hero, prompts, examples, desktop TOC (`data/site.json` + `data/sku-catalog.json`) |
| `/about.html` | Trung Thu + coalition |
| `/build/` | **Fund the Festival** — interactive sponsor registry (MAF only) |

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
- http://localhost:8765/host.html
- http://localhost:8765/build/

## Publish

From repo root:

```bash
./scripts/publish_festival_site.sh /Users/bao/festival
```

Live: https://festival.cpalss.com
