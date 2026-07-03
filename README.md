# Festival Season Networks

Open-source assets for **Lunar New Year & Autumn Festivals** season coordination in Greater Sacramento and beyond.

**Site:** [cpalss.github.io/festival-network](https://cpalss.github.io/festival-network/) (human-friendly guides) · **Repo:** [github.com/cPALSs/festival-network](https://github.com/cPALSs/festival-network) (clone for AI agents and structured assets)

> **Phase 0 (current):** Stub scaffold — structure, sheet registry, and placeholders. Live research data is in Google Sheets.

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
git clone https://github.com/cPALSs/festival-network.git
cd festival-network
```

1. Browse [docs/getting-started.md](docs/getting-started.md) or the [GitHub Pages site](https://cpalss.github.io/festival-network/) (humans)
2. Or `git clone` and open [AGENTS.md](AGENTS.md) (AI agents)
3. Configure [Google Sheets MCP](docs/google-sheets-mcp.md) in Cursor (optional — for AI read/write)
4. Load: **sheets registry → MCP read research → graph → calendar → kits / case studies**

## Seasons

| Network | Path | Status |
|---------|------|--------|
| LNY | [docs/lny/](docs/lny/) | Stub scaffold (Phase 4 substance) |
| Autumn | [docs/autumn/](docs/autumn/) | Stub scaffold |
| Cross-season | [docs/child-audience-product-design.md](docs/child-audience-product-design.md) · [assets/shared/playbooks/](assets/shared/playbooks/) | Child cohort product design stub |

## Contribute

See [docs/contribute.md](docs/contribute.md) and [CONTRIBUTING-RESEARCH.md](assets/autumn/research/CONTRIBUTING-RESEARCH.md).

**Reach out:** [contact@cpalss.com](mailto:contact@cpalss.com) — questions about the network, season research, or partnering on these assets.

## License

MIT — see [LICENSE](LICENSE).
