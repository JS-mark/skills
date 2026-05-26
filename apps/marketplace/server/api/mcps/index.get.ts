import type { SearchQuery } from '~/types'
import { filterMcps, getAllMcps, paginate } from '~~/server/utils/data'

export default defineEventHandler((event) => {
  const query = getQuery<SearchQuery>(event)
  const mcps = getAllMcps()
  const filtered = filterMcps(mcps, query)
  return paginate(filtered, query)
})
