import type { SearchQuery } from '~/types'
import { fetchAllMcps, filterMcps, paginate } from '~~/server/utils/data'

export default defineEventHandler(async (event) => {
  const query = getQuery<SearchQuery>(event)
  const mcps = await fetchAllMcps()
  const filtered = filterMcps(mcps, query)
  return paginate(filtered, query)
})
