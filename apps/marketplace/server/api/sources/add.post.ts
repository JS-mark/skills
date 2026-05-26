import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { MarketSource } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<Omit<MarketSource, 'id' | 'lastSynced' | 'itemCount' | 'status'>>(event)

  if (!body.name || !body.url || !body.type)
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields: name, url, type' })

  if (body.type === 'git' && !body.discovery)
    throw createError({ statusCode: 400, statusMessage: 'Git sources require discovery patterns' })

  const sourcesFile = resolve(process.cwd(), 'content/sources.json')
  const sources: MarketSource[] = JSON.parse(readFileSync(sourcesFile, 'utf-8'))

  const newSource: MarketSource = {
    id: body.name.toLowerCase().replace(/\s+/g, '-'),
    type: body.type,
    name: body.name,
    url: body.url,
    branch: body.branch,
    discovery: body.discovery,
    lastSynced: undefined,
    itemCount: 0,
    status: 'active',
  }

  if (sources.find(s => s.id === newSource.id))
    throw createError({ statusCode: 409, statusMessage: 'Source with this name already exists' })

  sources.push(newSource)
  writeFileSync(sourcesFile, JSON.stringify(sources, null, 2))

  return newSource
})
