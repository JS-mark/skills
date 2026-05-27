# 项目结构

## 顶层目录

```
skills/
├── skills/          → Claude Code Skills（纯 Markdown，不在 pnpm workspace 内）
├── packages/        → 可复用的 TypeScript 库（pnpm workspace）
├── apps/            → 可部署的应用与站点（pnpm workspace）
├── scripts/         → 开发脚本（gen-skill / update-plugin）
├── .github/         → GitHub Actions 工作流
├── .claude/         → 项目级 Claude Code 配置（含 skills 软链）
├── package.json     → 根配置（提供 docs:dev / market:dev 等别名）
├── pnpm-workspace.yaml
├── eslint.config.ts
├── vitest.config.ts
└── tsconfig.json
```

## Skills 目录

每个 Skill 是一个独立目录，包含 Markdown 指令文件和可选的参考文档：

```
skills/
├── agent-pipeline/         # 多 Agent 协作流水线
├── github-trend-analyzer/  # GitHub 趋势分析 + 新项目 Blueprint
├── drama-writer/           # 短剧剧本创作
├── novel-writer/           # 长篇小说创作
├── feature-planner/        # 功能开发规划
├── i18n-helper/            # 多语言国际化
└── iconfont-downloader/    # Iconfont 图标下载
```

每个 skill 的最小结构（以 `github-trend-analyzer` 为例）：

```
skills/github-trend-analyzer/
├── SKILL.md            # YAML frontmatter + Markdown 指令
└── references/         # 参考文档 / 辅助脚本
    ├── github-api.md
    ├── analysis-template.md
    └── send-report.py
```

::: tip
`skills/` 目录**不在** pnpm workspace 内，它们是纯 Markdown，不需要构建。可通过 `.claude/skills/` 下的软链让本仓库的 skill 在 Claude Code 里立刻可用。
:::

## Packages 目录

可复用的 TypeScript 库，通过 pnpm workspace 管理：

```
packages/
├── agent-pipeline/             # @aspect-mark/agent-pipeline
│   ├── src/
│   │   ├── server.js           # MCP Server 实现
│   │   └── cli.js              # CLI 入口
│   └── dashboard/              # 内嵌的 pipeline-dashboard 静态产物
├── pipeline-dashboard/         # @aspect-mark/pipeline-dashboard（私有）
│   ├── app/                    # Next.js 15 App Router
│   ├── components/
│   └── next.config.ts
└── shared/                     # @aspect-mark/shared
    ├── src/
    ├── test/
    └── tsdown.config.ts
```

| 包 | 角色 |
|----|------|
| `agent-pipeline` | 通过 `npx` 调用的 MCP 服务器（发布到 npm） |
| `pipeline-dashboard` | agent-pipeline 的 Web 监控 UI（私有，构建时被复制进 agent-pipeline） |
| `shared` | 共享工具函数（tsdown 输出 ESM + CJS + dts） |

## Apps 目录

面向终端用户的应用与站点：

```
apps/
├── docs/                  # @aspect-mark/docs（VitePress 1.x，部署到 GitHub Pages）
└── marketplace/           # @aspect-mark/marketplace（Nuxt 3，部署到 Vercel / Docker）
```

| App | 部署目标 | 说明 |
|-----|---------|------|
| `docs` | GitHub Pages | 本文档站，中英双语 |
| `marketplace` | Vercel SSR / Docker | SkillForge — Skill & MCP 资源市场 |

## 配置文件

| 文件 | 说明 |
|------|------|
| `pnpm-workspace.yaml` | 定义 workspace 范围（`packages/*` + `apps/*`）和 catalog 依赖版本 |
| `eslint.config.ts` | ESLint 配置（`@antfu/eslint-config`） |
| `vitest.config.ts` | Vitest 测试配置 |
| `tsconfig.json` | TypeScript 配置 |
| `.npmrc` | pnpm 配置 |
| `.gitignore` | 忽略 `apps/docs/.vitepress/{dist,cache}` 等构建产物 |

## 代码规范

- 使用 [@antfu/eslint-config](https://github.com/antfu/eslint-config)，不需要 Prettier
- 遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范
- `skills/**` 与 `apps/docs/**` 等目录排除在 lint 检查之外
- 包名统一使用 `@aspect-mark/` scope
- 共享 devDependencies 通过 `catalog:` 引用
