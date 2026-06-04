---
name: trend-to-proposals
description: |
  This skill should be used when the user asks to:
  「分析趋势并生成新项目方案」「给我多个候选项目蓝图发邮件」「趋势报告+多方案打包」
  「trend to proposals」「分析 GitHub trending 并提案」「来一套立项备选方案」。
  一体化流程：调用 github-trend-analyzer 完成数据采集与趋势报告 → 生成 3 个完整 Project Blueprint
  候选方案 → 把报告 + 方案 + 原始数据合并打包为 ZIP → 通过 SMTP 发到邮箱。
version: 0.1.0
author: JS-mark
tags: [github, trend, proposal, blueprint, ai-agent, email]
---

# Trend → Proposals（趋势报告 + 多方案蓝图 + 邮件一体化）

## 角色定位

你是 **「立项参谋」**。当用户希望「不只是看趋势报告，而是直接拿到几个可立项的候选项目方案」时，按下面的流程：

1. **跑趋势分析**（复用 `github-trend-analyzer` skill 的步骤 0~5）
2. **基于趋势生成 3 个完整 Project Blueprint**（互不相同、各有侧重）
3. **打包**（report + proposals + data → ZIP）
4. **发邮件**（正文 = 趋势报告，附件 = ZIP）

---

## 用法（How to Use）

### 触发短语

- 「分析下 AI 趋势，再给我 3 个能立项的方案，发邮件给我」
- 「`trend-to-proposals` 走一遍」
- 「来一套完整调研：趋势 + 多方案 + 打包 + 邮件」

### 输入模板（与 github-trend-analyzer 一致，可省略）

```
领域：<AI / 前端 / DevOps / 数据库 / 全部>
语言：<TypeScript / Rust / Python / 不限>
时间窗：<最近 7 / 30 / 90 天>
样本量：<每类 N 个，默认 20–30>
关注点：<定位 / 命名 / 商业化 / 文档 / 社区>
方案侧重：<偏 SDK / 偏 SaaS / 偏 CLI / 偏 IDE 插件>（可选）
```

### 前置条件

- `~/.env` 里已有有效 `GITHUB_TOKEN`（鉴权后限流 30/min）
- `~/.env` 里已有完整 SMTP 配置（`SMTP_HOST/SMTP_PORT/SMTP_TLS/SMTP_USER/SMTP_PASS/MAIL_TO`）
- 缺哪个就用 `AskUserQuestion` 引导用户补全 → 写回 `~/.env`（参见 `github-trend-analyzer` 步骤零和步骤六的安全规则）

### 输出物（标准目录结构）

```
$TREND_REPORT_DIR/github-trend-report-YYYY-MM-DD/
├── report.md                         # 趋势分析报告（来自 github-trend-analyzer 步骤五）
├── proposals/
│   ├── proposal-1-<short-name>.md    # 候选方案 1：先发优势赛道
│   ├── proposal-2-<short-name>.md    # 候选方案 2：重定位/深耕
│   └── proposal-3-<short-name>.md    # 候选方案 3：高风险高回报
└── data/
    ├── new.json
    ├── active.json
    ├── top.json
    ├── sdk.json
    └── mcp.json   # 若 trend-analyzer 抓了第 5 类
```

输出根路径 `TREND_REPORT_DIR` 与 `github-trend-analyzer` 共用一份解析逻辑：
shell env > `~/.env` > **默认 `$HOME/Desktop`**（不存在则降级 `$HOME`）。

最终交付：`<目录>.zip` 通过邮件附件发送给用户。

---

## 执行流程

### 步骤一：调 github-trend-analyzer 完成数据采集与趋势报告

**完整复用** `github-trend-analyzer` skill 的步骤 0~5：

- 步骤 0：`load_github_token`（从 `~/.env` / shell / 项目 `.env` 顺序查找）
- 步骤 1：必要时用 `AskUserQuestion` 澄清范围
- 步骤 2：采集三类样本 + 可选第 4/5 类（SDK / MCP）
- 步骤 3：用 `jq` 抽取结构化字段
- 步骤 4：横向归纳（技术栈 / 主题 / 包装 / 社区 / 风口）
- 步骤 5：写出 `report.md` 到 `$TREND_REPORT_DIR/github-trend-report-YYYY-MM-DD/report.md`

**不要** 重复实现 token 加载、API 调用、jq 解析等逻辑——直接按 `github-trend-analyzer/SKILL.md` 执行。
注意 `TREND_REPORT_DIR` 已在 `github-trend-analyzer` 中定义（默认 `$HOME/Desktop`），本 skill 不要重新解析。

### 步骤二：生成 3 个完整 Project Blueprint

读完 `report.md` 和 `data/*.json` 后，**必须** 在 `$TREND_REPORT_DIR/<目录>/proposals/` 下产出 3 个 Markdown 文件，分别对应 3 种立项策略：

#### 方案 1（先发优势）：基于「新生密集 + 长青稀疏」赛道
- 选取 `new.json` 中频次高、但在 `top.json` 中样本少的方向
- 适合：希望抢占早期市场、和长青项目错位的情况

#### 方案 2（深耕重定位）：基于「长青头部 × 互动高交叉」主题
- 选取 `top.json` 与 `active.json` 共同覆盖的成熟主题
- 适合：用更专注的切入角度做差异化、目标是稳健成长

#### 方案 3（高风险高回报）：基于「新冒头但样本极少」赛道
- 选取出现频次极低（仅 1~2 个仓库）但描述里有强方向感的关键词
- 适合：愿意承担「赛道不成立」风险，搏一个潜在的早期 alpha

**每个方案文件必须包含 7 个固定模块**（与 `github-trend-analyzer` 的 Blueprint 模块一致）：

1. **项目代号**：3 个候选英文名 + 各自含义/可注册性自检 + 推荐
2. **一句话定位**：`<动词> for <场景>, powered by <差异化能力>` + 中文
3. **目标用户与场景**：≥2 个故事化场景（不要写抽象画像）
4. **MVP 功能清单**：v0.1 P0（阻塞首发）+ v0.2 P1（迭代）
5. **技术栈选型**：每项给一句话理由
6. **仓库结构**：用 ``` 围栏的 tree 形式
7. **第一周 Roadmap**：Day 1~7 的具体动作清单

**额外强制要求**：

- 每个方案开头必须有「**为什么是它（数据 trace）**」一段（50–150 字），引用 1–3 个具体仓库 `owner/repo` 作为对标或对比
- 3 个方案 **必须真正不同**（不同赛道 / 不同切入面 / 不同用户群），不允许只是名字不同
- 命名 ≤2 词，避免通用词（`ai-tool` / `llm-kit` 等），优先形象化代号
- 每个文件大小控制在 400–800 行 Markdown，过短代表偷懒、过长代表凑数

文件命名规则：

```
proposals/proposal-1-<short-name>.md   # short-name 取项目推荐代号的小写连字符
proposals/proposal-2-<short-name>.md
proposals/proposal-3-<short-name>.md
```

文件开头使用统一 frontmatter 便于后续二次处理：

```markdown
---
proposal: 1
codename: <推荐英文代号>
strategy: 先发优势 | 深耕重定位 | 高风险高回报
domain: <一级领域，例如 AI Agent / 数据库 / 前端工具>
language: <主语言>
license: MIT
created: YYYY-MM-DD
---

# <推荐代号> — <一句话中文定位>
```

### 步骤三：在报告里追加「方案速览」表格

向 `report.md` 末尾（「附：原始数据」之前）追加一节，便于邮件正文一眼看到 3 个方案对比：

```markdown
━━━ 🚀 候选方案速览 ━━━

| 序号 | 代号 | 策略 | 一句话定位 | 主语言 | 详情 |
|---|---|---|---|---|---|
| 1 | <代号 A> | 先发优势 | … | TS | [proposal-1-…](proposals/proposal-1-….md) |
| 2 | <代号 B> | 深耕重定位 | … | Python | [proposal-2-…](proposals/proposal-2-….md) |
| 3 | <代号 C> | 高风险高回报 | … | Rust | [proposal-3-…](proposals/proposal-3-….md) |

> 完整蓝图见 `proposals/` 目录或邮件附件中的 ZIP。
```

### 步骤四：打包

```bash
: "${TREND_REPORT_DIR:=$HOME/Desktop}"
TREND_REPORT_DIR="${TREND_REPORT_DIR/#\~/$HOME}"
[ -d "$TREND_REPORT_DIR" ] || TREND_REPORT_DIR="$HOME"
DIR="$TREND_REPORT_DIR/github-trend-report-$(date +%Y-%m-%d)"
ZIP="${DIR}.zip"
[ -d "$DIR" ] || { echo "目录不存在：$DIR"; exit 1; }
[ -d "$DIR/proposals" ] || { echo "缺 proposals/ 目录"; exit 1; }
rm -f "$ZIP"
( cd "$TREND_REPORT_DIR" && zip -r "$(basename "$ZIP")" "$(basename "$DIR")" >/dev/null )
ls -la "$ZIP"
```

**校验**：在打包前确认目录里同时包含 `report.md` / `proposals/proposal-{1,2,3}-*.md` / `data/*.json`。任意缺失 → 报错并停止，不要把不完整的 ZIP 发出去。

### 步骤五：发邮件

**完全复用** `github-trend-analyzer/references/send-report.py`（不重复实现 SMTP）。

```bash
SCRIPT="$(dirname "$0")/../github-trend-analyzer/references/send-report.py"
# 若上面的相对路径在执行环境里取不到，可绝对引用：
# SCRIPT="/Users/mark/myself/code/skills/skills/github-trend-analyzer/references/send-report.py"

python3 "$SCRIPT" \
  --to "$MAIL_TO" \
  --subject "GitHub 趋势 + 3 个候选项目蓝图 ($(date +%Y-%m-%d))" \
  --body-file "$DIR/report.md" \
  --attach "$ZIP"
```

成功后向用户确认（中文，逐项列出）：

- ✅ 已发送至：\<MAIL_TO>
- 📎 附件：\<ZIP 文件名> (\<size> KB)
- 📧 主题：\<主题>
- 📑 包含：报告 + 3 个方案 markdown + 原始数据
- 🔐 SMTP：\<SMTP_HOST>:\<SMTP_PORT> (\<TLS 模式>)

**错误处理**：与 `github-trend-analyzer` 步骤 6.4 一致（535 鉴权 / 网络超时 / 附件超大 25MB）。

---

## 关键原则

1. **不重复实现**：本 skill 严格复用 `github-trend-analyzer` 的数据采集、token 加载、SMTP 脚本与错误处理。**所有这些环节出问题时，先去看 `github-trend-analyzer` 的对应步骤**，不要在本 skill 里新写一遍。
2. **数据可追溯**：3 个方案的「为什么是它」段落必须能映射回 `data/*.json` 里某个具体仓库。禁止凭空设计。
3. **方案差异化**：3 个方案 **必须** 用三种不同立项策略（先发 / 深耕 / 高风险），不许 3 个都做 SDK。
4. **命名硬约束**：禁止 `ai-xxx` / `llm-xxx` / `xxx-kit` 类通用词；优先形象化代号（参考成功项目：hermes / claude / cairn / mercury / opencode）。
5. **token 节流**：proposal 文件控制在 400–800 行；report 已经有趋势归纳，proposal 不要重复趋势分析。
6. **打包先校验**：缺文件就停下报错，宁缺勿乱。
7. **本地优先**：所有产物先落到 `$TREND_REPORT_DIR/<目录>/`（默认 `~/Desktop/...`）再发邮件；用户随时可以重新打开查看。

---

## 与其它 skill 的协同

| 上游 / 下游 | 协同方式 |
|---|---|
| `github-trend-analyzer` | **必备上游**：本 skill 步骤一直接调用其步骤 0~5 |
| `feature-planner` | 可选下游：把任意 `proposal-N-*.md` 转成具体开发 TODO |
| `frontend-design` | 可选下游：根据某个 proposal 的「项目代号」设计 README Hero / Logo |

---

## 参考文档

- `../github-trend-analyzer/SKILL.md` — 数据采集与报告生成主流程
- `../github-trend-analyzer/references/github-api.md` — GitHub Search API 字段
- `../github-trend-analyzer/references/analysis-template.md` — 分析维度 checklist
- `../github-trend-analyzer/references/send-report.py` — SMTP 发送脚本（复用）
