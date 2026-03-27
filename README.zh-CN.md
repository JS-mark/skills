# Skills

[English](./README.md)

一个精心整理的 **Claude Code Skills**（基于 Markdown）和可复用 **TypeScript 工具库**的集合，以 pnpm monorepo 形式组织。

## 什么是 Skills？

Skills 是扩展 Claude Code 能力的 Markdown 文件。每个 Skill 存放在 `skills/<name>/SKILL.md`，使用 YAML frontmatter 定义元数据，可包含参考文档和 Agent 配置。

## 仓库结构

```
skills/          → Claude Code Skills（纯 Markdown）
packages/        → TypeScript 工具包（pnpm workspace）
scripts/         → 开发脚本
```

## Skills 列表

| Skill | 描述 |
|-------|------|
| [`agent-pipeline`](./skills/agent-pipeline) | 多 Agent 协作开发流水线 — 7 阶段、6 个 AI 角色的自动化开发工作流 |

## Packages 列表

| 包名 | 描述 |
|------|------|
| [`@aspect-mark/agent-pipeline`](./packages/agent-pipeline) | 多 Agent 流水线 MCP 插件 |
| [`@aspect-mark/shared`](./packages/shared) | 共享工具函数 |

## 快速开始

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 运行测试
pnpm test

# 代码检查
pnpm lint

# 生成新 Skill 脚手架
pnpm gen:skill <skill-name>
```

## 许可证

[MIT](./LICENSE) License © 2026 [圣痕](https://github.com/JS-mark)
