---
name: agent-pipeline
description: Multi-Agent Collaborative Pipeline for Claude Code — orchestrates 7 development phases with 6 specialized AI roles
version: 2.0.0
author: JS-mark
tags: [multi-agent, pipeline, mcp, development-workflow, automation]
---

# /agent — Multi-Agent Collaborative Pipeline

Unified command for the multi-agent development workflow. Dispatches by subcommand.

**Usage**: `/agent <subcommand> [args]`

> **IMPORTANT**: All MCP tool calls MUST include the `root` parameter set to the current working directory (project root). This ensures pipeline data stays per-project, not global.

| Subcommand | Alias | Description |
|------------|-------|-------------|
| `run <feature> [phase]` | `r` | Run the 7-phase pipeline |
| `status` | `s` | Show pipeline progress |
| `dashboard [port]` | `d` | Start monitoring web UI |
| `init` | `i` | Initialize workflow in current project |
| (no args / `help`) | `h` | Show usage guide |

---

## Subcommand: `help` (default when no args)

Display:

```
/agent — Multi-Agent Collaborative Pipeline

Usage: /agent <subcommand> [args]

Subcommands:
  run <feature> [phase]   Run 7-phase pipeline (parallel Phase 2, fix-test loop)
  status                  Show pipeline progress
  dashboard [port]        Start monitoring dashboard (default port: 3210)
  init                    Initialize multi-agent workflow in current project

Pipeline Phases:
  1. PM           → PRD 需求文档
  2. 并行设计      → 架构师 + UI 设计师 + 测试计划 (并行)
  3. 全栈开发      → 代码实现
  4. 代码审查      → 审查报告
  5. 审查修复      → 修复 Blocker
  6. ��试执行      → 编写测试并执行
  7. 修复循环      → Bug 修复 + 重新测试 (max 5 rounds)

Quick Start:
  /agent init                    # Initialize (interactive)
  /agent run my-feature          # Full pipeline
  /agent run my-feature 3        # Resume from Phase 3
  /agent status                  # Check progress
  /agent dashboard               # Visual monitoring

CLI (any project dir):
  npx @aspect-mark/agent-pipeline status
  npx @aspect-mark/agent-pipeline dashboard [port]
  # Or via project shim:
  node scripts/pipeline.js status
```

---

## Subcommand: `run`

Parse from `$ARGUMENTS`: skip first word ("run"/"r"), next word = feature name, optional next = start phase 1-7.

### Step 0: Validate

1. If no feature name, ask the user
2. Use MCP tool `pipeline_check_ready` with `root` = current working directory to verify role files exist. If missing, tell user to run `/agent init`
3. Set: `FEATURE`, `START_PHASE` (default 1)

### Step 1: Initialize status

Use MCP tool `pipeline_init_status` with parameters:
- `root`: current working directory
- `feature`: the feature name
- `startPhase`: the start phase (default 1)
- `maxFixRounds`: 5

This creates `docs/.pipeline-status.json` with the v2 schema.

### Step 2: Confirm

Show plan to user and ask for confirmation.

### Step 3: Execute phases

Before each phase: use `pipeline_update_phase` with `root` = current working directory → status "running"
After each phase: use `pipeline_update_phase` with `root` = current working directory → status "done"

---

#### Phase 1: PM Agent

Launch **one Agent** (foreground):

```
Prompt: "你是产品经理。请阅读 .claude/roles/pm.md 了解你的角色职责和文档模板。
分析功能「<FEATURE>」的需求，编写 PRD 文档并输出到 docs/prd/feature-<FEATURE>.md。
请严格按照角色文件中的 PRD 模板格式编写，包含完整的功能需求、用户故事、验收标准等。"
```

#### Phase 2: Parallel Design (3 Agents)

**CRITICAL: Launch all 3 Agent tool calls in a SINGLE message** for parallel execution:

Before launching: use `pipeline_update_phase` phaseId=2, status="running"

**Agent 2a - 架构师:**
```
Prompt: "你是架构设计师。请阅读 .claude/roles/architect.md 了解职责和模板。
阅读 PRD docs/prd/feature-<FEATURE>.md，编写技术设计文档。
输出到 docs/architecture/feature-<FEATURE>.md。"
```

**Agent 2b - UI 设计师:**
```
Prompt: "你是 UI 设计师。请阅读 .claude/roles/ui-designer.md 了解职责和模板。
阅读 PRD docs/prd/feature-<FEATURE>.md，编写 UI 设计文档。
输出到 docs/ui-design/feature-<FEATURE>.md。"
```

**Agent 2c - 测试工程师（仅计划）:**
```
Prompt: "你是测试工程师。请阅读 .claude/roles/tester.md 了解职责和模板。
阅读 PRD docs/prd/feature-<FEATURE>.md，仅编写测试计划和测试用例文档，不写代码。
输出到 docs/test-plans/feature-<FEATURE>.md。"
```

As each agent completes, use `pipeline_update_phase` with phaseId=2 and subtaskRole to update its status.
When all 3 done: use `pipeline_update_phase` phaseId=2, status="done"

#### Phase 3: Fullstack

```
Prompt: "你是全栈工程师。请阅读 .claude/roles/fullstack.md。
阅读上游文档（PRD + 架构 + UI + 测试计划），实现功能「<FEATURE>」代码到 src/。"
```

#### Phase 4: Code Review

```
Prompt: "你是代码审查员。请阅读 .claude/roles/reviewer.md。
审查功能「<FEATURE>」代码，输出到 docs/reviews/feature-<FEATURE>.md。
必须标注严重程度：🔴 Blocker / 🟡 Warning / 🟢 Info。
末尾添加「Blocker 汇总」。无 Blocker 写「无 Blocker 问题」。"
```

#### Phase 5: Fix Review

```
Prompt: "你是全栈工程师。阅读审查报告 docs/reviews/feature-<FEATURE>.md，
修复所有 🔴 Blocker 和 🟡 Warning。输出修复日志到 docs/reviews/feature-<FEATURE>-fix-log.md。"
```

Skip if review says "无 Blocker 问题".

#### Phase 6: Test Execution

```
Prompt: "你是测试工程师。根据测试计划编写测试代码并执行，
输出结果到 docs/test-plans/feature-<FEATURE>-results-round-1.md。
全部通过则在总结中写「全部通过」。"
```

#### Phase 7: Fix-Test Loop (max 5 rounds)

```
for round = 1 to 5:
  1. Read latest test results, check if "全部通过" → break
  2. Launch Fullstack Agent → fix bugs
  3. Launch Tester Agent → retest → results-round-<N+1>.md
  4. Use pipeline_update_fix_round with `root` = current working directory to record round result
```

### Step 4: Finalize

Use MCP tool `pipeline_finalize` with `root` = current working directory and status "done".
Display summary with all output files.

---

## Subcommand: `status`

### Step 1: Use MCP tool

Call `pipeline_status` with `root` = current working directory to get the current pipeline state.

### Step 2: Display

Format the JSON response as a visual progress table:

```
Feature: <name>  |  Status: <running/done>  |  Started: <time>
─────────────────────────────────────────────────────
Phase 1  产品经理        ✅ done
Phase 2  并行设计        ✅ done
         ├─ 架构师       ✅ done    (29.9 KB)
         ├─ UI 设计师    ✅ done    (31.0 KB)
         └─ 测试工程师   ✅ done    (15.2 KB)
Phase 3  全栈开发        🔄 running (12 files)
Phase 4  代码审查        ⏳ pending
Phase 5  审查修复        ⏳ pending
Phase 6  测试执行        ⏳ pending
Phase 7  修复循环        ⏳ pending  [_ _ _ _ _]
─────────────────────────────────────────────────────
```

### Step 3: Show next steps

Suggest `/agent run <feature> <phase>` to resume, or `/agent dashboard` to monitor.

---

## Subcommand: `dashboard`

Use MCP tool `pipeline_dashboard` with action "start", `root` = current working directory, and optional port (default 3210).

Report the returned URL to the user.

---

## Subcommand: `init`

### Step 1: Ask the user

1. **Project description** — What is this project?
2. **Tech stack** — e.g. "Vue 3 + TypeScript + Hono"
3. **Roles** — Which to include? Default all 6: PM, Architect, UI Designer, Fullstack, Tester, Reviewer
4. **Language** — Documentation language? Default: 中文

### Step 2: Initialize

Use MCP tool `pipeline_init_project` with:
- `root`: current working directory (MUST pass explicitly)
- `techStack`: user's answer
- `language`: user's answer

### Step 3: Summary

```
Multi-Agent Workflow initialized!

Plugin:    @aspect-mark/agent-pipeline (MCP Server)
Project:   .claude/roles/{pm,architect,ui-designer,fullstack,tester,reviewer}.md
           scripts/pipeline.js  (CLI shim)

Quick start:
  /agent run <feature>                       # Full pipeline
  /agent run <feature> 3                     # From Phase 3
  /agent status                              # Check progress
  /agent dashboard                           # Visual monitoring
```
