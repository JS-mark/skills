# Contributing

[中文](./CONTRIBUTING.zh-CN.md)

Thanks for your interest in contributing! Here's how you can help.

## Adding a New Skill

1. Run the scaffold command:
   ```bash
   pnpm gen:skill my-awesome-skill
   ```
2. Edit `skills/my-awesome-skill/SKILL.md` — fill in the frontmatter and write your skill instructions.
3. Add any reference documents to `skills/my-awesome-skill/references/`.
4. Submit a PR.

## Adding a New Package

1. Create a new directory under `packages/`:
   ```bash
   mkdir -p packages/my-pkg/src packages/my-pkg/test
   ```
2. Add a `package.json` with name `@aspect-mark/my-pkg`, using `catalog:` for shared dependencies.
3. Add a `tsdown.config.ts` for build configuration.
4. Write source code in `src/` and tests in `test/`.
5. Verify with `pnpm build` and `pnpm test`.
6. Submit a PR.

## Code Style

- This project uses [@antfu/eslint-config](https://github.com/antfu/eslint-config).
- Run `pnpm lint:fix` before committing.
- No Prettier — formatting is handled by ESLint.

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation changes
- `chore:` — maintenance

## Pull Request Process

1. Fork the repo and create your branch from `main`.
2. Make your changes.
3. Ensure `pnpm lint` and `pnpm test` pass.
4. Submit a PR with a clear description.
