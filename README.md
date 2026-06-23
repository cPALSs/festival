# Festival Season Networks

Open-source, **AI-readable** assets for **Autumn** and **Lunar New Year** festival season coordination in Greater Sacramento and beyond.

**Site:** [cpalss.github.io/festival-network](https://cpalss.github.io/festival-network/) · **Org:** [github.com/cPALSs](https://github.com/cPALSs)

> **Phase 0 (current):** Stub scaffold — structure, sheet registry, and placeholders. Live research data is in Google Sheets.

## What this is

- **Not** a membership org or event owner
- **Not** the cPALSs Festivals Committee repo — see [Related repositories](#related-repositories) below
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
docs/           → GitHub Pages guides (human-friendly)
assets/         → Sheet registry, schemas, graphs, calendars, kits
AGENTS.md       → AI agent entry point (load order, paths)
```

**Live tabular research** is in **Google Sheets** — links in [assets/sheets-registry.json](assets/sheets-registry.json). Agents use MCP to read/write.

## Quick start

```bash
git clone https://github.com/cPALSs/festival-network.git
cd festival-network
```

1. Read [docs/getting-started.md](docs/getting-started.md) or the [GitHub Pages site](https://cpalss.github.io/festival-network/)
2. Configure [Google Sheets MCP](docs/google-sheets-mcp.md) in Cursor (optional — for AI read/write)
3. Open [AGENTS.md](AGENTS.md) in your AI tool
4. Load: **sheets registry → MCP read research → graph → calendar → kits / case studies**

## Seasons

| Network | Path | Status |
|---------|------|--------|
| Autumn | [docs/autumn/](docs/autumn/) | Stub scaffold |
| LNY | [docs/lny/](docs/lny/) | Stub scaffold (Phase 4 substance) |

## Contribute

See [docs/contribute.md](docs/contribute.md) and [CONTRIBUTING-RESEARCH.md](assets/autumn/research/CONTRIBUTING-RESEARCH.md).

## Related repositories

| Repo | Role |
|------|------|
| **[cPALSs/festival-network](https://github.com/cPALSs/festival-network)** (this repo) | **Neutral, public** season-coordination library — research schemas, playbooks, calendars, case studies. Any organizer can fork. Live data in Google Sheets. |
| **[cPALSs/festival](https://github.com/cPALSs/festival)** | **cPALSs Festivals Committee** production tooling — e.g. [Build the Festival](https://festival.cpalss.com) sponsorship builder for coalition events (MAF, LNY). Committee-operated, not the neutral network layer. |

The Festivals Committee runs events; **Festival Season Networks** publishes infrastructure the wider season can share without adopting cPALSs branding or committee governance.

## License

MIT — see [LICENSE](LICENSE).
