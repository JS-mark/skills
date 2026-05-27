# Packages Overview

TypeScript packages in the Skills monorepo, managed via pnpm workspace and published to npm.

## All Packages

| Package | Version | Description |
|---------|---------|-------------|
| [@aspect-mark/agent-pipeline](./agent-pipeline) | v2.0.0 | Multi-Agent Pipeline MCP Plugin |
| [@aspect-mark/shared](./shared) | v0.0.0 | Shared Utility Functions |

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
