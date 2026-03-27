import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const name = process.argv[2]

if (!name) {
  console.error('Usage: pnpm gen:skill <skill-name>')
  process.exit(1)
}

const skillDir = resolve(import.meta.dirname, '..', 'skills', name)

if (existsSync(skillDir)) {
  console.error(`Skill "${name}" already exists at ${skillDir}`)
  process.exit(1)
}

const skillMd = `---
name: ${name}
description: TODO - Describe what this skill does
version: 0.1.0
author: JS-mark
tags: []
---

# ${name}

TODO - Write your skill instructions here.
`

mkdirSync(skillDir, { recursive: true })
mkdirSync(resolve(skillDir, 'references'), { recursive: true })

writeFileSync(resolve(skillDir, 'SKILL.md'), skillMd)
writeFileSync(resolve(skillDir, 'references', '.gitkeep'), '')

console.log(`Skill "${name}" created at ${skillDir}`)
console.log('Files:')
console.log(`  - skills/${name}/SKILL.md`)
console.log(`  - skills/${name}/references/.gitkeep`)
