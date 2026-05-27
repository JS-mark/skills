# 分析维度 Checklist

对每一类样本（新生 / 互动高 / star 高）按以下维度逐项打勾，再做横向对比。

## 1. 技术栈

- [ ] 主语言 Top 3 及占比
- [ ] runtime/framework 关键词（next、bun、tauri、tokio…）
- [ ] 是否原生 monorepo（pnpm / turborepo / nx）
- [ ] CI/CD：GitHub Actions / Vercel / 自建
- [ ] 包管理：npm / pnpm / cargo / pip / uv

## 2. 定位与命名

- [ ] 名字长度（1 词 / 2 词 / 短语）
- [ ] 是否含 emoji 或特殊字符
- [ ] 描述里 1 句话能否说清「是什么 + 给谁用 + 为什么」
- [ ] topics 高频词聚类（agent、framework、ui、cli、kit、studio…）

## 3. README 与品牌

- [ ] 首屏元素：Logo / Hero 图 / Demo GIF / 视频 / Badge
- [ ] Quick Start 在前 50 行内
- [ ] 是否给出对标产品（"the X for Y"）
- [ ] 中英双语 / 多语言 README
- [ ] Contributors 头像墙、Star History 图

## 4. 文档与 DX

- [ ] 是否有独立文档站（VitePress / Nextra / Mintlify / Docusaurus）
- [ ] 是否有 Playground / 在线 Demo
- [ ] 是否有 `npx create-xxx` 类脚手架
- [ ] Examples 数量与质量
- [ ] Changelog / Release Notes 维护频率

## 5. 社区运营

- [ ] Discussions 是否启用
- [ ] Issue / PR 模板
- [ ] CONTRIBUTING.md / CODE_OF_CONDUCT.md
- [ ] Discord / Slack / 微信群入口
- [ ] ROADMAP.md 或 Project Board
- [ ] 维护者数量、最近 30 天提交者数量

## 6. 商业化

- [ ] 是否有 Cloud / SaaS 版本
- [ ] 是否有 Pro / Enterprise 版本
- [ ] 是否接 GitHub Sponsors / OpenCollective
- [ ] License 选择（MIT / Apache-2.0 / 自定义商用条款）
- [ ] 团队是否注册公司、有融资信息

## 7. 时间信号（识别风口）

- [ ] 把「新生 Top 20」的 topics 全部拉出来做词频
- [ ] 与「star 高 Top 20」的 topics 取差集 → 新冒头的方向
- [ ] 与「互动高 Top 20」的 topics 取交集 → 真正在被人用的方向
- [ ] 三者都出现的 topic = 已经进入快速发展期的赛道

## 横向对比矩阵

| 维度 | 新生 | 互动高 | Star 高 | 我的项目应该…… |
|------|------|--------|---------|----------------|
| 主语言 |  |  |  |  |
| 命名风格 |  |  |  |  |
| README 模板 |  |  |  |  |
| 商业化路径 |  |  |  |  |

## 信号解读规则

- **新生强 + 长青弱** → 新风口，先发优势大但风险高
- **新生强 + 长青强** → 已被验证的赛道在加速，差异化是关键
- **新生弱 + 互动强** → 既有项目分蛋糕的阶段，做插件/集成更稳
- **三者都弱** → 冷门或衰退，慎入
