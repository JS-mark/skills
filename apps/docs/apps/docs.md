# docs

本文档站本身 — 基于 VitePress 1.x 构建，部署到 GitHub Pages。

| 项 | 值 |
|---|---|
| 包名 | `@aspect-mark/docs` |
| 路径 | `apps/docs/` |
| 框架 | VitePress 1.6 |
| 部署 | GitHub Pages |
| 工作流 | `.github/workflows/docs.yml` |

## 命令

```bash
pnpm docs:dev          # 启动本地开发服务器
pnpm docs:build        # 生产构建（输出到 .vitepress/dist/）
pnpm docs:preview      # 预览构建产物
```

## 多语言

中英双语，通过 VitePress 的 `locales` 机制实现：

| 语言 | 路径前缀 | 配置文件 |
|------|---------|---------|
| 中文（默认） | `/` | `apps/docs/.vitepress/config/zh.ts` |
| 英文 | `/en/` | `apps/docs/.vitepress/config/en.ts` |

共享配置在 `apps/docs/.vitepress/config/shared.ts`，主题入口在 `theme/index.ts`。

## 目录结构

```
apps/docs/
├── .vitepress/
│   ├── config/
│   │   ├── index.ts        # 入口（合并 shared + zh + en）
│   │   ├── shared.ts       # 通用配置
│   │   ├── zh.ts           # 中文 nav / sidebar
│   │   └── en.ts           # 英文 nav / sidebar
│   └── theme/
│       ├── index.ts
│       └── style.css
├── index.md                # 中文首页（home layout）
├── changelog.md
├── guide/                  # 中文 guide
├── skills/                 # 中文 skills 文档
├── packages/               # 中文 packages 文档
├── apps/                   # 中文 apps 文档
├── en/                     # 英文文档（同构镜像）
│   ├── index.md
│   ├── guide/
│   ├── skills/
│   ├── packages/
│   └── apps/
├── public/
│   └── logo.svg
└── package.json
```

## 添加新文档

### 添加新 Skill 文档

1. 在 `apps/docs/skills/<name>.md` 写中文页面
2. 在 `apps/docs/en/skills/<name>.md` 写英文页面
3. 在 `apps/docs/.vitepress/config/zh.ts` 和 `en.ts` 的 sidebar 中加入条目
4. 更新 `skills/index.md` 与 `en/skills/index.md` 列表
5. 视情况在主页 `index.md` 的 `features` 中加一张特性卡

### 添加新 Package / App 文档

类似地：在对应目录创建 `.md` 文件 + 同步两份 sidebar。

## 部署

`main` 分支上 `apps/docs/**` 路径变更会触发 `.github/workflows/docs.yml`：

1. `pnpm install --frozen-lockfile`
2. `pnpm --filter @aspect-mark/docs build`
3. 产物 `apps/docs/.vitepress/dist/` 上传为 GitHub Pages artifact
4. `actions/deploy-pages@v4` 部署到 `github-pages` environment

可以通过 `workflow_dispatch` 手动触发。

## Edit on GitHub

每页右侧有「在 GitHub 上编辑此页 / Edit this page on GitHub」入口，链接到 `https://github.com/JS-mark/skills/edit/main/apps/docs/:path`。
