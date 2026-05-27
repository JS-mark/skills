# Project Structure

## Top-level layout

```
skills/
├── skills/          → Claude Code Skills (pure Markdown, not in pnpm workspace)
├── packages/        → Reusable TypeScript libraries (pnpm workspace)
├── apps/            → Deployable applications & sites (pnpm workspace)
├── scripts/         → Dev scripts (gen-skill / update-plugin)
├── .github/         → GitHub Actions workflows
├── .claude/         → Project-level Claude Code config (skill symlinks live here)
├── package.json     → Root config (provides docs:dev / market:dev aliases)
├── pnpm-workspace.yaml
├── eslint.config.ts
├── vitest.config.ts
└── tsconfig.json
```

## Skills

Each Skill is a standalone directory of Markdown instructions plus optional references:

```
skills/
├── agent-pipeline/         # Multi-Agent Collaborative Pipeline
├── github-trend-analyzer/  # GitHub trend analysis + project blueprint
├── drama-writer/           # Short drama screenwriting
├── novel-writer/           # Novel writing
├── feature-planner/        # Feature planning
├── i18n-helper/            # Internationalization
└── iconfont-downloader/    # Iconfont icon downloader
```

Minimal layout (e.g. `github-trend-analyzer`):

```
skills/github-trend-analyzer/
├── SKILL.md            # YAML frontmatter + Markdown instructions
└── references/         # Reference docs / helper scripts
    ├── github-api.md
    ├── analysis-template.md
    └── send-report.py
```

::: tip
`skills/` is **not part of** the pnpm workspace — pure Markdown, no build step. Symlink an entry under `.claude/skills/` to make a repo-local skill instantly available in Claude Code.
:::

## Packages

Reusable TypeScript libraries managed via pnpm workspace:

```
packages/
├── agent-pipeline/             # @aspect-mark/agent-pipeline
│   ├── src/
│   │   ├── server.js           # MCP Server implementation
│   │   └── cli.js              # CLI entry
│   └── dashboard/              # Bundled pipeline-dashboard static export
├── pipeline-dashboard/         # @aspect-mark/pipeline-dashboard (private)
│   ├── app/                    # Next.js 15 App Router
│   ├── components/
│   └── next.config.ts
└── shared/                     # @aspect-mark/shared
    ├── src/
    ├── test/
    └── tsdown.config.ts
```

| Package | Role |
|---------|------|
| `agent-pipeline` | MCP server, invoked via `npx` (published to npm) |
| `pipeline-dashboard` | Web monitoring UI for agent-pipeline (private; copied into agent-pipeline at build time) |
| `shared` | Shared utility functions (tsdown emits ESM + CJS + dts) |

## Apps

End-user-facing applications & sites:

```
apps/
├── docs/                  # @aspect-mark/docs (VitePress 1.x, GitHub Pages)
└── marketplace/           # @aspect-mark/marketplace (Nuxt 3, Vercel / Docker)
```

| App | Deploy target | Description |
|-----|---------------|-------------|
| `docs` | GitHub Pages | This documentation site, bilingual |
| `marketplace` | Vercel SSR / Docker | SkillForge — Skill & MCP marketplace |

## Configuration files

| File | Purpose |
|------|---------|
| `pnpm-workspace.yaml` | Workspace scope (`packages/*` + `apps/*`) and dependency catalog |
| `eslint.config.ts` | ESLint config (`@antfu/eslint-config`) |
| `vitest.config.ts` | Vitest test config |
| `tsconfig.json` | TypeScript config |
| `.npmrc` | pnpm config |
| `.gitignore` | Ignores `apps/docs/.vitepress/{dist,cache}` and other build artifacts |

## Code style

- ESLint via [@antfu/eslint-config](https://github.com/antfu/eslint-config) — no Prettier
- [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
- `skills/**` and `apps/docs/**` are excluded from linting
- All package names use the `@aspect-mark/` scope
- Shared devDependencies referenced via `catalog:`
