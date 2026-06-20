# Build the Festival

Interactive sponsorship builder for cPALSs festivals — **https://festival.cpalss.com**

Toggle between **Mid-Autumn Festival 2026** and **Lunar New Year 2027** from the header dropdown.

## Source (monorepo)

- App shell: `Projects - Mid-Autumn Festival/2026/Marketing/Build the Festival/`
- MAF data: `Projects - Mid-Autumn Festival/2026/Finance & Administration/festival_registry.json` → `build_maf_budget.py`
- LNY data: `Projects - Lunar New Year/2027/Finance & Administration/festival_registry.json` → `build_lny_budget.py`

## Publish

```bash
git clone git@github.com:cPALSs/festival.git ~/festival   # once
/Users/bao/cPALSs/scripts/publish_festival_site.sh ~/festival
cd ~/festival && git add -A && git commit -m "Update site" && git push
```

## Local preview

```bash
cd "Projects - Mid-Autumn Festival/2026/Marketing/Build the Festival"
python3 -m http.server 8765
```

Open http://localhost:8765 — use `?festival=maf2026` or `?festival=lny2027` to deep-link.

## GitHub Pages

- Custom domain: **festival.cpalss.com** (CNAME `festival` → `cpalss.github.io` at cpalss.com DNS host)
- Files served from repo root
- After DNS propagates, enable **Enforce HTTPS** in repo Settings → Pages
