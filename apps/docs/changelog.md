# 更新日志

本项目所有重要变更都将记录在此。日期格式为 `YYYY-MM-DD`。

## 未发布

### 新增

- **github-trend-analyzer skill** — 通过三类样本对比（新生 / 互动高 / Star 高）分析 GitHub 趋势，输出可立项的「新项目初步设计」(Project Blueprint)。可一键打包 zip 并通过 SMTP 邮件发送（HTML 渲染版）

### 变更

- **目录调整**：`packages/docs` 迁移到 `apps/docs`，与 `apps/marketplace` 一同归入「面向终端用户的应用」
- 文档站点新增 **Apps** 一级 nav，覆盖 marketplace 与 docs 两个应用
- 文档站点新增 `pipeline-dashboard` package 文档页

## 2026-05（marketplace 上线）

### 新增

- **`@aspect-mark/marketplace`** — 基于 Nuxt 3 + Nuxt UI v4 的 Skill & MCP 资源市场（SkillForge）
  - 支持外部 registry 与 Git 源导入
  - Vercel SSR 和 Docker 自托管两种部署
  - 集成 Vercel Blob 存储与 libSQL

### 修复 / 改进

- **agent-pipeline** 升级到 v2.1.0
  - bin 入口从子目录移至根 `cli.js`，修复 npm publish 警告
  - 修复 dashboard 的 logs / docs / code 显示问题
  - 角色模板本地化（中英）
- **agent-pipeline** dashboard 静态产物随 npm 包一起发布

## 2026-04（Pipeline Dashboard）

### 新增

- **`@aspect-mark/pipeline-dashboard`** — 基于 Next.js 15 + React 19 的可视化监控 UI
- agent-pipeline 引入 WebSocket、control/role/code 三套 API 与对应 MCP 工具

## v0.0.1 — 2026-03-25（首次发布）

### 新增

- 项目脚手架，pnpm monorepo 结构
- **`@aspect-mark/agent-pipeline`** — 多 Agent 协作开发流水线 MCP 插件
- **`@aspect-mark/shared`** — 共享工具函数（tsdown 构建）
- VitePress 文档站点，支持中英双语
- Skill 脚手架生成器（`pnpm gen:skill`）
- 本地插件开发脚本（`pnpm update-plugin`）
- ESLint 配置（`@antfu/eslint-config`）
- Vitest 测试框架
- CI/CD 工作流（agent-pipeline 发布、docs 部署）

### 包含的 Skills

agent-pipeline、drama-writer、novel-writer、feature-planner、i18n-helper、iconfont-downloader
