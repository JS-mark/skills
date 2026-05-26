export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Missing id parameter' })

  const sources = await getSourcesList()
  const index = sources.findIndex(s => s.id === id)

  if (index === -1)
    throw createError({ statusCode: 404, statusMessage: 'Source not found' })

  sources.splice(index, 1)
  await saveSourcesList(sources)

  return { success: true }
})
