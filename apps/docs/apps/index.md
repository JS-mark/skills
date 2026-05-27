# Apps 总览

`apps/` 目录存放面向终端用户的应用与站点（pnpm workspace 成员）。与 `packages/` 不同，这里的项目不会作为库发布；它们是独立可部署的 Web 服务、文档站、桌面客户端等。

## 全部 Apps

| App | 类型 | 部署目标 | 描述 |
|-----|------|---------|------|
| [marketplace](./marketplace) | Nuxt 3 全栈 | Vercel SSR / Docker | SkillForge — Skill & MCP 资源市场 |
| [docs](./docs) | VitePress 静态站 | GitHub Pages | 本文档站点 |

## 设计约定

- 包名使用 `@aspect-mark/` scope（如 `@aspect-mark/marketplace`）
- 所有 apps 都是 `private: true`，**不发布到 npm**
- 共享 devDependencies 通过 `pnpm-workspace.yaml` 的 `catalog:` 引用
- 各自的命令通过根 `package.json` 提供短别名：
  ```bash
  pnpm market:dev      # = pnpm --filter @aspect-mark/marketplace dev
  pnpm docs:dev        # = pnpm --filter @aspect-mark/docs dev
  ```

## 与 packages 的区别

| 维度 | `apps/` | `packages/` |
|------|---------|-------------|
| 发布到 npm | 否（除特例） | 是（除标 private 的） |
| 形态 | 可部署的应用 | 可复用的库 |
| 入口 | 浏览器 / CLI / GUI | `import` / `require` |
| 构建工具 | Nuxt / VitePress / 等 | tsdown / 框架自带 |
