import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { MarketSource } from '~/types'

export default defineEventHandler(async () => {
  const sourcesFile = resolve(process.cwd(), 'content/sources.json')
  const sources: MarketSource[] = JSON.parse(readFileSync(sourcesFile, 'utf-8'))

  const results = []
  for (const source of sources.filter(s => s.status !== 'syncing')) {
    try {
      await $fetch('/api/sources/sync', {
        method: 'POST',
        body: { sourceId: source.id },
      })
      results.push({ id: source.id, status: 'ok' })
    }
    catch (e: any) {
      results.push({ id: source.id, status: 'error', message: e.message })
    }
  }

  return { synced: results.length, results }
})
