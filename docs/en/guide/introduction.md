# What is Skills

Skills is a collection of Claude Code skills and TypeScript utility packages, organized as a pnpm monorepo.

## Core Concepts

### Claude Code Skills

Skills are **Markdown files** that extend [Claude Code](https://docs.anthropic.com/en/docs/claude-code) capabilities. Each Skill lives in `skills/<name>/` and includes:

- **SKILL.md** — Core instruction file defining behavior and triggers
- **references/** — Reference documents for the Skill
- **commands/** — Slash command definitions (optional)

Skills use YAML frontmatter for metadata (name, description, version, tags) and the body contains instructions for Claude.

### TypeScript Packages

Besides Markdown Skills, the repo includes TypeScript packages published to npm:

- **MCP Plugins** — Model Context Protocol plugins for Claude Code
- **Utility Functions** — Shared utility library

## Contents

### 6 Skills

| Skill | Description |
|-------|-------------|
| [agent-pipeline](/en/skills/agent-pipeline) | Multi-Agent Collaborative Pipeline |
| [drama-writer](/en/skills/drama-writer) | Short Drama Screenwriting Assistant |
| [novel-writer](/en/skills/novel-writer) | Novel Writing Assistant |
| [feature-planner](/en/skills/feature-planner) | Feature Development Planner |
| [i18n-helper](/en/skills/i18n-helper) | Internationalization Assistant |
| [iconfont-downloader](/en/skills/iconfont-downloader) | Iconfont Icon Downloader |

### 2 Packages

| Package | Description |
|---------|-------------|
| [@aspect-mark/agent-pipeline](/en/packages/agent-pipeline) | Multi-Agent Pipeline MCP Plugin |
| [@aspect-mark/shared](/en/packages/shared) | Shared Utility Functions |

## License

[MIT](https://github.com/JS-mark/skills/blob/main/LICENSE) License © 2026 [圣痕](https://github.com/JS-mark)
