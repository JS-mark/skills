# Apps Overview

The `apps/` directory hosts user-facing applications and sites (pnpm workspace members). Unlike `packages/`, the projects here are not published as libraries — they are independently deployable web services, doc sites, desktop clients, etc.

## All apps

| App | Type | Deploy target | Description |
|-----|------|---------------|-------------|
| [marketplace](./marketplace) | Nuxt 3 fullstack | Vercel SSR / Docker | SkillForge — Skill & MCP marketplace |
| [docs](./docs) | VitePress static | GitHub Pages | This documentation site |

## Conventions

- Package names use the `@aspect-mark/` scope (e.g. `@aspect-mark/marketplace`)
- All apps are `private: true` — **never published to npm**
- Shared devDependencies use `catalog:` references in `pnpm-workspace.yaml`
- Each app exposes a short alias from the root `package.json`:
  ```bash
  pnpm market:dev      # = pnpm --filter @aspect-mark/marketplace dev
  pnpm docs:dev        # = pnpm --filter @aspect-mark/docs dev
  ```

## Difference from `packages/`

| Aspect | `apps/` | `packages/` |
|--------|---------|-------------|
| Published to npm | No (with rare exceptions) | Yes (unless private) |
| Shape | Deployable application | Reusable library |
| Entry | Browser / CLI / GUI | `import` / `require` |
| Build | Nuxt / VitePress / etc. | tsdown / framework default |
