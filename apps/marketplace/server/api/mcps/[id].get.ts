import { getMcpById } from '~~/server/utils/data'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Missing id parameter' })

  const mcp = getMcpById(id)
  if (!mcp)
    throw createError({ statusCode: 404, statusMessage: 'MCP server not found' })

  return mcp
})
