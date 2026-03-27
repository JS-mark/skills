# 📖 novel-writer — 长篇小说创作助手

Claude Code Skill，提供长篇小说全流程创作能力：大纲架构、角色设计、章节连载、进度管理，支持网络素材搜索和配图生成。

## 特性

- **全流程覆盖** — 大纲 → 角色 → 章节创作 → 进度跟踪，一条龙完成
- **自动存档** — 每章自动保存，支持跨会话恢复创作上下文
- **伏笔管理** — 记录和追踪伏笔的埋设与回收
- **素材搜索** — 调用 WebSearch / WebFetch 搜索真实世界素材
- **配图生成** — 支持 MCP 工具生图 / Prompt 导出（Midjourney / DALL-E / SD）
- **多题材支持** — 都市修仙、都市兵王、玄幻、仙侠、悬疑等

## 安装

### 方法一：复制到 Claude Code skills 目录

```bash
# 复制整个 skill 目录
cp -r skills/novel-writer ~/.claude/skills/novel-writer
```

### 方法二：本地开发模式

```bash
claude --skill-dir /path/to/novel-writer
```

### 验证安装

启动 Claude Code，输入以下任意内容：

- "帮我写小说"
- "我想创作一部都市修仙小说"
- "写大纲"

如果 skill 正确加载，Claude 会以小说作家身份回应并引导创作流程。

## 使用方法

### 斜杠命令

```bash
/write                         # 使用默认路径 ~/Desktop/novel/
/write ~/Documents/my-story    # 使用自定义路径
```

### 自然语言触发

以下关键词会自动激活本 skill：

- "写小说"、"创作小说"、"写长篇"
- "继续写"、"更新文章"、"下一章"
- "写大纲"、"设计人物"、"写角色"
- "搜索素材"、"生成插图"

## 创作流程

| 阶段 | 说明 | 输出文件 |
|------|------|----------|
| 故事大纲 | 世界观、主线剧情、分卷规划 | `outline.md` |
| 角色大纲 | 角色档案、性格画像、关系网 | `characters.md` |
| 章节创作 | 每章 3000-5000 字 | `chapters/第X卷/第XXX章-标题.md` |
| 进度管理 | 每章自动更新进度和伏笔状态 | `progress.md` |

### 启动加载

每次触发 skill 时，自动读取已有存档恢复上下文：

```
📖 已加载创作存档
存储路径：~/Desktop/novel/
书名：《XXX》
当前进度：第X卷 · 第XX章
上章概要：XXX
准备好了，随时可以继续！
```

## 使用示例

```
用户：帮我写一部都市修仙小说
→ 进入大纲阶段，逐步讨论世界观、主线、分卷

用户：设计主角
→ 进入角色阶段，建立角色档案

用户：开始写第一章，主角在公司被辞退后偶遇神秘老人
→ 按概要展开写 3000-5000 字章节

用户：继续写
→ 按大纲自动推进下一章

用户：帮主角生成一张角色立绘
→ 调用图片工具或生成 Prompt

用户：搜索一下现代都市修仙的常见设定
→ 使用 WebSearch 搜索素材
```

## 项目文件结构

```
<NOVEL_ROOT>/                    # 默认 ~/Desktop/novel/
├── outline.md                   # 故事大纲
├── characters.md                # 角色档案
├── progress.md                  # 创作进度 & 伏笔管理
└── chapters/
    ├── 第1卷/
    │   ├── 第001章-标题.md
    │   └── ...
    └── 第2卷/
```

## 目录结构

```
novel-writer/
├── .claude-plugin/
│   └── plugin.json              # 插件元数据
├── commands/
│   └── write.md                 # /write 斜杠命令
├── skills/
│   └── novel-writer/
│       ├── SKILL.md             # 核心 Skill 定义
│       └── references/
│           ├── outline-template.md     # 大纲模板
│           ├── character-template.md   # 角色档案模板
│           └── writing-techniques.md   # 写作技巧参考
└── README.md
```

## 许可证

MIT
