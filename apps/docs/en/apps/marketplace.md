# marketplace

**SkillForge** — discover, search, and share Skills and MCP servers. Built with Nuxt 3 + Nuxt UI v4, deployable to Vercel (SSR) or self-hosted via Docker.

| Item | Value |
|------|-------|
| Package | `@aspect-mark/marketplace` |
| Path | `apps/marketplace/` |
| Framework | Nuxt 3 / Nuxt 4 |
| UI library | Nuxt UI v4 + Tailwind CSS |
| Storage | `@nuxt/content` + libSQL + Vercel Blob |
| Deploy | Vercel SSR / Docker |

## Commands

Root aliases:

```bash
pnpm market:dev        # start dev server
pnpm market:build      # production build
pnpm market:preview    # preview the build
```

Or via pnpm filter:

```bash
pnpm --filter @aspect-mark/marketplace dev
pnpm --filter @aspect-mark/marketplace build
pnpm --filter @aspect-mark/marketplace generate   # static export
```

## Data sources

| Source | Use |
|--------|-----|
| `content/` JSON | Bundled skill / MCP metadata |
| External registries | Imported via `nuxt.config.ts` |
| Vercel Blob | User-uploaded assets (covers, attachments) |
| Git sources | Read SKILL.md straight from GitHub repos |

## Deployment

### Vercel (recommended)

`vercel.json` is already wired up. After connecting the repo to a Vercel project, SSR deploy happens automatically. Env-vars: see `apps/marketplace/.env.example`.

### Docker

```bash
cd apps/marketplace
docker compose up -d
```

`docker-compose.yml` includes a libSQL volume mount.

## UI conventions

::: warning Mandatory
Marketplace **must not** use raw HTML form elements or hand-written wrappers — always use Nuxt UI v4 components:
:::

| Raw HTML / hand-rolled | Replace with |
|-----------------------|--------------|
| `<input>` | `<UInput>` |
| `<select>` | `<USelect>` |
| `<button>` | `<UButton>` |
| Hand-rolled card | `<UCard>` |
| Hand-rolled modal | `<UModal>` |
| Hand-rolled tabs | `<UTabs>` |
| Hand-rolled toast | `useToast()` |
| Inline SVG icon | `<UIcon name="i-lucide-xxx">` |

## Layout

```
apps/marketplace/
├── app.config.ts          # Nuxt UI theme config
├── app.vue                # root component
├── assets/                # global CSS
├── components/            # Vue components
├── composables/           # composables
├── content/               # bundled metadata
├── content.config.ts      # @nuxt/content config
├── pages/                 # file-based routes
├── server/                # API routes + server logic
├── types/                 # TS types
├── public/                # static assets
├── docker/                # docker deploy files
├── docker-compose.yml
├── Dockerfile
├── nuxt.config.ts         # Nuxt config
└── vercel.json            # Vercel config
```

## Theme & styling

- Forced dark mode (`colorMode.preference: 'dark'`)
- CSS variables defined in the `@theme` block of `assets/css/main.css`
- Use semantic tokens: `--color-surface` / `--color-border` / `--color-text-*`
- Icons exclusively from `@iconify-json/lucide` via `<UIcon name="i-lucide-xxx" />`

## Links

- Project README: `apps/marketplace/README.md`
- Live URL: see the domain configured in `vercel.json`
