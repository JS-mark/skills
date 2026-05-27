# 项目结构

## 顶层目录

```
skills/
├── skills/          → Claude Code Skills（纯 Markdown，不在 pnpm workspace 内）
├── packages/        → TypeScript 工具包（pnpm workspace）
├── scripts/         → 开发脚本
├── docs/            → VitePress 文档站点
├── .github/         → GitHub Actions 工作流
├── package.json     → 根配置
├── pnpm-workspace.yaml
├── eslint.config.ts
├── vitest.config.ts
└── tsconfig.json
```

## Skills 目录

每个 Skill 是一个独立目录，包含 Markdown 指令文件和可选的参考文档：

```
skills/
├── agent-pipeline/
│   ├── SKILL.md              # Skill 指令定义
│   ├── references/           # 参考文档
│   └── README.md
├── drama-writer/
│   ├── commands/             # 斜杠命令
│   │   └── drama.md
│   ├── skills/
│   │   └── drama-writer/
│   │       ├── SKILL.md
│   │       └── references/
│   └── README.md
├── feature-planner/
├── i18n-helper/
├── iconfont-downloader/
└── novel-writer/
```

::: tip
`skills/` 目录**不在** pnpm workspace 内，它们是纯 Markdown 文件，不需要构建。
:::

## Packages 目录

TypeScript 工具包，通过 pnpm workspace 管理：

```
packages/
├── agent-pipeline/
│   ├── package.json          # @aspect-mark/agent-pipeline
│   └── src/
│       ├── server.js         # MCP Server 实现
│       └── cli.js            # CLI 入口
└── shared/
    ├── package.json          # @aspect-mark/shared
    ├── src/
    │   └── index.ts          # 工具函数
    ├── test/
    │   └── index.test.ts
    └── tsdown.config.ts      # 构建配置
```

## 配置文件

| 文件 | 说明 |
|------|------|
| `pnpm-workspace.yaml` | 定义 workspace 范围和 catalog 依赖版本 |
| `eslint.config.ts` | ESLint 配置（使用 `@antfu/eslint-config`） |
| `vitest.config.ts` | Vitest 测试配置 |
| `tsconfig.json` | TypeScript 配置 |
| `.npmrc` | pnpm 配置 |

## 代码规范

- 使用 [@antfu/eslint-config](https://github.com/antfu/eslint-config)，不需要 Prettier
- 遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范
- `skills/` 目录排除在 lint 检查之外
