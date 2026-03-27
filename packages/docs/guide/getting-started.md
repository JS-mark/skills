# 快速开始

## 前置要求

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) 包管理器
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI（使用 Skills 时需要）

## 安装

```bash
# 克隆仓库
git clone https://github.com/JS-mark/skills.git
cd skills

# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 运行测试
pnpm test
```

## 使用 Skill

每个 Skill 都可以独立使用，不需要克隆整个仓库。以 `agent-pipeline` 为例：

### 方法一：快速安装

```bash
# 安装 Skill 命令
mkdir -p ~/.claude/commands && curl -fsSL \
  https://raw.githubusercontent.com/JS-mark/skills/main/skills/agent-pipeline/SKILL.md \
  -o ~/.claude/commands/agent.md

# 配置 MCP Server（编辑 ~/.claude/settings.json）
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

### 方法二：复制到 skills 目录

```bash
cp -r skills/<skill-name> ~/.claude/skills/<skill-name>
```

### 方法三：本地开发模式

```bash
claude --skill-dir /path/to/<skill-name>
```

## 创建新 Skill

使用脚手架命令快速创建：

```bash
pnpm gen:skill my-awesome-skill
```

这会生成 `skills/my-awesome-skill/SKILL.md` 和 `references/` 目录。编辑 SKILL.md 的 frontmatter 和正文即可。

## 常用命令

```bash
pnpm install          # 安装依赖
pnpm build            # 构建所有包
pnpm test             # 运行测试
pnpm lint             # 代码检查
pnpm lint:fix         # 代码检查并自动修复
pnpm gen:skill <name> # 生成新 Skill 脚手架
pnpm release          # 版本发布
```
