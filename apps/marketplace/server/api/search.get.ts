import type { SearchQuery } from '~/types'
import { filterMcps, filterSkills, getAllMcps, getAllSkills } from '~~/server/utils/data'

export default defineEventHandler((event) => {
  const query = getQuery<SearchQuery>(event)
  if (!query.q)
    throw createError({ statusCode: 400, statusMessage: 'Missing search query (q)' })

  const skills = filterSkills(getAllSkills(), query).slice(0, 10)
  const mcps = filterMcps(getAllMcps(), query).slice(0, 10)

  return { skills, mcps }
})
