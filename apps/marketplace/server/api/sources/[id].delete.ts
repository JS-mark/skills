import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { MarketSource } from '~/types'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Missing id parameter' })

  const sourcesFile = resolve(process.cwd(), 'content/sources.json')
  const sources: MarketSource[] = JSON.parse(readFileSync(sourcesFile, 'utf-8'))
  const index = sources.findIndex(s => s.id === id)

  if (index === -1)
    throw createError({ statusCode: 404, statusMessage: 'Source not found' })

  sources.splice(index, 1)
  writeFileSync(sourcesFile, JSON.stringify(sources, null, 2))

  return { success: true }
})
