# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A monorepo containing Claude Code Skills (Markdown-based agent instructions) and supporting TypeScript packages. Skills are pure Markdown consumed by Claude Code's skill system; packages provide runtime tooling (MCP servers, dashboards, shared utilities).

## Commands

```bash
pnpm install                    # Install dependencies
pnpm build                      # Build all packages (recursive)
pnpm test                       # Run all tests (vitest)
pnpm test -- packages/shared    # Run tests for a single package
pnpm test:watch                 # Watch mode
pnpm lint                       # Lint (eslint, @antfu/eslint-config)
pnpm lint:fix                   # Lint and auto-fix
pnpm gen:skill <name>           # Scaffold a new skill
pnpm update-plugin              # Rebuild & copy agent-pipeline to ~/.claude/plugins/
pnpm release                    # Version bump (bumpp)
pnpm docs:dev                   # VitePress dev server
pnpm docs:build                 # Build documentation site
pnpm market:dev                 # Marketplace Nuxt dev server
pnpm market:build               # Build marketplace for production
```

## Architecture

```
skills/                → Claude Code Skills (pure Markdown, NOT in pnpm workspace)
  <name>/SKILL.md        Frontmatter (name, description, version, author, tags) + instructions
  <name>/references/     Supporting docs for the skill

packages/              → TypeScript packages (pnpm workspace members)
  agent-pipeline/        MCP server (@modelcontextprotocol/sdk) — orchestrates multi-agent dev pipeline
    src/server.js          MCP tool definitions (no build step, raw JS)
    dashboard/             Pre-built Next.js static export (copied from pipeline-dashboard)
  pipeline-dashboard/    Next.js web UI for monitoring pipeline progress (private, not published)
  shared/                Shared TS utilities — built with tsdown (ESM + CJS + dts)
  docs/                  VitePress documentation site (private)

apps/                  → Web applications (pnpm workspace members)
  marketplace/           Nuxt 3 app — Skill & MCP marketplace (Vercel deployed, SSR)

scripts/               → Dev tooling (run with tsx)
  gen-skill.ts           Scaffold new skill directory
  update-plugin.ts       Build dashboard + copy agent-pipeline to local plugin install
```

### Key Relationships

- `agent-pipeline` is published to npm as an MCP plugin; its `prepack` script builds `pipeline-dashboard` and copies the static output into `agent-pipeline/dashboard/`.
- `packages/shared` is the only package with a standard tsdown build. Other packages either use raw JS or framework builds.
- The `skills/` directory is completely independent of the pnpm workspace — no node_modules, no build, just Markdown.
- `apps/marketplace` is a Nuxt 3 full-stack app deployed to Vercel; it reads skill/MCP metadata from `content/` JSON files and supports importing external registry/git sources.

## Code Style

- ESLint with `@antfu/eslint-config` — no Prettier
- Ignores: `skills/**`, `packages/agent-pipeline/src/**`, `packages/docs/**`, `apps/marketplace/.nuxt/**`
- Follow Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`)
- Package names use `@aspect-mark/` scope
- Shared devDependencies use `catalog:` references in pnpm-workspace.yaml

## Skill Format

Each skill lives in `skills/<name>/SKILL.md` with YAML frontmatter:

```yaml
---
name: skill-name
description: What the skill does
version: 0.1.0
author: JS-mark
tags: [tag1, tag2]
---
```

The body contains Markdown instructions that Claude Code follows when the skill is invoked.

## Marketplace App (`apps/marketplace/`)

Nuxt 3 + Nuxt UI v3 全栈应用。以下是 UI 开发规范：

### 组件库：Nuxt UI v3

文档：https://ui.nuxt.com/docs/components

**禁止** 在 marketplace 中使用原生 HTML 表单元素和手写样式容器。必须使用 Nuxt UI 组件：

| 原生 HTML / 手写 | 替换为 Nuxt UI 组件 |
|---|---|
| `<input>` | `<UInput>` |
| `<select>` | `<USelect>` |
| `<textarea>` | `<UTextarea>` |
| `<button>` | `<UButton>` |
| 手写 card div | `<UCard>` |
| 手写 modal / Teleport | `<UModal>` |
| 手写 badge span | `<UBadge>` |
| 手写 avatar div | `<UAvatar>` |
| 手写 tabs | `<UTabs>` |
| 手写 pagination | `<UPagination>` |
| 手写 separator/divider | `<USeparator>` |
| 手写 form label+input | `<UFormField>` 包裹 |
| 手写 toast/notification | `useToast()` |
| 手写 container max-width | `<UContainer>` |
| 手写 kbd | `<UKbd>` |
| 手写 icon svg | `<UIcon name="i-lucide-xxx">` |
| 手写 alert | `<UAlert>` |

### 图标

使用 `@iconify-json/lucide` 图标集，通过 `<UIcon name="i-lucide-xxx" />` 引用。不要内联 SVG。

### 暗色主题

- 全局暗色模式 (`colorMode.preference: 'dark'`)
- CSS 变量定义在 `assets/css/main.css` 的 `@theme` 块中
- 使用 `--color-surface`/`--color-border`/`--color-text-*` 等语义变量

### CSS 入口

`assets/css/main.css` 必须包含：
```css
@import "tailwindcss";
@import "@nuxt/ui";
@source "../../components/**/*.vue";
@source "../../pages/**/*.vue";
@source "../../app.vue";
```
