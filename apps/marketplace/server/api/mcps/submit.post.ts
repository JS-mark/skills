import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { McpServer } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<McpServer>>(event)

  if (!body.name || !body.description || !body.vendor)
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields: name, description, vendor' })

  const id = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const mcp: McpServer = {
    id,
    name: body.name,
    description: body.description,
    version: body.version || '0.1.0',
    vendor: body.vendor,
    license: body.license,
    sourceUrl: body.sourceUrl,
    homepage: body.homepage,
    tags: body.tags || [],
    category: body.category || 'other',
    runtime: body.runtime || 'node',
    source: 'local',
    npmPackage: body.npmPackage,
    tools: body.tools || [],
    resources: body.resources || [],
    prompts: body.prompts || [],
    config: body.config || { command: 'npx', args: ['-y', body.npmPackage || body.name] },
    downloads: 0,
    rating: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const filePath = resolve(process.cwd(), `content/mcps/${id}.json`)
  writeFileSync(filePath, JSON.stringify(mcp, null, 2))

  return mcp
})
