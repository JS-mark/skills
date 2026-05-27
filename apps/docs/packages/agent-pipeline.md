# @aspect-mark/agent-pipeline

一个用于 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 的**多 Agent 协作开发流水线** MCP 插件。通过 7 个阶段、6 个专业 AI Agent 角色，自动完成从需求到测试通过的完整软件开发流程。

> 配套 Skill 命令：[agent-pipeline Skill](/skills/agent-pipeline)

## 特性

- 7 阶段自动化开发流水线
- 6 个专业 Agent 角色（产品经理、架构师、UI 设计师、全栈工程师、测试工程师、代码审查员）
- Phase 2 支持 3 个 Agent 并行执行
- 自动修复-测试循环（最多 5 轮）
- 实时 Web Dashboard 监控进度
- 基于 MCP — 与 Claude Code 原生集成
- 提供 CLI 命令行工具

## 前置要求

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI
- Node.js >= 18

## 安装

### 快速安装

```bash
# 1. 安装 Skill 命令
mkdir -p ~/.claude/commands && curl -fsSL \
  https://raw.githubusercontent.com/JS-mark/skills/main/skills/agent-pipeline/SKILL.md \
  -o ~/.claude/commands/agent.md

# 2. 配置 MCP Server — 编辑 ~/.claude/settings.json
```

```jsonc
{
  "mcpServers": {
    "agent-pipeline": {
      "command": "npx",
      "args": ["@aspect-mark/agent-pipeline"]
    }
  }
}
```

重启 Claude Code 后输入 `/agent help` 验证。

### 从源码安装

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
      "args": ["/absolute/path/to/skills/packages/agent-pipeline/src/server.js"]
    }
  }
}
```

## 使用方法

### 在 Claude Code 中

```bash
/agent init                    # 初始化项目
/agent run user-auth           # 运行完整流水线
/agent run user-auth 3         # 从指定阶段恢复
/agent status                  # 查看进度
/agent dashboard               # 启动 Web 监控面板
```

### CLI（Claude Code 外部）

```bash
npx @aspect-mark/agent-pipeline status
npx @aspect-mark/agent-pipeline dashboard
npx @aspect-mark/agent-pipeline dashboard 8080
```

## Dashboard

Web Dashboard（`http://localhost:3210`）提供：

- **概览** — 流水线各阶段实时进度
- **文档** — 浏览生成的 PRD、架构设计、UI 设计、测试计划、审查报告
- **代码** — `src/` 目录源码浏览
- **日志** — 流水线执行日志

每 5 秒自动刷新。

## MCP 工具

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

## 产出结构

```
docs/
  prd/                  → PRD 需求文档
  architecture/         → 技术设计文档
  ui-design/            → UI 设计规范
  test-plans/           → 测试计划和结果
  reviews/              → 代码审查报告和修复日志
  .pipeline-status.json → 流水线状态
  .pipeline-logs/       → 执行日志
src/                    → 实现代码
.claude/roles/          → Agent 角色定义文件
```
