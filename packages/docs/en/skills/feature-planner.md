# feature-planner

Feature Development Planner — automatically analyzes requirements, designs implementation plans, and breaks down executable TODO task lists for Electron + React + IPC architecture projects.

## Features

- **Auto Code Exploration** — Searches project code for reusable components, services, and types
- **Architecture Impact Analysis** — Determines which processes are involved, IPC needs, state management, etc.
- **IPC 6-Step Template** — Generates complete task chains for cross-process features
- **Phased TODOs** — Infrastructure → Integration → UI → Cleanup, with priorities and dependencies
- **Risk Alerts** — Flags potential issues and mitigation strategies
- **Requirement Clarification** — Proactively asks users when uncertain

## Installation

```bash
# Option 1: Copy to skills directory
cp -r skills/feature-planner ~/.claude/skills/feature-planner

# Option 2: Local development mode
claude --skill-dir /path/to/feature-planner
```

## Usage

### Slash Command

```bash
/plan-feature
```

### Natural Language Triggers

Keywords that activate this Skill:

- "plan feature", "new feature development"
- "feature design", "break down tasks"
- "implementation plan", "how to implement"

## Execution Flow

1. **Understand Requirements** — Confirm core scenarios, reference implementations, constraints via dialogue
2. **Explore Code** — Glob + Grep search for similar implementations and reusable components
3. **Architecture Analysis** — Determine processes, IPC needs, state management, persistence, i18n
4. **Design Solution** — Describe data flow, define interfaces, note architectural decisions
5. **Break Down TODOs** — Generate task list with priorities (P0/P1/P2) and dependencies

## Output Format

```
🗺️ Feature Plan: <Feature Name>

━━━ Requirement Analysis ━━━
- Description / User Scenarios / Acceptance Criteria

━━━ Architecture Analysis ━━━
- Processes / IPC / State Management / Persistence / i18n

━━━ File Impact ━━━
+ New files
~ Modified files
? Reference files

━━━ Technical Solution ━━━
- Data flow / Key types / Key decisions

━━━ Task Breakdown ━━━
Phase 1~4 phased TODOs

━━━ Risks & Notes ━━━
```

## Use Cases

- New features for Electron desktop applications
- Features requiring Main ↔ Renderer cross-process communication
- Features needing state management (Zustand) or persistence (Electron Store)
- UI features requiring i18n internationalization
