# Skills

[中文](./README.zh-CN.md)

A curated collection of **Claude Code Skills** (Markdown-based) and reusable **TypeScript utilities**, organized as a pnpm monorepo.

## What are Skills?

Skills are Markdown files that extend Claude Code's capabilities. Each skill lives in `skills/<name>/SKILL.md` with YAML frontmatter for metadata. They can include reference documents and agent configurations.

## Repository Structure

```
skills/          → Claude Code Skills (pure Markdown)
packages/        → TypeScript utility packages (pnpm workspace)
scripts/         → Development scripts
```

## Skills

| Skill | Description |
|-------|-------------|
| [`agent-pipeline`](./skills/agent-pipeline) | Multi-Agent Collaborative Pipeline — 7-phase dev workflow with 6 AI roles |

## Packages

| Package | Description |
|---------|-------------|
| [`@aspect-mark/agent-pipeline`](./packages/agent-pipeline) | MCP plugin for the multi-agent pipeline |
| [`@aspect-mark/shared`](./packages/shared) | Shared utility functions |

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Generate a new skill scaffold
pnpm gen:skill <skill-name>
```

## License

[MIT](./LICENSE) License © 2026 [圣痕](https://github.com/JS-mark)
