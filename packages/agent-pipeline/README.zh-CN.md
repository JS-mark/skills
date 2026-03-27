# @aspect-mark/agent-pipeline

[English](./README.md)

一个用于 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 的**多 Agent 协作开发流水线**插件。通过 7 个阶段、6 个专业 AI Agent 角色，自动完成从需求到测试通过的完整软件开发流程。

## 特性

- 7 阶段自动化开发流水线
- 6 个专业 Agent 角色（产品经理、架构师、UI 设计师、全栈工程师、测试工程师、代码审查员）
- Phase 2 支持 3 个 Agent 并行执行（架构师 + UI 设计师 + 测试工程师）
- 自动修复-测试循环（最多 5 轮）
- 实时 Web Dashboard 监控进度
- 基于 MCP（Model Context Protocol）— 与 Claude Code 原生集成
- 提供 CLI，可在 Claude Code 外查看状态和启动面板

## 流水线阶段

```
Phase 1  产品经理      → PRD 需求文档
Phase 2  并行设计      → 架构师 + UI 设计师 + 测试计划（并行）
Phase 3  全栈开发      → 代码实现
Phase 4  代码审查      → 审查报告
Phase 5  审查修复      → 修复 Blocker
Phase 6  测试执行      → 编写测试并执行
Phase 7  修复循环      → Bug 修复 + 重新测试（最多 5 轮）
```

## Agent 角色

| 角色 | 文件 | 职责 |
|------|------|------|
| 产品经理 | `pm.md` | PRD、用户故事、验收标准 |
| 架构师 | `architect.md` | 技术设计、模块设计、API 定义 |
| UI 设计师 | `ui-designer.md` | 界面规范、交互流程、组件规划 |
| 全栈工程师 | `fullstack.md` | 按设计文档实现代码 |
| 测试工程师 | `tester.md` | 测试计划、测试代码、测试执行 |
| 代码审查员 | `reviewer.md` | 代码质量、安全性、性能审查 |

## 前置要求

- 已安装 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI
- Node.js >= 18

## 安装

插件包含两部分：**MCP Server**（提供流水线工具）和 **Skill 命令**（提供 `/agent` 斜杠命令）。

### 快速安装（2 步搞定）

```bash
# 1. 安装 Skill 命令
mkdir -p ~/.claude/commands && curl -fsSL \
  https://raw.githubusercontent.com/JS-mark/skills/main/skills/agent-pipeline/SKILL.md \
  -o ~/.claude/commands/agent.md

# 2. 配置 MCP Server — 编辑 ~/.claude/settings.json
```

在 `~/.claude/settings.json` 中添加 `mcpServers` 配置（文件不存在则新建）：

```jsonc
{
  // ... 你的其他配置 ...
  "mcpServers": {
    "agent-pipeline": {
      "command": "npx",
      "args": ["@aspect-mark/agent-pipeline"]
    }
  }
}
```

完成。重启 Claude Code 后输入 `/agent help` 验证。

### 备选：从源码安装

```bash
git clone https://github.com/JS-mark/skills.git
cd skills && pnpm install
```

```jsonc
// ~/.claude/settings.json
{
  "mcpServers": {
    "agent-pipeline": {
      "command": "node",
      "args": ["/你的绝对路径/skills/packages/agent-pipeline/src/server.js"]
    }
  }
}
```

```bash
cp skills/agent-pipeline/SKILL.md ~/.claude/commands/agent.md
```

### 验证

启动 Claude Code，输入：

```
/agent help
```

应该看到流水线使用指南和所有可用子命令。

## 使用方法

### 在 Claude Code 中

```bash
# 初始化项目（交互式 — 会询问技术栈、语言等）
/agent init

# 运行完整流水线
/agent run user-auth

# 从指定阶段恢复
/agent run user-auth 3

# 查看进度
/agent status

# 启动 Web 监控面板
/agent dashboard
```

### CLI（Claude Code 外部）

```bash
# 查看流水线状态
npx @aspect-mark/agent-pipeline status

# 启动 Dashboard
npx @aspect-mark/agent-pipeline dashboard

# 自定义端口
npx @aspect-mark/agent-pipeline dashboard 8080
```

## Dashboard 监控面板

Web Dashboard（`http://localhost:3210`）提供：

- **概览** — 流水线各阶段实时进度
- **文档** — 浏览生成的 PRD、架构设计、UI 设计、测试计划、审查报告
- **代码** — `src/` 目录源码浏览
- **日志** — 流水线执行日志

每 5 秒自动刷新。

## 产出结构

流水线运行后，项目目录结构：

```
docs/
  prd/                  → PRD 需求文档
  architecture/         → 技术设计文档
  ui-design/            → UI 设计规范
  test-plans/           → 测试计划和结果
  reviews/              → 代码审查报告和修复日志
  .pipeline-status.json → 流水线状态（JSON）
  .pipeline-logs/       → 执行日志
src/                    → 实现代码
.claude/roles/          → Agent 角色定义文件
```

## MCP 工具

插件暴露以下 MCP 工具：

| 工具 | 描述 |
|------|------|
| `pipeline_check_ready` | 验证角色文件是否存在 |
| `pipeline_init_project` | 脚手架：创建项目目录和角色文件 |
| `pipeline_init_status` | 创建初始流水线状态 JSON |
| `pipeline_status` | 获取结构化流水线状态 |
| `pipeline_update_phase` | 更新阶段/子任务状态 |
| `pipeline_update_fix_round` | 记录修复-测试循环结果 |
| `pipeline_finalize` | 标记流水线完成/失败 |
| `pipeline_dashboard` | 启动/停止 Web 监控面板 |
| `pipeline_role_prompt` | 获取角色系统提示词 |

## 许可证

[MIT](../../LICENSE)
