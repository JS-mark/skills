# github-trend-analyzer

GitHub trend analysis & new-project blueprint assistant — pulls three sample buckets via the GitHub Search API ("new", "high-engagement", "high-star"), distills patterns across tech stack, positioning, naming, and community ops, then turns them into a launchable Project Blueprint. Optionally zips the report and emails it via SMTP.

## Features

- **Three-bucket comparison** — new (recently created) / engaged (high forks) / starred (long-running). Cross-reference identifies real momentum, not survivorship bias.
- **Topic-frequency diff** — surfaces topics present in "new" but missing from "starred" — early signals of where the next opportunity is.
- **Project Blueprint** — 7-section template: codename, one-liner positioning, user scenarios, MVP feature list, tech stack, repo structure, Day 1–7 roadmap.
- **Zero install** — `curl` + `jq` for fetching, Python stdlib for email rendering. No `pip install`.
- **Self-contained output** — report and raw JSONs live in one folder, ready to share, archive, or re-analyze.
- **HTML email** — built-in markdown → HTML renderer; recipients see real tables and code blocks.
- **5-tier token resolution** — checks shell env → `./.env` → `./.env.local` → skill `.env` → `~/.env`. Token never logged.

## Installation

```bash
# Copy into global skills folder
cp -r skills/github-trend-analyzer ~/.claude/skills/github-trend-analyzer

# Or symlink for local dev
ln -s "$(pwd)/skills/github-trend-analyzer" ~/.claude/skills/github-trend-analyzer
```

### Dependencies

| Tool               | Required             | Purpose                         |
|--------------------|----------------------|---------------------------------|
| `curl` `jq` `date` | Yes                  | Bundled with macOS / Linux      |
| `zip`              | For email attachment | Bundled with macOS / Linux      |
| `python3` (≥ 3.8)  | For email sending    | Stdlib only, no pip packages    |
| `GITHUB_TOKEN`     | Optional             | Lifts rate limit: 60/h → 5000/h |

## Usage

Trigger via natural language:

- "Analyze recent GitHub trends"
- "Show me hot AI Agent projects from the last week and how I should position a new project"
- "Star-rising new projects in the TypeScript ecosystem"
- "Generate a GitHub trend report focused on LLM tooling"

### Recommended input template

```
Domain:    <AI / Frontend / DevOps / Database / All>
Language:  <TypeScript / Rust / Python / Any>
Window:    <last 7 / 30 / 90 days>
Samples:   <N per bucket, default 15>
Focus:     <positioning / naming / monetization / docs / community>
```

## Configuration

### GITHUB_TOKEN (optional)

Resolved in priority order; the first hit wins:

1. shell env `$GITHUB_TOKEN`
2. `./.env`
3. `./.env.local`
4. `~/.claude/skills/github-trend-analyzer/.env`
5. `~/.env`

`.env` format (comments and quotes supported):

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
# or
GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
```

### SMTP config (optional, email only)

| Variable    | Purpose                      | Default            |
|-------------|------------------------------|--------------------|
| `SMTP_HOST` | SMTP server                  | none               |
| `SMTP_PORT` | Port (465=SSL, 587=STARTTLS) | none               |
| `SMTP_USER` | login username               | none               |
| `SMTP_PASS` | App-specific password        | none               |
| `SMTP_FROM` | from address                 | = SMTP_USER        |
| `SMTP_TLS`  | `ssl` or `starttls`          | inferred from port |

::: warning Security
For QQ / 163 / Gmail etc. you must use an app-specific password (or "authorization code"), not your account login password.
:::

## Output

Each run produces a self-contained folder:

```
github-trend-report-YYYY-MM-DD/
├── report.md              # main report (markdown)
└── data/
    ├── new.json           # new projects raw API
    ├── active.json        # high-engagement raw API
    └── top.json           # high-star raw API
```

When emailing, an additional `<folder>.zip` and `report.html` preview are produced.

## Report sections

| Section              | Content                                                           |
|----------------------|-------------------------------------------------------------------|
| Sample metadata      | Time window, domain, sample size, auth status                     |
| Three samples        | Top N for new / engaged / starred                                 |
| Pattern synthesis    | Language mix, topic frequency, name length, license distribution  |
| Design checklist     | Positioning / naming / tech / docs / community / monetization     |
| 🚀 Project Blueprint | Codename / positioning / scenarios / MVP / stack / repo / roadmap |
| Risks & pitfalls     | Red-ocean warnings + differentiation tips                         |
| Appendix             | data/*.json + re-analysis snippets                                |

## Re-analyze without using rate limit

```bash
cd github-trend-report-YYYY-MM-DD

# Language distribution
jq -r '.items[].language // "Unknown"' data/top.json | sort | uniq -c | sort -rn

# Topic diff (new − starred = emerging)
comm -23 \
  <(jq -r '.items[].topics[]' data/new.json | sort -u) \
  <(jq -r '.items[].topics[]' data/top.json | sort -u)
```

## Pairing with other skills

- After the report, hand the Blueprint to [`feature-planner`](./feature-planner) to break it into TODOs
- Use a frontend-design skill on top of naming/visual recommendations to draft README hero / logo

## Related references

Inside the skill repo:

- `references/github-api.md` — Search API fields, query syntax, rate-limit checks
- `references/analysis-template.md` — 7-dimension review checklist
- `references/send-report.py` — SMTP sender (Python stdlib only)
