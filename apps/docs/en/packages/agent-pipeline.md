# @aspect-mark/agent-pipeline

A **Multi-Agent Collaborative Pipeline** MCP plugin for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). It orchestrates 6 specialized AI agent roles through a 7-phase software development pipeline, from requirements to tested code.

> Companion Skill command: [agent-pipeline Skill](/en/skills/agent-pipeline)

## Features

- 7-phase automated development pipeline
- 6 specialized agent roles (PM, Architect, UI Designer, Fullstack Engineer, Tester, Code Reviewer)
- Phase 2 runs 3 agents in parallel
- Automated fix-test loop (max 5 rounds)
- Real-time web dashboard for monitoring progress
- MCP-based — integrates natively with Claude Code
- CLI command-line tool

## Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI
- Node.js >= 18

## Installation

### Quick Install

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

### Install from Source

```bash
git clone https://github.com/JS-mark/skills.git
cd skills && pnpm install
```

```jsonc
// ~/.claude/settings.json
{
  "mcpServers": {
    "agent-pipeline": {
      "command": "node",
      "args": ["/absolute/path/to/skills/packages/agent-pipeline/src/server.js"]
    }
  }
}
```

## Usage

### In Claude Code

```bash
/agent init                    # Initialize project
/agent run user-auth           # Run full pipeline
/agent run user-auth 3         # Resume from specific phase
/agent status                  # Check progress
/agent dashboard               # Start web dashboard
```

### CLI (Outside Claude Code)

```bash
npx @aspect-mark/agent-pipeline status
npx @aspect-mark/agent-pipeline dashboard
npx @aspect-mark/agent-pipeline dashboard 8080
```

## Dashboard

The web dashboard (`http://localhost:3210`) provides:

- **Overview** — Pipeline phase progress with real-time status
- **Docs** — Browse generated PRD, architecture, UI design, test plans, and review reports
- **Code** — Source code browser for `src/` directory
- **Logs** — Pipeline execution logs

Auto-refreshes every 5 seconds.

## MCP Tools

| Tool | Description |
|------|-------------|
| `pipeline_check_ready` | Verify role files exist |
| `pipeline_init_project` | Scaffold project directories and role files |
| `pipeline_init_status` | Create initial pipeline status JSON |
| `pipeline_status` | Get structured pipeline status |
| `pipeline_update_phase` | Update phase/subtask status |
| `pipeline_update_fix_round` | Record fix-test loop results |
| `pipeline_finalize` | Mark pipeline as done/failed |
| `pipeline_dashboard` | Start/stop web dashboard |
| `pipeline_role_prompt` | Get role system prompt for agent spawning |

## Output Structure

```
docs/
  prd/                  → PRD documents
  architecture/         → Technical design docs
  ui-design/            → UI design specs
  test-plans/           → Test plans & results
  reviews/              → Code review reports & fix logs
  .pipeline-status.json → Pipeline state (JSON)
  .pipeline-logs/       → Execution logs
src/                    → Implementation code
.claude/roles/          → Agent role definition files
```
