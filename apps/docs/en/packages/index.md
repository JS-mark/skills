# Packages Overview

TypeScript packages in the Skills monorepo, managed via pnpm workspace. Packages that ship to npm are marked `npm`; internal-only packages are marked `private`.

::: tip
End-user applications (marketplace, docs) live under [Apps](/en/apps/). This section is for libraries you `import`.
:::

## All Packages

| Package | Version | Publish | Description |
|---------|---------|---------|-------------|
| [@aspect-mark/agent-pipeline](./agent-pipeline) | v2.1.0 | npm | Multi-Agent Pipeline MCP Plugin |
| [@aspect-mark/pipeline-dashboard](./pipeline-dashboard) | v1.0.0 | private | Next.js monitoring UI bundled with agent-pipeline |
| [@aspect-mark/shared](./shared) | v0.0.0 | upcoming | Shared utility functions (tsdown build) |

## Installation

```bash
# Install a single package
pnpm add @aspect-mark/shared

# agent-pipeline is used via npx, no installation needed
npx @aspect-mark/agent-pipeline
```

## Development

```bash
# Clone repo and install dependencies
git clone https://github.com/JS-mark/skills.git
cd skills && pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Creating a New Package

1. Create a new directory under `packages/`
2. Add `package.json` (name format: `@aspect-mark/<name>`)
3. Use `catalog:` for shared dependency versions
4. Add `tsdown.config.ts` build configuration
5. Write source code and tests
6. Verify with `pnpm build` and `pnpm test`
