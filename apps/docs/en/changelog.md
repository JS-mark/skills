# Changelog

All notable changes to this project will be documented in this file. Date format: `YYYY-MM-DD`.

## Unreleased

### Added

- **github-trend-analyzer skill** — Analyze GitHub trends via three-bucket sampling (new / engaged / starred), turn the findings into a launchable Project Blueprint, optionally zip it and email via SMTP (HTML-rendered).

### Changed

- **Directory layout**: `packages/docs` → `apps/docs`, joining `apps/marketplace` under the "user-facing applications" tier.
- Docs site adds top-level **Apps** navigation covering marketplace and docs.
- Docs site adds a `pipeline-dashboard` package page.

## 2026-05 (Marketplace launch)

### Added

- **`@aspect-mark/marketplace`** — Skill & MCP marketplace (SkillForge) built with Nuxt 3 + Nuxt UI v4
  - Imports external registries and Git sources
  - Deploys to Vercel SSR or self-hosted via Docker
  - Integrates Vercel Blob storage and libSQL

### Fixed / Improved

- **agent-pipeline** bumped to v2.1.0
  - bin entry moved to root `cli.js`, fixing npm publish warning
  - Fixed dashboard logs / docs / code display issues
  - Role templates localized (zh + en)
- **agent-pipeline** ships dashboard static export inside the npm package

## 2026-04 (Pipeline Dashboard)

### Added

- **`@aspect-mark/pipeline-dashboard`** — Next.js 15 + React 19 visual monitoring UI
- agent-pipeline gains WebSocket, control/role/code APIs and matching MCP tools

## v0.0.1 — 2026-03-25 (Initial Release)

### Added

- Project scaffolding with pnpm monorepo
- **`@aspect-mark/agent-pipeline`** — Multi-Agent Collaborative Pipeline MCP plugin
- **`@aspect-mark/shared`** — Shared utility functions (tsdown build)
- VitePress documentation site with bilingual (zh/en) support
- Skill scaffold generator (`pnpm gen:skill`)
- Local plugin development script (`pnpm update-plugin`)
- ESLint with `@antfu/eslint-config`
- Vitest testing framework
- CI/CD workflows (agent-pipeline publish, docs deploy)

### Bundled Skills

agent-pipeline, drama-writer, novel-writer, feature-planner, i18n-helper, iconfont-downloader
