# Skills Overview

Skills are Markdown files that extend Claude Code capabilities. Each Skill can be triggered via slash commands or natural language.

## All Skills

| Skill | Description | Trigger |
|-------|-------------|---------|
| [agent-pipeline](./agent-pipeline) | Multi-Agent Collaborative Pipeline | `/agent` |
| [drama-writer](./drama-writer) | Short Drama Screenwriting Assistant | `/drama` |
| [novel-writer](./novel-writer) | Novel Writing Assistant | `/write` |
| [feature-planner](./feature-planner) | Feature Development Planner | `/plan-feature` |
| [i18n-helper](./i18n-helper) | Internationalization Assistant | `/i18nify` |
| [iconfont-downloader](./iconfont-downloader) | Iconfont Icon Downloader | Natural language |

## Categories

### Development Tools

- **[agent-pipeline](./agent-pipeline)** — Automated full software development lifecycle
- **[feature-planner](./feature-planner)** — Requirement analysis and task breakdown
- **[i18n-helper](./i18n-helper)** — Code internationalization

### Creative Tools

- **[drama-writer](./drama-writer)** — Short drama screenwriting
- **[novel-writer](./novel-writer)** — Novel writing

### Resource Tools

- **[iconfont-downloader](./iconfont-downloader)** — Icon search and download

## Installation

All Skills support the following installation methods:

```bash
# Option 1: Copy to skills directory
cp -r skills/<name> ~/.claude/skills/<name>

# Option 2: Local development mode
claude --skill-dir /path/to/<name>
```

Some Skills (e.g., `agent-pipeline`) also provide companion npm packages that can be integrated via MCP Server.
