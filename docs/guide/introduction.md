# 什么是 Skills

Skills 是一个 Claude Code 技能和 TypeScript 工具库的集合，以 pnpm monorepo 形式组织。

## 核心概念

### Claude Code Skills

Skills 是 **Markdown 文件**，用于扩展 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 的能力。每个 Skill 存放在 `skills/<name>/` 目录下，包含：

- **SKILL.md** — 核心指令文件，定义 Skill 的行为和触发方式
- **references/** — 参考文档目录，供 Skill 引用
- **commands/** — 斜杠命令定义（可选）

Skills 使用 YAML frontmatter 定义元数据（名称、描述、版本、标签等），正文部分是给 Claude 的指令。

### TypeScript Packages

除了 Markdown Skills，仓库还包含 TypeScript 工具包，发布到 npm 供其他项目使用：

- **MCP 插件** — 基于 Model Context Protocol 的 Claude Code 插件
- **工具函数** — 共享的工具函数库

## 包含内容

### 6 个 Skills

| Skill | 描述 |
|-------|------|
| [agent-pipeline](/skills/agent-pipeline) | 多 Agent 协作开发流水线 |
| [drama-writer](/skills/drama-writer) | 短剧剧本创作助手 |
| [novel-writer](/skills/novel-writer) | 长篇小说创作助手 |
| [feature-planner](/skills/feature-planner) | 功能开发规划助手 |
| [i18n-helper](/skills/i18n-helper) | 多语言国际化助手 |
| [iconfont-downloader](/skills/iconfont-downloader) | Iconfont 图标下载助手 |

### 2 个 Packages

| 包名 | 描述 |
|------|------|
| [@aspect-mark/agent-pipeline](/packages/agent-pipeline) | 多 Agent 流水线 MCP 插件 |
| [@aspect-mark/shared](/packages/shared) | 共享工具函数 |

## 开源协议

[MIT](https://github.com/JS-mark/skills/blob/main/LICENSE) License © 2026 [圣痕](https://github.com/JS-mark)
