# i18n-helper

多语言国际化助手 — 识别代码中的硬编码 UI 文本，自动生成 translation key，同步更新 en/zh 语言文件并替换源代码。

## 特性

- **智能识别** — 自动扫描 JSX、属性值、Ant Design 组件中的硬编码文本
- **Namespace 推断** — 根据文件路径自动选择合适的 i18n namespace
- **Key 复用** — 优先搜索已有 key，避免重复定义
- **双语同步** — en 和 zh 语言文件同时更新
- **确认后执行** — 展示变更计划，用户确认后才修改文件
- **最小改动** — 只替换 UI 文本，不改动业务逻辑

## 安装

```bash
# 方式一：复制到 skills 目录
cp -r skills/i18n-helper ~/.claude/skills/i18n-helper

# 方式二：本地开发模式
claude --skill-dir /path/to/i18n-helper
```

## 使用方法

### 斜杠命令

```bash
/i18nify                                              # 交互式选择文件
/i18nify src/renderer/src/components/settings/General.tsx  # 指定文件
```

### 自然语言触发

以下关键词会自动激活本 Skill：

- "做多语言"、"国际化"、"i18n"
- "翻译文本"、"多语言化"、"add translations"
- "替换硬编码文本"、"抽取翻译"

## 工作流程

1. **确定目标** — 用户指定文件或交互式选择
2. **扫描文本** — 识别硬编码 UI 文本（跳过 console、注释、技术标识符等）
3. **选择 Namespace** — 根据文件路径匹配对应 namespace
4. **生成 Key** — camelCase 命名，语义化分组（actions.save、messages.deleteSuccess 等）
5. **展示计划** — 列出所有变更供用户确认
6. **更新文件** — 同步更新 en/zh JSON 和源代码
7. **验证** — 检查语法、key 对应和无重复

## 支持的 Namespace

| Namespace | 覆盖范围 |
|-----------|----------|
| app | 应用级别（布局、导航） |
| chat | 聊天界面、消息、对话 |
| common | 通用操作（保存、取消、删除等） |
| error | 错误消息 |
| settings | 设置页面 |
| mcp | MCP 服务管理 |
| skills | Skill 管理 |
| plugins | 插件管理 |
| models | 模型服务商、模型选择 |

## 使用示例

```
用户：把 src/renderer/src/components/settings/General.tsx 做多语言化

→ 扫描文件，找到 12 处硬编码文本
→ 展示变更计划：
  "通用设置" → t("title", { ns: "settings" })   zh: "通用设置"  en: "General Settings"
  "保存"     → t("save")                         zh: "保存"      en: "Save"
  ...
→ 用户确认后，更新 3 个文件
```

## 适用项目

- 框架：i18next + react-i18next
- 语言：English (en) + 简体中文 (zh)
- 语言文件路径：`src/renderer/src/i18n/locales/{lang}/{namespace}.json`
