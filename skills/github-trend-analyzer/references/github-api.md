# GitHub Search API 速查

## Endpoint

```
GET https://api.github.com/search/repositories?q=<query>&sort=<field>&order=<asc|desc>&per_page=<n>&page=<n>
```

- 未鉴权限流：**60 次 / 小时**
- 鉴权（`Authorization: Bearer $GITHUB_TOKEN`）：**5000 次 / 小时**
- 单次最多返回 100 条；最多翻 10 页（即 1000 条上限）

## Token 加载优先级

按以下顺序读取 `GITHUB_TOKEN`，命中即停（详细实现见 SKILL.md 步骤零）：

1. shell env `$GITHUB_TOKEN`
2. `./.env`
3. `./.env.local`
4. `~/.claude/skills/github-trend-analyzer/.env`
5. `~/.env`

`.env` 文件格式：

```
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
# 或带引号
GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
```

**安全约束**：永远不要把 token 值打印到终端或写入报告；只在日志中输出「来源」字段。

## 常用过滤表达式

| 表达式 | 含义 |
|--------|------|
| `stars:>10000` | star 数大于 10000 |
| `stars:1000..5000` | star 数区间 |
| `forks:>500` | fork 数大于 500 |
| `created:>2026-04-01` | 在指定日期之后创建 |
| `pushed:>2026-05-01` | 最近 push 时间 |
| `language:TypeScript` | 主语言筛选 |
| `topic:llm` | topic 标签 |
| `archived:false` | 排除已归档 |
| `is:public` | 公开仓库 |
| `org:vercel` | 限定组织 |
| `agent in:name,description` | 名字或描述包含 |

多个条件用 `+`（URL 编码）或空格拼接，例如：

```
q=created:>2026-04-01+stars:>100+language:TypeScript+topic:ai-agent
```

## 排序字段（sort）

- `stars` — star 数
- `forks` — fork 数
- `help-wanted-issues` — 标记为 help-wanted 的 issue 数（社区参与度信号）
- `updated` — 最近更新时间
- 不传 `sort` 则按相关度（best match）

## 返回字段（items[]）

经常用到的：

```json
{
  "full_name": "owner/repo",
  "html_url": "...",
  "description": "...",
  "language": "TypeScript",
  "topics": ["llm", "agent"],
  "stargazers_count": 12345,
  "forks_count": 678,
  "open_issues_count": 90,
  "watchers_count": 12345,
  "created_at": "2026-04-12T...",
  "pushed_at": "2026-05-25T...",
  "license": {"spdx_id": "MIT"},
  "owner": {"login": "...", "type": "User|Organization"},
  "homepage": "https://..."
}
```

## 推荐查询模板

### 新生爆款（最近 30 天创建，破百星）

```bash
DATE=$(date -v-30d +%Y-%m-%d 2>/dev/null || date -d '30 days ago' +%Y-%m-%d)
curl -s -H "Accept: application/vnd.github+json" \
  "https://api.github.com/search/repositories?q=created:>${DATE}+stars:>100&sort=stars&order=desc&per_page=20"
```

### 互动旺盛（最近活跃 + fork 多）

```bash
DATE=$(date -v-30d +%Y-%m-%d 2>/dev/null || date -d '30 days ago' +%Y-%m-%d)
curl -s -H "Accept: application/vnd.github+json" \
  "https://api.github.com/search/repositories?q=pushed:>${DATE}+stars:>1000&sort=forks&order=desc&per_page=20"
```

### 领域 star 榜（替换 topic）

```bash
curl -s -H "Accept: application/vnd.github+json" \
  "https://api.github.com/search/repositories?q=topic:ai-agent+stars:>500&sort=stars&order=desc&per_page=20"
```

### 限流自检

```bash
curl -sI "https://api.github.com/rate_limit" -H "Authorization: Bearer $GITHUB_TOKEN" \
  | grep -i 'x-ratelimit'
```

## 配套 README 抽取

```bash
curl -s "https://api.github.com/repos/${OWNER}/${REPO}/readme" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  | jq -r '.content' | base64 -d
```

> README 文件超过 1MB 时返回为空，需用 `download_url` 直接下载。

## Trending（非官方）

GitHub 没有官方 Trending API。如需 Trending 数据：

- WebFetch `https://github.com/trending?since=daily|weekly|monthly`
- 或第三方镜像 API（不稳定，不推荐作为唯一数据源）
