# agent-pipeline

Multi-Agent Collaborative Pipeline — orchestrates 6 specialized AI roles through a 7-phase software development pipeline, from requirements to tested code.

> Companion MCP plugin: [@aspect-mark/agent-pipeline](/en/packages/agent-pipeline)

## Features

- **7-Phase Automation** — PM → Parallel Design → Fullstack Dev → Code Review → Fix → Test → Fix Loop
- **6 Specialized Roles** — Product Manager, Architect, UI Designer, Fullstack Engineer, Test Engineer, Code Reviewer
- **Parallel Phase 2** — Architect + UI Designer + Test Engineer run simultaneously
- **Auto Fix Loop** — Automatically fixes and reruns failed tests, up to 5 rounds
- **Web Dashboard** — Real-time pipeline progress monitoring
- **Unified Command** — `/agent` one command for everything

## Installation

The plugin has two parts: **MCP Server** (provides pipeline tools) and **Skill Command** (provides `/agent` slash command).

```bash
# 1. Install Skill command
mkdir -p ~/.claude/commands && curl -fsSL \
  https://raw.githubusercontent.com/JS-mark/skills/main/skills/agent-pipeline/SKILL.md \
  -o ~/.claude/commands/agent.md

# 2. Configure MCP Server — edit ~/.claude/settings.json
```

```jsonc
{
  "mcpServers": {
    "agent-pipeline": {
      "command": "npx",
      "args": ["@aspect-mark/agent-pipeline"]
    }
  }
}
```

Restart Claude Code and type `/agent help` to verify.

## Usage

```bash
/agent init                    # Initialize (interactive)
/agent run my-feature          # Run full pipeline
/agent run my-feature 3        # Start from Phase 3
/agent status                  # Check progress
/agent dashboard               # Start web dashboard
```

### Command Reference

| Command | Alias | Description |
|---------|-------|-------------|
| `/agent run <feature> [phase]` | `r` | Run 7-phase pipeline |
| `/agent status` | `s` | Check pipeline progress |
| `/agent dashboard [port]` | `d` | Start web dashboard (default port 3210) |
| `/agent init` | `i` | Initialize project |
| `/agent help` | `h` | Show help |

### CLI (Outside Claude Code)

```bash
npx @aspect-mark/agent-pipeline status
npx @aspect-mark/agent-pipeline dashboard
npx @aspect-mark/agent-pipeline dashboard 8080
```

## Pipeline Phases

```
Phase 1  PM              → PRD document
Phase 2  Parallel Design → Architect + UI Designer + Test Plan (parallel)
Phase 3  Fullstack Dev   → Code implementation
Phase 4  Code Review     → Review report (🔴 Blocker / 🟡 Warning / 🟢 Info)
Phase 5  Fix Review      → Fix Blockers and Warnings
Phase 6  Test Execution  → Write and run tests
Phase 7  Fix-Test Loop   → Bug fix + retest (max 5 rounds)
```

## Agent Roles

| Role | File | Responsibility |
|------|------|----------------|
| Product Manager | `pm.md` | PRD, user stories, acceptance criteria |
| Architect | `architect.md` | Technical design, module design, API definitions |
| UI Designer | `ui-designer.md` | Interface specs, interaction flows, component planning |
| Fullstack Engineer | `fullstack.md` | Code implementation following design docs |
| Test Engineer | `tester.md` | Test plans, test code, test execution |
| Code Reviewer | `reviewer.md` | Code quality, security, performance review |

## Output Directory

```
docs/
  prd/                  → PRD documents
  architecture/         → Technical design docs
  ui-design/            → UI design specs
  test-plans/           → Test plans & results
  reviews/              → Code review reports & fix logs
  .pipeline-status.json → Pipeline state
src/                    → Implementation code
.claude/roles/          → Agent role definition files
```
