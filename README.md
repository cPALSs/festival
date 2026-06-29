# festival.cpalss.com — site source (monorepo)

**Public site:** https://festival.cpalss.com · GitHub Pages repo [`cPALSs/festival`](https://github.com/cPALSs/festival)

Unified MAF hub — home, team, about, **Build the Festival (MAF only)** at `/build/`.

## Pages

| Path | File |
|------|------|
| `/` | `index.html` |
| `/team.html` | Product lane recruitment (from `data/site.json`) |
| `/about.html` | Trung Thu + coalition |
| `/build/` | Interactive sponsor builder (MAF only) |

## Content

- **`data/site.json`** — recruitment + about copy ([Open Leadership Roles](../Open%20Leadership%20Roles%20-%20Recruitment%20Copy.md))
- **`data/maf-2026.json`** — Build the Festival data (from `build_maf_budget.py`)
- **`data/festivals.json`** — BTF manifest — MAF only

## Local preview

```bash
cd "Projects - Mid-Autumn Festival/2026/Marketing/maf-site"
python3 -m http.server 8765
```

- http://localhost:8765/
- http://localhost:8765/team.html
- http://localhost:8765/build/
- http://localhost:8765/about.html

## Publish

```bash
git clone git@github.com:cPALSs/festival.git ~/festival   # once
/Users/bao/cPALSs/scripts/publish_festival_site.sh ~/festival
cd ~/festival && git add -A && git commit -m "Update site" && git push
```

Regenerates MAF JSON via `build_maf_budget.py`, then rsyncs this folder to the publish repo.

## Link policy

No monorepo paths in public JSON or HTML — [.cursor/rules/github-pages-public-sites.mdc](../../../../.cursor/rules/github-pages-public-sites.mdc)
