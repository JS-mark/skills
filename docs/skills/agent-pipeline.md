# agent-pipeline

多 Agent 协作开发流水线 — 通过 7 个阶段、6 个专业 AI 角色，自动完成从需求分析到测试通过的完整软件开发流程。

> 配套 MCP 插件包：[@aspect-mark/agent-pipeline](/packages/agent-pipeline)

## 特性

- **7 阶段自动化** — PM → 并行设计 → 全栈开发 → 代码审查 → 修复 → 测试 → 修复循环
- **6 个专业角色** — 产品经理、架构师、UI 设计师、全栈工程师、测试工程师、代码审查员
- **Phase 2 并行** — 架构师 + UI 设计师 + 测试工程师同时执行
- **自动修复循环** — 测试不通过时自动修复重跑，最多 5 轮
- **Web Dashboard** — 实时监控流水线进度
- **统一命令入口** — `/agent` 一个命令搞定所有操作

## 安装

插件包含两部分：**MCP Server**（提供流水线工具）和 **Skill 命令**（提供 `/agent` 斜杠命令）。

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

重启 Claude Code，输入 `/agent help` 验证。

## 使用方法

```bash
/agent init                    # 初始化（交互式，询问技术栈、语言等）
/agent run my-feature          # 运行完整流水线
/agent run my-feature 3        # 从 Phase 3 开始
/agent status                  # 查看进度
/agent dashboard               # 启动 Web 监控面板
```

### 命令一览

| 命令 | 别名 | 说明 |
|------|------|------|
| `/agent run <feature> [phase]` | `r` | 运行 7 阶段流水线 |
| `/agent status` | `s` | 查看流水线进度 |
| `/agent dashboard [port]` | `d` | 启动 Web 监控面板（默认端口 3210） |
| `/agent init` | `i` | 初始化项目 |
| `/agent help` | `h` | 显示帮助 |

### CLI（Claude Code 外部）

```bash
npx @aspect-mark/agent-pipeline status
npx @aspect-mark/agent-pipeline dashboard
npx @aspect-mark/agent-pipeline dashboard 8080
```

## 流水线阶段

```
Phase 1  产品经理      → PRD 需求文档
Phase 2  并行设计      → 架构师 + UI 设计师 + 测试计划（并行执行）
Phase 3  全栈开发      → 代码实现
Phase 4  代码审查      → 审查报告（🔴 Blocker / 🟡 Warning / 🟢 Info）
Phase 5  审查修复      → 修复 Blocker 和 Warning
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

## 产出目录

```
docs/
  prd/                  → PRD 需求文档
  architecture/         → 技术设计文档
  ui-design/            → UI 设计规范
  test-plans/           → 测试计划和结果
  reviews/              → 代码审查报告和修复日志
  .pipeline-status.json → 流水线状态
src/                    → 实现代码
.claude/roles/          → Agent 角色定义文件
```
