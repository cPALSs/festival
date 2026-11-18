# Festival Season Networks

Open-source assets for **Lunar New Year & Autumn Festivals** season coordination in Greater Sacramento and beyond.

**Site:** [festival.cpalss.com](https://festival.cpalss.com/) (human-friendly guides) · **Repo:** [github.com/cPALSs/festival](https://github.com/cPALSs/festival) (clone for AI agents and structured assets)

**Pages deploy:** GitHub Actions workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) — Jekyll build from `docs/` on every push to `main` (same pattern as EGLNY / GLF site repos). Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.

> Live research data is in Google Sheets. Site pages publish substance only — empty stubs are not kept on GitHub Pages.

## What this is

- **Not** a membership org or event owner
- **Neutral** shared calendars, market research, ecosystem graphs, playbooks, group-activity kits, and case studies
- **Decentralized but coordinated** — fork, plan with AI, run your own simulations

## Principles (P1–P4)

| | Question |
|---|----------|
| **P1** | When? Roll-up calendar (warm-up → capstone → afterglow) |
| **P2** | Who on-site? Named groups, home bases |
| **P3** | How big? Right-sizing + group-based marketing |
| **P4** | Who else wins? Vendors, sponsors, event org — financially sustainable |

## Repository layout

```
docs/           → GitHub Pages (human-friendly); same files in the clone
assets/         → Schemas, graphs, calendars, kits (agents read from clone)
AGENTS.md       → AI agent entry point after git clone
```

**Live tabular research** is in **Google Sheets** — links in [assets/sheets-registry.json](assets/sheets-registry.json). Agents use MCP to read/write.

## Quick start

```bash
git clone https://github.com/cPALSs/festival.git
cd festival
```

1. Browse [docs/getting-started.md](docs/getting-started.md) or the [GitHub Pages site](https://festival.cpalss.com/) (humans)
2. Or `git clone` and open [AGENTS.md](AGENTS.md) (AI agents)
3. Configure [Google Workspace MCP](docs/google-workspace-mcp.md) in Cursor (optional — for AI read/write)
4. Load: **sheets registry → MCP read research → graph → calendar → kits / case studies**

## Seasons

| Network | Path | Status |
|---------|------|--------|
| LNY | [docs/lny/](docs/lny/) | Market research guide |
| Autumn | [docs/autumn/](docs/autumn/) | Market research guide |
| Cross-season | [docs/season-coordination.md](docs/season-coordination.md) · [docs/child-audience/](docs/child-audience/) · [staff recruitment checklist](docs/staff-recruitment-checklist.md) · [weather cancel aid](docs/weather-cancel-aid.md) | Season coordination, child audience, recruitment, NWS cancel aid |

## Toolkit (site names → repo)

Human-friendly names on [festival.cpalss.com](https://festival.cpalss.com/):

| Toolkit name | Guide | Clone / run |
|--------------|-------|-------------|
| Auspicious Date Picker | [docs/auspicious-date-picker.md](docs/auspicious-date-picker.md) | Season weekend engines under `docs/lny/` · `docs/autumn/` |
| Weather Risk Monitor | [docs/weather-cancel-aid.md](docs/weather-cancel-aid.md) | [tools/weather-cancel-aid/](tools/weather-cancel-aid/) |
| Food Menu Curator | [docs/food-menu-curator.md](docs/food-menu-curator.md) | [tools/food-curation-engine/](tools/food-curation-engine/) |

## Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CONTRIBUTING-RESEARCH.md](assets/autumn/research/CONTRIBUTING-RESEARCH.md).

**Reach out:** [contact@cpalss.com](mailto:contact@cpalss.com) — questions about the network, season research, or partnering on these assets.

## License

MIT — see [LICENSE](LICENSE).
