# 🗺️ feature-planner — 功能开发规划助手

Claude Code Skill，针对 Electron + React + IPC 架构项目，自动分析需求、设计实现方案、拆解可执行的 TODO 任务清单。

## 特性

- **自动代码探索** — 搜索项目代码发现可复用的组件、服务和类型
- **架构影响分析** — 自动判断涉及哪些进程、是否需要 IPC、状态管理等
- **IPC 6 步模板** — 跨进程功能按标准模板生成完整任务链
- **分阶段 TODO** — 基础设施 → 集成层 → UI 层 → 收尾，带优先级和依赖关系
- **风险提示** — 标注潜在问题和规避方法
- **需求澄清** — 不确定时主动向用户确认

## 安装

### 方法一：复制到 Claude Code skills 目录

```bash
cp -r skills/feature-planner ~/.claude/skills/feature-planner
```

### 方法二：本地开发模式

```bash
claude --skill-dir /path/to/feature-planner
```

## 使用方法

### 斜杠命令

```bash
/plan-feature
```

### 自然语言触发

以下关键词会自动激活本 skill：

- "规划功能"、"plan feature"、"新功能开发"
- "功能设计"、"feature design"、"拆解任务"
- "实现方案"、"开发计划"、"怎么实现"
- 或直接描述一个新功能需求

## 执行流程

1. **理解需求** — 通过对话确认核心场景、参考实现、约束条件
2. **探索代码** — Glob + Grep 搜索相似实现和可复用组件
3. **架构分析** — 确定涉及进程、IPC 需求、状态管理、持久化、i18n
4. **设计方案** — 描述数据流、定义接口、标注架构决策
5. **拆解 TODO** — 生成带优先级（P0/P1/P2）和依赖关系的任务清单

## 输出格式

```
🗺️ 功能规划：<功能名称>

━━━ 需求分析 ━━━
- 描述 / 用户场景 / 验收标准

━━━ 架构分析 ━━━
- 涉及进程 / IPC / 状态管理 / 持久化 / i18n

━━━ 文件影响 ━━━
+ 新增文件列表
~ 修改文件列表
? 参考文件列表

━━━ 技术方案 ━━━
- 数据流 / 关键类型 / 关键决策

━━━ 任务拆解 ━━━
Phase 1~4 分阶段 TODO

━━━ 风险与注意事项 ━━━
```

## 适用场景

- Electron 桌面应用的新功能开发
- 需要 Main ↔ Renderer 跨进程通信的功能
- 需要状态管理（Zustand）或持久化（Electron Store）的功能
- 需要 i18n 国际化的 UI 功能

## 目录结构

```
feature-planner/
├── .claude-plugin/
│   └── plugin.json              # 插件元数据
├── commands/
│   └── plan-feature.md          # /plan-feature 斜杠命令
├── skills/
│   └── feature-planner/
│       └── SKILL.md             # 核心 Skill 定义
└── README.md
```

## 许可证

MIT
