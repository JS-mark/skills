# docs

This documentation site itself — built with VitePress 1.x and deployed to GitHub Pages.

| Item | Value |
|------|-------|
| Package | `@aspect-mark/docs` |
| Path | `apps/docs/` |
| Framework | VitePress 1.6 |
| Deploy | GitHub Pages |
| Workflow | `.github/workflows/docs.yml` |

## Commands

```bash
pnpm docs:dev          # start local dev server
pnpm docs:build        # production build (.vitepress/dist/)
pnpm docs:preview      # preview the build
```

## Internationalization

Bilingual (Chinese + English) via VitePress' `locales`:

| Language | Path prefix | Config file |
|----------|------------|-------------|
| Chinese (default) | `/` | `apps/docs/.vitepress/config/zh.ts` |
| English | `/en/` | `apps/docs/.vitepress/config/en.ts` |

Shared config lives in `apps/docs/.vitepress/config/shared.ts`; theme entry is `theme/index.ts`.

## Layout

```
apps/docs/
├── .vitepress/
│   ├── config/
│   │   ├── index.ts        # entry (merges shared + zh + en)
│   │   ├── shared.ts       # common config
│   │   ├── zh.ts           # zh nav / sidebar
│   │   └── en.ts           # en nav / sidebar
│   └── theme/
│       ├── index.ts
│       └── style.css
├── index.md                # zh home (home layout)
├── changelog.md
├── guide/                  # zh guide
├── skills/                 # zh skills docs
├── packages/               # zh packages docs
├── apps/                   # zh apps docs
├── en/                     # English mirror
│   ├── index.md
│   ├── guide/
│   ├── skills/
│   ├── packages/
│   └── apps/
├── public/
│   └── logo.svg
└── package.json
```

## Adding new pages

### Adding a new Skill page

1. Write the Chinese page at `apps/docs/skills/<name>.md`
2. Write the English page at `apps/docs/en/skills/<name>.md`
3. Add an entry under sidebar in both `apps/docs/.vitepress/config/zh.ts` and `en.ts`
4. Update the listing in `skills/index.md` and `en/skills/index.md`
5. Optionally add a feature card on `index.md` `features:`

### Adding a new Package / App page

Same pattern: create the `.md`, sync both sidebars.

## Deploy

Pushes to `main` that touch `apps/docs/**` trigger `.github/workflows/docs.yml`:

1. `pnpm install --frozen-lockfile`
2. `pnpm --filter @aspect-mark/docs build`
3. The artifact at `apps/docs/.vitepress/dist/` is uploaded as a GitHub Pages artifact
4. `actions/deploy-pages@v4` deploys to the `github-pages` environment

It can also be invoked manually via `workflow_dispatch`.

## Edit on GitHub

Each page has an "Edit this page on GitHub" link pointing to `https://github.com/JS-mark/skills/edit/main/apps/docs/:path`.
