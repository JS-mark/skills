# github-trend-analyzer

GitHub 趋势分析与新项目设计助手 — 通过 GitHub Search API 拉取「新生 / 互动高 / Star 高」三类样本，归纳技术栈、定位、命名、运营手法等共性，再据此输出一份可立项的「新项目初步设计」。可选打包 zip 并通过 SMTP 邮件发送。

## 特性

- **三类样本对比** — 新生（最近创建）/ 互动高（fork 多）/ Star 高（长青项目），三者交叉识别真实风口而非幸存者偏差
- **风口词差集** — 自动找出「新生项目里有但 Star 高项目里没有」的 topic，定位下一个机会
- **新项目初步设计** — 7 模块 Blueprint：项目代号 / 一句话定位 / 用户场景 / MVP 清单 / 技术选型 / 仓库结构 / Day 1–7 Roadmap
- **零依赖** — 仅用 `curl` + `jq` 采集，Python 标准库渲染邮件，无需 `pip install`
- **自包含输出** — 报告与原始数据在一个目录里，可独立打包/分享/二次分析
- **HTML 邮件** — 内置 markdown → HTML 渲染器，邮件客户端直接看到表格、代码块和样式
- **5 级 token 优先级** — 从 shell env / `.env` / skill 目录 / `~/.env` 链式查找，安全不泄漏

## 安装

```bash
# 复制到全局 skills 目录
cp -r skills/github-trend-analyzer ~/.claude/skills/github-trend-analyzer

# 或本地开发模式（建议软链）
ln -s "$(pwd)/skills/github-trend-analyzer" ~/.claude/skills/github-trend-analyzer
```

### 依赖

| 工具 | 必需性 | 用途 |
|------|--------|------|
| `curl` `jq` `date` | 必需 | macOS / Linux 默认自带 |
| `zip` | 邮件附件需要 | macOS / Linux 默认自带 |
| `python3` (≥ 3.8) | 邮件发送需要 | 标准库即可，无外部包 |
| `GITHUB_TOKEN` | 可选 | 提升限流：60/h → 5000/h |

## 使用方法

直接用自然语言描述需求：

- 「分析 GitHub 上最近的趋势项目」
- 「最近一周 AI Agent 类的热门项目，我做新项目应该怎么定位」
- 「帮我看看 TypeScript 生态里 star 涨得快的新项目」
- 「给我一份 GitHub 趋势报告，重点看 LLM 工具」

### 推荐输入模板

```
领域：<AI / 前端 / DevOps / 数据库 / 全部>
语言：<TypeScript / Rust / Python / 不限>
时间窗：<最近 7 / 30 / 90 天>
样本量：<每类 N 个，默认 15>
关注点：<定位 / 命名 / 商业化 / 文档 / 社区>
```

## 配置

### GITHUB_TOKEN（可选）

按以下优先级查找，命中即停：

1. shell env `$GITHUB_TOKEN`
2. `./.env`
3. `./.env.local`
4. `~/.claude/skills/github-trend-analyzer/.env`
5. `~/.env`

`.env` 文件格式（支持注释和引号）：

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
# 或
GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
```

### SMTP 配置（可选，仅用于发邮件）

| 变量 | 含义 | 默认 |
|------|------|------|
| `SMTP_HOST` | SMTP 服务器 | 无 |
| `SMTP_PORT` | 端口（465=SSL, 587=STARTTLS） | 无 |
| `SMTP_USER` | 登录用户名 | 无 |
| `SMTP_PASS` | 应用专用密码（不是登录密码） | 无 |
| `SMTP_FROM` | 发件人 | 同 SMTP_USER |
| `SMTP_TLS` | `ssl` 或 `starttls` | 按端口推断 |

::: warning 安全
QQ / 163 / Gmail 等必须使用「应用专用密码 / 授权码」，不要使用账户登录密码。
:::

## 输出物

每次执行产出一个自包含目录：

```
github-trend-report-YYYY-MM-DD/
├── report.md              # 报告主体（markdown）
└── data/
    ├── new.json           # 新生项目原始 API 数据
    ├── active.json        # 互动高项目
    └── top.json           # Star 高项目
```

发邮件时再额外生成 `<目录>.zip` 附件 + `report.html` 预览文件。

## 报告结构

| 模块 | 内容 |
|------|------|
| 采样信息 | 时间窗、领域、样本量、是否鉴权 |
| 三类样本一览 | 新生 / 互动高 / Star 高 各 Top N |
| 趋势归纳 | 技术栈分布、topic 词频、命名长度、license 分布 |
| 设计建议 | 定位 / 命名 / 技术 / 文档 / 社区 / 商业化 6 维 checklist |
| 🚀 新项目初步设计 | 项目代号 / 定位 / 场景 / MVP / 技术栈 / 仓库结构 / Roadmap |
| 风险与避坑 | 红海赛道警告 + 差异化建议 |
| 附：原始数据 | data/*.json + 二次分析示例命令 |

## 二次分析

报告目录里的 JSON 可在不消耗 GitHub 限流的前提下重新切片：

```bash
cd github-trend-report-YYYY-MM-DD

# 语言分布
jq -r '.items[].language // "Unknown"' data/top.json | sort | uniq -c | sort -rn

# Topic 词频差集（新生 - 长青 = 风口）
comm -23 \
  <(jq -r '.items[].topics[]' data/new.json | sort -u) \
  <(jq -r '.items[].topics[]' data/top.json | sort -u)
```

## 与其他 skill 协同

- 跑完后接 [`feature-planner`](./feature-planner) 把「初步设计」转为开发 TODO
- 命名 / 视觉建议产出后，可接 frontend-design 类 skill 生成 README Hero / Logo

## 相关文档

参见 skill 仓库下的：

- `references/github-api.md` — Search API 字段、查询表达式、限流自检
- `references/analysis-template.md` — 7 维度分析 checklist
- `references/send-report.py` — SMTP 发送脚本（仅 Python 标准库）
