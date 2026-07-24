# SkillForge Marketplace

一站式聚合 Skills、MCP 服务器与开发者工具的市场平台。为 AI Agent 发现和分享最佳工具。

## 技术栈

- **框架**: Nuxt 4 (SSR)
- **UI 组件**: Nuxt UI v3
- **样式**: Tailwind CSS v4 + CSS 变量主题
- **图标**: @iconify-json/lucide
- **Markdown 渲染**: marked
- **内容管理**: @nuxt/content (libsql)
- **部署**: Vercel

## 功能

- MCP 服务器浏览、搜索、分页
- Agent Skills 浏览、搜索、分页
- 外部市场源管理（Registry / Git 仓库导入）
- Skill / MCP Server 发布（弹窗表单）
- 明暗主题切换（支持跟随系统）
- Markdown 格式描述渲染
- 响应式布局

## 开发

```bash
# 安装依赖（从 monorepo 根目录）
pnpm install

# 开发服务器
pnpm market:dev

# 构建
pnpm market:build

# 预览构建产物
pnpm --filter @aspect-mark/marketplace preview
```

## 项目结构

```
apps/marketplace/
├── assets/css/main.css     # 全局样式 + 主题变量（亮/暗）
├── components/             # Vue 组件
│   ├── AppHeader.vue       # 顶部导航（含主题切换）
│   ├── AppFooter.vue       # 底部栏
│   ├── MarketCard.vue      # 卡片组件
│   ├── MarkdownBody.vue    # Markdown 渲染组件
│   ├── SubmitModal.vue     # 发布弹窗
│   ├── SearchBar.vue       # 搜索框
│   └── CategoryNav.vue     # 分类导航
├── composables/            # 组合式函数
│   ├── useMarketplace.ts   # 数据获取
│   ├── useSubmit.ts        # 发布提交
│   └── useSources.ts       # 市场源管理
├── content/                # 静态数据源（JSON）
│   ├── mcps/               # MCP 服务器数据
│   ├── skills/             # Skills 数据
│   └── sources.json        # 外部源配置
├── pages/                  # 路由页面
│   ├── index.vue           # 首页（Hero + 热门列表）
│   ├── mcps/index.vue      # MCP 列表页
│   ├── mcps/[id].vue       # MCP 详情页
│   ├── skills/index.vue    # Skills 列表页
│   ├── skills/[id].vue     # Skills 详情页
│   └── sources/index.vue   # 市场源管理页
├── server/                 # Nitro 服务端
│   ├── api/                # API 路由
│   └── utils/              # 数据处理工具
├── types/                  # TypeScript 类型定义
├── app.vue                 # 根布局
└── nuxt.config.ts          # Nuxt 配置
```

## 主题系统

使用 CSS 变量实现亮暗主题切换：

- `:root` 定义亮色变量
- `.dark` 覆盖为暗色变量
- 通过 `useColorMode()` 切换，支持 `light` / `dark` / `system` 三种模式

## API 路由

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/mcps` | MCP 列表（支持分页、搜索、分类筛选） |
| GET | `/api/mcps/:id` | MCP 详情 |
| POST | `/api/mcps/submit` | 提交新 MCP |
| GET | `/api/skills` | Skills 列表 |
| GET | `/api/skills/:id` | Skill 详情 |
| POST | `/api/skills/submit` | 提交新 Skill |
| GET | `/api/search` | 全局搜索 |
| GET | `/api/sources` | 市场源列表 |
| POST | `/api/sources` | 添加市场源 |
| POST | `/api/sources/sync` | 同步市场源 |
| DELETE | `/api/sources/:id` | 删除市场源 |

## 部署（Vercel）

本应用通过仓库根的 monorepo 构建，产物为 Vercel Build Output (v3)。关键设置：

- **Root Directory**：在 Vercel 项目设置中必须设为 `apps/marketplace`。`vercel.json` 的
  `installCommand` / `buildCommand` 都以 `cd ../..` 回到 monorepo 根安装/构建，
  产物落在 `apps/marketplace/.vercel/output`，与 `outputDirectory: .vercel/output`
  （相对 Root Directory）自洽。若 Root Directory 不是 `apps/marketplace`，路径会错位导致部署失败。
- **Storage（Blob Store）**：数据存储驱动由 `STORAGE_DRIVER=vercelBlob` 选择，需要
  `BLOB_READ_WRITE_TOKEN`。在 Vercel 项目 **Storage → Create Blob Store** 创建后会自动注入该变量。
  未注入时应用会降级到 `memory` 驱动（数据不持久），仅用于兜底、不建议生产使用。
- **构建环境变量**：`NITRO_PRESET=vercel` 与 `STORAGE_DRIVER=vercelBlob` 已在 `vercel.json`
  的 `build.env` 中声明，无需手动配置。
- **原生依赖**：`@nuxt/content` 构建期使用的本地 SQLite 已切换为 Node 内置 `node:sqlite`
  （`content.experimental.nativeSqlite: true`，需 Node ≥ 22.5，Vercel 默认运行时满足），
  因此 install 阶段**不再触发 `better-sqlite3` / `sqlite3` 的 node-gyp 原生编译**。

## 环境要求

- Node.js >= 22.5（构建期使用 Node 内置 `node:sqlite`）
- pnpm >= 9
