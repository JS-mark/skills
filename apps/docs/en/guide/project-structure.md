# Project Structure

## Top-Level Directory

```
skills/
├── skills/          → Claude Code Skills (pure Markdown, not in pnpm workspace)
├── packages/        → TypeScript packages (pnpm workspace)
├── scripts/         → Development scripts
├── docs/            → VitePress documentation site
├── .github/         → GitHub Actions workflows
├── package.json     → Root configuration
├── pnpm-workspace.yaml
├── eslint.config.ts
├── vitest.config.ts
└── tsconfig.json
```

## Skills Directory

Each Skill is a standalone directory containing Markdown instruction files and optional reference documents:

```
skills/
├── agent-pipeline/
│   ├── SKILL.md              # Skill instruction definition
│   ├── references/           # Reference documents
│   └── README.md
├── drama-writer/
│   ├── commands/             # Slash commands
│   │   └── drama.md
│   ├── skills/
│   │   └── drama-writer/
│   │       ├── SKILL.md
│   │       └── references/
│   └── README.md
├── feature-planner/
├── i18n-helper/
├── iconfont-downloader/
└── novel-writer/
```

::: tip
The `skills/` directory is **not part of** the pnpm workspace — they are pure Markdown files that don't need building.
:::

## Packages Directory

TypeScript packages managed via pnpm workspace:

```
packages/
├── agent-pipeline/
│   ├── package.json          # @aspect-mark/agent-pipeline
│   └── src/
│       ├── server.js         # MCP Server implementation
│       └── cli.js            # CLI entry point
└── shared/
    ├── package.json          # @aspect-mark/shared
    ├── src/
    │   └── index.ts          # Utility functions
    ├── test/
    │   └── index.test.ts
    └── tsdown.config.ts      # Build configuration
```

## Configuration Files

| File | Description |
|------|-------------|
| `pnpm-workspace.yaml` | Defines workspace scope and catalog dependency versions |
| `eslint.config.ts` | ESLint config (using `@antfu/eslint-config`) |
| `vitest.config.ts` | Vitest test config |
| `tsconfig.json` | TypeScript config |
| `.npmrc` | pnpm config |

## Code Style

- Uses [@antfu/eslint-config](https://github.com/antfu/eslint-config), no Prettier needed
- Follows [Conventional Commits](https://www.conventionalcommits.org/) convention
- `skills/` directory is excluded from linting
