# @aspect-mark/agent-pipeline

[中文](./README.zh-CN.md)

A **Multi-Agent Collaborative Pipeline** plugin for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). It orchestrates 6 specialized AI agent roles through a 7-phase software development pipeline, from requirements to tested code.

## Features

- 7-phase automated development pipeline
- 6 specialized agent roles (PM, Architect, UI Designer, Fullstack Engineer, Tester, Code Reviewer)
- Phase 2 runs 3 agents in parallel (Architect + UI Designer + Tester)
- Automated fix-test loop (max 5 rounds)
- Real-time web dashboard for monitoring progress
- MCP (Model Context Protocol) based — integrates natively with Claude Code
- CLI for status checking and dashboard outside of Claude Code

## Pipeline Phases

```
Phase 1  PM              → PRD document
Phase 2  Parallel Design → Architect + UI Designer + Test Plan (parallel)
Phase 3  Fullstack Dev   → Code implementation
Phase 4  Code Review     → Review report
Phase 5  Fix Review      → Fix blockers
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

## Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI installed
- Node.js >= 18

## Installation

The plugin has two parts: an **MCP Server** (provides pipeline tools) and a **Skill Command** (provides the `/agent` slash command).

### Quick Install (2 commands)

```bash
# 1. Install Skill command
mkdir -p ~/.claude/commands && curl -fsSL \
  https://raw.githubusercontent.com/JS-mark/skills/main/skills/agent-pipeline/SKILL.md \
  -o ~/.claude/commands/agent.md

# 2. Add MCP Server — append to ~/.claude/settings.json
```

Add the `mcpServers` section to `~/.claude/settings.json` (create the file if it doesn't exist):

```jsonc
{
  // ... your existing settings ...
  "mcpServers": {
    "agent-pipeline": {
      "command": "npx",
      "args": ["@aspect-mark/agent-pipeline"]
    }
  }
}
```

That's it. Restart Claude Code and type `/agent help` to verify.

### Alternative: Install from source

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

```bash
cp skills/agent-pipeline/SKILL.md ~/.claude/commands/agent.md
```

### Verify

Start Claude Code and type:

```
/agent help
```

You should see the pipeline usage guide with all available subcommands.

## Usage

### In Claude Code

```bash
# Initialize project (interactive — asks about tech stack, language, etc.)
/agent init

# Run full pipeline for a feature
/agent run user-auth

# Resume from a specific phase
/agent run user-auth 3

# Check progress
/agent status

# Start web dashboard
/agent dashboard
```

### CLI (outside Claude Code)

```bash
# Check pipeline status
npx @aspect-mark/agent-pipeline status

# Start dashboard
npx @aspect-mark/agent-pipeline dashboard

# Start dashboard on custom port
npx @aspect-mark/agent-pipeline dashboard 8080
```

## Dashboard

The web dashboard (`http://localhost:3210`) provides:

- **Overview** — Pipeline phase progress with real-time status
- **Docs** — Browse generated PRD, architecture, UI design, test plans, and review reports
- **Code** — Source code browser for `src/` directory
- **Logs** — Pipeline execution logs

Auto-refreshes every 5 seconds.

## Output Structure

After running the pipeline, your project will have:

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
.claude/roles/          → Agent role definitions
```

## MCP Tools

The plugin exposes the following MCP tools:

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

## License

[MIT](../../LICENSE)
