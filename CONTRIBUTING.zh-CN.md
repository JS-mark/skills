# 贡献指南

[English](./CONTRIBUTING.md)

感谢你有兴趣参与贡献！以下是参与方式。

## 添加新 Skill

1. 运行脚手架命令：
   ```bash
   pnpm gen:skill my-awesome-skill
   ```
2. 编辑 `skills/my-awesome-skill/SKILL.md`，填写 frontmatter 和技能描述。
3. 将参考文档放入 `skills/my-awesome-skill/references/`。
4. 提交 PR。

## 添加新 Package

1. 在 `packages/` 下创建新目录：
   ```bash
   mkdir -p packages/my-pkg/src packages/my-pkg/test
   ```
2. 添加 `package.json`，包名使用 `@aspect-mark/my-pkg`，共享依赖使用 `catalog:`。
3. 添加 `tsdown.config.ts` 配置构建。
4. 在 `src/` 编写源码，在 `test/` 编写测试。
5. 使用 `pnpm build` 和 `pnpm test` 验证。
6. 提交 PR。

## 代码风格

- 本项目使用 [@antfu/eslint-config](https://github.com/antfu/eslint-config)。
- 提交前运行 `pnpm lint:fix`。
- 不使用 Prettier — 格式化由 ESLint 处理。

## 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

- `feat:` — 新功能
- `fix:` — Bug 修复
- `docs:` — 文档变更
- `chore:` — 项目维护

## Pull Request 流程

1. Fork 仓库，从 `main` 创建分支。
2. 完成修改。
3. 确保 `pnpm lint` 和 `pnpm test` 通过。
4. 提交 PR 并附上清晰描述。
