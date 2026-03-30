import { execSync } from 'node:child_process'
import { cpSync, existsSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const root = resolve(import.meta.dirname, '..')
const pluginSrc = resolve(root, 'packages/agent-pipeline/src')
const dashboardPkg = resolve(root, 'packages/pipeline-dashboard')
const dashboardOut = resolve(dashboardPkg, 'out')
const pluginDest = resolve(process.env.HOME || '~', '.claude/plugins/agent-pipeline')

if (!existsSync(pluginDest)) {
  console.error(`Plugin not installed at ${pluginDest}`)
  console.error('Install it first, then run this script to update.')
  process.exit(1)
}

// 1. Build dashboard
console.log('Building dashboard...')
execSync('pnpm --filter @aspect-mark/pipeline-dashboard build', { cwd: root, stdio: 'inherit' })

if (!existsSync(dashboardOut)) {
  console.error('Dashboard build failed — out/ not found.')
  process.exit(1)
}

// 2. Copy server.js & cli.js
for (const file of ['server.js', 'cli.js']) {
  cpSync(resolve(pluginSrc, file), resolve(pluginDest, file))
  console.log(`  Copied ${file}`)
}

// 3. Copy dashboard
const dest = resolve(pluginDest, 'dashboard')
if (existsSync(dest))
  rmSync(dest, { recursive: true })
cpSync(dashboardOut, dest, { recursive: true })
console.log('  Copied dashboard/')

console.log('\nDone! Restart Claude Code to apply updates.')
