export default defineEventHandler(async () => {
  const sources = await getSourcesList()

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
