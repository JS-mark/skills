# @aspect-mark/pipeline-dashboard

`@aspect-mark/pipeline-dashboard` is the web monitoring UI for [`@aspect-mark/agent-pipeline`](./agent-pipeline), built with Next.js 15 + React 19 + Tailwind CSS 4.

::: tip Private package
This package is marked `private: true` and is not published to npm. Its build artifacts are **statically exported** and shipped inside the `dashboard/` folder of the `agent-pipeline` repo. The MCP server starts it on demand when the `pipeline_dashboard` tool is invoked.
:::

## Role

| Item | Description |
|------|-------------|
| Purpose | Visual monitoring frontend for agent-pipeline |
| Shape | Next.js static export |
| Default port | `3211` (both dev and start) |
| Surface | Started/stopped via the `pipeline_dashboard` MCP tool |

## Capabilities

- Real-time view of 7-phase pipeline status (pending / running / done / failed / skipped)
- Phase 2 subtask progress (architect / ui-designer / tester running in parallel)
- Fix-test loop round details
- Browse and edit role files (PM / Architect / Tester …)
- Inline view of generated docs and code artifacts

## Development

```bash
# From the monorepo root
pnpm --filter @aspect-mark/pipeline-dashboard dev

# Open http://localhost:3211
```

Build the static export:

```bash
pnpm --filter @aspect-mark/pipeline-dashboard build

# Output: packages/pipeline-dashboard/out/
```

## Integration with agent-pipeline

`agent-pipeline`'s `prepack` script:

1. Triggers `next build` of pipeline-dashboard
2. Copies `out/` into `packages/agent-pipeline/dashboard/`
3. Ships everything together

End users installing `@aspect-mark/agent-pipeline` get the dashboard pre-bundled — no separate install of this package is necessary.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 + React 19 |
| Styling | Tailwind CSS 4 + PostCSS |
| Markdown | react-markdown + remark-gfm |
| Code highlighting | Shiki |
| Icons | lucide-react |

## Layout

```
packages/pipeline-dashboard/
├── app/              # Next.js App Router pages
├── components/       # Shared React components
├── hooks/            # Custom hooks
├── lib/              # Utilities
├── next.config.ts
└── tsconfig.json
```
