# iconfont-downloader

Iconfont Icon Downloader — search and download SVG icons from iconfont.cn. Supports username/password and QR code login, displays search results for user selection.

## Features

- **Multiple Login Methods** — Username/password or QR code scan
- **Bilingual Search** — Auto-switches to English keywords when Chinese results are poor
- **Result Display** — Shows search results in table format for user selection
- **Batch Download** — Supports index numbers, ranges, and natural language selection
- **Search Cache** — No repeated searches for the same keyword
- **Custom Path** — Supports custom icon output directory

## Installation

```bash
# Option 1: Copy to skills directory
cp -r skills/iconfont-downloader ~/.claude/skills/iconfont-downloader

# Option 2: Local development mode
claude --skill-dir /path/to/iconfont-downloader
```

### Dependencies

The Skill auto-detects and uses the following browser automation tools (by priority):

1. **MCP Browser Tool** — If available, no extra installation needed
2. **Playwright** — `pnpm add playwright`
3. **Puppeteer** — `pnpm add puppeteer`

## Usage

Just say in conversation:

- "Download a home icon for me"
- "Search for a home icon on iconfont"
- "Find a search icon and download it to the project"

Claude will automatically guide you through the **Login → Search → Select → Download** workflow.

### Batch Download Selection Formats

| Format | Example | Description |
|--------|---------|-------------|
| Comma-separated | `"1,3,5"` | Download items 1, 3, 5 |
| Range | `"1-5"` | Download items 1 through 5 |
| Natural language | `"first 5"` | Download first 5 items |
| All | `"all"` | Download everything |

## Usage Example

```
User: Download some settings-related icons

→ Check login status (guide login if not logged in)
→ Search "settings", show table:
  | # | Name | Author |
  |---|------|--------|
  | 1 | settings | Author A |
  | 2 | gear | Author B |
  | ...
→ User: "Download 1 and 3"
→ Batch download and save to project icons directory
```

## Notes

1. **Login Security** — Passwords are only passed to the login tool, never saved to disk
2. **Session Expiry** — Sessions may expire, auto-guides re-login when needed
3. **Fair Use** — Avoid frequent requests in short time periods
4. **Copyright** — Please respect the original author's copyright of downloaded icons
5. **Browser Dependency** — First use of Playwright / Puppeteer may require browser download

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Login failed | Check credentials, network, or try QR code login |
| No search results | Try English keywords, check login status |
| Download failed | Check directory write permissions and disk space |
| Browser tool not detected | Install `playwright` or `puppeteer` |
