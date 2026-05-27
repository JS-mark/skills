# Packages 总览

Skills monorepo 中的 TypeScript 工具包，通过 pnpm workspace 管理。可独立发布到 npm 的会标注 `npm`，仅服务于 monorepo 内部的会标注 `私有`。

::: tip
面向终端用户的应用（marketplace、docs）请见 [Apps](/apps/)；这里的 packages 是可被 import 的库。
:::

## 全部 Packages

| 包名 | 版本 | 发布 | 描述 |
|------|------|------|------|
| [@aspect-mark/agent-pipeline](./agent-pipeline) | v2.1.0 | npm | 多 Agent 流水线 MCP 插件 |
| [@aspect-mark/pipeline-dashboard](./pipeline-dashboard) | v1.0.0 | 私有 | agent-pipeline 配套的 Next.js 监控 UI |
| [@aspect-mark/shared](./shared) | v0.0.0 | 即将发布 | 共享工具函数（tsdown 构建） |

## 安装

```bash
# 安装单个包
pnpm add @aspect-mark/shared

# agent-pipeline 通过 npx 使用，无需安装
npx @aspect-mark/agent-pipeline
```

## 开发

```bash
# 克隆仓库并安装依赖
git clone https://github.com/JS-mark/skills.git
cd skills && pnpm install

# 构建所有包
pnpm build

# 运行测试
pnpm test
```

## 创建新 Package

1. 在 `packages/` 下创建新目录
2. 添加 `package.json`（包名格式：`@aspect-mark/<name>`）
3. 使用 `catalog:` 引用共享依赖版本
4. 添加 `tsdown.config.ts` 构建配置
5. 编写源码和测试
6. 运行 `pnpm build` 和 `pnpm test` 验证
