# i18n-helper

Internationalization Assistant — detects hardcoded UI text in code, auto-generates translation keys, syncs en/zh language files, and replaces source code.

## Features

- **Smart Detection** — Auto-scans JSX, attribute values, Ant Design components for hardcoded text
- **Namespace Inference** — Automatically selects the appropriate i18n namespace based on file path
- **Key Reuse** — Prioritizes existing keys to avoid duplicates
- **Bilingual Sync** — Updates en and zh language files simultaneously
- **Confirm Before Apply** — Shows change plan for user approval before modifying files
- **Minimal Changes** — Only replaces UI text, doesn't touch business logic

## Installation

```bash
# Option 1: Copy to skills directory
cp -r skills/i18n-helper ~/.claude/skills/i18n-helper

# Option 2: Local development mode
claude --skill-dir /path/to/i18n-helper
```

## Usage

### Slash Command

```bash
/i18nify                                              # Interactive file selection
/i18nify src/renderer/src/components/settings/General.tsx  # Specify file
```

### Natural Language Triggers

Keywords that activate this Skill:

- "internationalize", "i18n", "add translations"
- "translate text", "localize"
- "replace hardcoded text", "extract translations"

## Workflow

1. **Determine Target** — User specifies file or selects interactively
2. **Scan Text** — Identify hardcoded UI text (skip console, comments, technical identifiers)
3. **Select Namespace** — Match namespace based on file path
4. **Generate Keys** — camelCase naming, semantic grouping (actions.save, messages.deleteSuccess, etc.)
5. **Show Plan** — List all changes for user confirmation
6. **Update Files** — Sync update en/zh JSON and source code
7. **Validate** — Check syntax, key correspondence, no duplicates

## Supported Namespaces

| Namespace | Coverage |
|-----------|----------|
| app | Application level (layout, navigation) |
| chat | Chat interface, messages, conversations |
| common | Common operations (save, cancel, delete, etc.) |
| error | Error messages |
| settings | Settings pages |
| mcp | MCP service management |
| skills | Skill management |
| plugins | Plugin management |
| models | Model providers, model selection |

## Usage Example

```
User: Internationalize src/renderer/src/components/settings/General.tsx

→ Scan file, found 12 hardcoded texts
→ Show change plan:
  "通用设置" → t("title", { ns: "settings" })   zh: "通用设置"  en: "General Settings"
  "保存"     → t("save")                         zh: "保存"      en: "Save"
  ...
→ After user confirms, update 3 files
```

## Target Projects

- Framework: i18next + react-i18next
- Languages: English (en) + Simplified Chinese (zh)
- Language file path: `src/renderer/src/i18n/locales/{lang}/{namespace}.json`
