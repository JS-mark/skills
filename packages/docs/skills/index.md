# Skills 总览

Skills 是扩展 Claude Code 能力的 Markdown 文件。每个 Skill 可以通过斜杠命令或自然语言触发。

## 全部 Skills

| Skill | 描述 | 触发方式 |
|-------|------|----------|
| [agent-pipeline](./agent-pipeline) | 多 Agent 协作开发流水线 | `/agent` |
| [drama-writer](./drama-writer) | 短剧剧本创作助手 | `/drama` |
| [novel-writer](./novel-writer) | 长篇小说创作助手 | `/write` |
| [feature-planner](./feature-planner) | 功能开发规划助手 | `/plan-feature` |
| [i18n-helper](./i18n-helper) | 多语言国际化助手 | `/i18nify` |
| [iconfont-downloader](./iconfont-downloader) | Iconfont 图标下载助手 | 自然语言 |

## 分类

### 开发工具

- **[agent-pipeline](./agent-pipeline)** — 自动化软件开发全流程
- **[feature-planner](./feature-planner)** — 功能需求分析和任务拆解
- **[i18n-helper](./i18n-helper)** — 代码多语言国际化

### 创作工具

- **[drama-writer](./drama-writer)** — 短剧剧本创作
- **[novel-writer](./novel-writer)** — 长篇小说创作

### 资源工具

- **[iconfont-downloader](./iconfont-downloader)** — 图标搜索和下载

## 安装方式

所有 Skills 都支持以下安装方式：

```bash
# 方式一：复制到 skills 目录
cp -r skills/<name> ~/.claude/skills/<name>

# 方式二：本地开发模式
claude --skill-dir /path/to/<name>
```

部分 Skill（如 `agent-pipeline`）还提供配套的 npm 包，可通过 MCP Server 方式集成。
