export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Missing id parameter' })

  const mcp = await getMcpById(id)
  if (!mcp)
    throw createError({ statusCode: 404, statusMessage: 'MCP server not found' })

  return mcp
})
