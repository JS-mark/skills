# @aspect-mark/pipeline-dashboard

`@aspect-mark/pipeline-dashboard` 是 [`@aspect-mark/agent-pipeline`](./agent-pipeline) 的 Web 监控 UI，基于 Next.js 15 + React 19 + Tailwind CSS 4 构建。

::: tip 私有包
此包标记为 `private: true`，不会发布到 npm。它的产物以**静态导出**的方式被打包进 `agent-pipeline` 仓库的 `dashboard/` 目录，由 MCP 服务器在 `pipeline_dashboard` 工具被调用时启动。
:::

## 定位

| 项 | 说明 |
|---|---|
| 角色 | agent-pipeline 的可视化监控前端 |
| 形态 | Next.js 静态站点（Static Export） |
| 启动端口 | 默认 `3211`（dev / start 都是） |
| 用户接触面 | 通过 `agent-pipeline` MCP 工具 `pipeline_dashboard` 启停 |

## 功能

- 实时显示 7 阶段流水线进度（pending / running / done / failed / skipped）
- 子任务（Phase 2 的 architect / ui-designer / tester）并行进度可视化
- 修复轮次（fix-test loop）数据展示
- 角色文件（PM / Architect / Tester 等）查看与编辑
- 文档与代码产物在线浏览

## 开发

```bash
# 在 monorepo 根目录运行
pnpm --filter @aspect-mark/pipeline-dashboard dev

# 浏览器访问 http://localhost:3211
```

构建静态产物：

```bash
pnpm --filter @aspect-mark/pipeline-dashboard build

# 产物位于 packages/pipeline-dashboard/out/
```

## 与 agent-pipeline 的集成

`agent-pipeline` 的 `prepack` 脚本会自动：

1. 触发 `pipeline-dashboard` 的 `next build`
2. 将 `out/` 静态产物复制到 `packages/agent-pipeline/dashboard/`
3. 一同打包发布

终端用户安装 `@aspect-mark/agent-pipeline` 时，dashboard 已经内置，无需单独安装本包。

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 15 + React 19 |
| 样式 | Tailwind CSS 4 + PostCSS |
| Markdown | react-markdown + remark-gfm |
| 代码高亮 | Shiki |
| 图标 | lucide-react |

## 目录结构

```
packages/pipeline-dashboard/
├── app/              # Next.js App Router 页面
├── components/       # 共享 React 组件
├── hooks/            # 自定义 hooks
├── lib/              # 工具函数
├── next.config.ts
└── tsconfig.json
```
