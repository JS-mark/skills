# Getting Started

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) package manager
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI (required for using Skills)

## Installation

```bash
# Clone the repository
git clone https://github.com/JS-mark/skills.git
cd skills

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Using a Skill

Each Skill can be used independently without cloning the entire repo. Taking `agent-pipeline` as an example:

### Option 1: Quick Install

```bash
# Install Skill command
mkdir -p ~/.claude/commands && curl -fsSL \
  https://raw.githubusercontent.com/JS-mark/skills/main/skills/agent-pipeline/SKILL.md \
  -o ~/.claude/commands/agent.md

# Configure MCP Server (edit ~/.claude/settings.json)
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

### Option 2: Copy to skills directory

```bash
cp -r skills/<skill-name> ~/.claude/skills/<skill-name>
```

### Option 3: Local development mode

```bash
claude --skill-dir /path/to/<skill-name>
```

## Creating a New Skill

Use the scaffold command:

```bash
pnpm gen:skill my-awesome-skill
```

This generates `skills/my-awesome-skill/SKILL.md` and a `references/` directory. Edit the SKILL.md frontmatter and body to define your skill.

## Common Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm test             # Run tests
pnpm lint             # Lint code
pnpm lint:fix         # Lint and auto-fix
pnpm gen:skill <name> # Generate new Skill scaffold
pnpm release          # Version release
```
