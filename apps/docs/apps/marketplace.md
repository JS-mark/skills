# marketplace

**SkillForge** — Skill 和 MCP 服务器的发现、搜索、分享平台。基于 Nuxt 3 + Nuxt UI v4 构建，支持 SSR 部署到 Vercel，也支持 Docker 自托管。

| 项 | 值 |
|---|---|
| 包名 | `@aspect-mark/marketplace` |
| 路径 | `apps/marketplace/` |
| 框架 | Nuxt 3 / Nuxt 4 |
| UI 库 | Nuxt UI v4 + Tailwind CSS |
| 数据存储 | `@nuxt/content` + libSQL + Vercel Blob |
| 部署 | Vercel SSR / Docker |

## 命令

根目录别名：

```bash
pnpm market:dev        # 启动开发服务器
pnpm market:build      # 生产构建
pnpm market:preview    # 预览构建产物
```

也可以直接使用 pnpm filter：

```bash
pnpm --filter @aspect-mark/marketplace dev
pnpm --filter @aspect-mark/marketplace build
pnpm --filter @aspect-mark/marketplace generate   # 静态站点导出
```

## 数据来源

| 来源 | 用途 |
|------|------|
| `content/` JSON | 内置的 skill / MCP 元数据 |
| 外部 registry | 通过 `nuxt.config.ts` 配置导入第三方仓库 |
| Vercel Blob | 用户上传的资源（封面、附件） |
| Git 源 | 直接从 GitHub 仓库读取 SKILL.md |

## 部署

### Vercel（推荐）

仓库已配置 `vercel.json`，连接 Vercel 项目后会自动 SSR 部署。环境变量参考 `apps/marketplace/.env.example`。

### Docker

```bash
cd apps/marketplace
docker compose up -d
```

`docker-compose.yml` 已包含 libSQL 数据库的挂载点。

## UI 开发规范

::: warning 强制要求
marketplace **禁止** 使用原生 HTML 表单元素和手写样式容器，必须使用 Nuxt UI v4 组件：
:::

| 原生 HTML / 手写 | 替换为 |
|---|---|
| `<input>` | `<UInput>` |
| `<select>` | `<USelect>` |
| `<button>` | `<UButton>` |
| 手写 card | `<UCard>` |
| 手写 modal | `<UModal>` |
| 手写 tabs | `<UTabs>` |
| 手写 toast | `useToast()` |
| 手写 SVG icon | `<UIcon name="i-lucide-xxx">` |

## 目录结构

```
apps/marketplace/
├── app.config.ts          # Nuxt UI 主题配置
├── app.vue                # 根组件
├── assets/                # 全局 CSS
├── components/            # Vue 组件
├── composables/           # 组合式函数
├── content/               # 内置 skill/MCP 元数据
├── content.config.ts      # @nuxt/content 配置
├── pages/                 # 文件路由
├── server/                # API 路由 + 服务端逻辑
├── types/                 # TS 类型
├── public/                # 静态资源
├── docker/                # Docker 部署文件
├── docker-compose.yml
├── Dockerfile
├── nuxt.config.ts         # Nuxt 配置
└── vercel.json            # Vercel 部署配置
```

## 主题与样式

- 全局暗色模式（`colorMode.preference: 'dark'`）
- CSS 变量定义在 `assets/css/main.css` 的 `@theme` 块中
- 使用 `--color-surface` / `--color-border` / `--color-text-*` 等语义化变量
- 图标统一使用 `@iconify-json/lucide`，通过 `<UIcon name="i-lucide-xxx" />` 引用

## 相关链接

- 项目 README：`apps/marketplace/README.md`
- 在线访问：见仓库 `vercel.json` 中配置的域名
