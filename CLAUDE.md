# Skills Monorepo

## Project Structure

```
skills/          → Claude Code Skills (pure Markdown, NOT in pnpm workspace)
packages/        → TypeScript packages (pnpm workspace)
scripts/         → Development scripts
```

## Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm test             # Run tests
pnpm lint             # Lint code
pnpm lint:fix         # Lint and auto-fix
pnpm gen:skill <name> # Generate new skill scaffold
pnpm release          # Version bump and release
```

## Adding a New Skill

1. `pnpm gen:skill <name>` — generates `skills/<name>/SKILL.md` and `references/` directory
2. Edit the SKILL.md frontmatter (name, description, version, author, tags)
3. Write skill instructions in the markdown body

## Adding a New Package

1. Create `packages/<name>/` with `package.json` (name: `@aspect-mark/<name>`), `tsdown.config.ts`, `src/index.ts`, `test/`
2. Use `catalog:` for shared devDependencies
3. Run `pnpm install`, `pnpm build`, `pnpm test` to verify

## Code Style

- ESLint with `@antfu/eslint-config` — no Prettier
- `skills/` directory is excluded from linting
- Follow Conventional Commits for commit messages
