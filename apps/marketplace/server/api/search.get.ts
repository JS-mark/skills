import type { SearchQuery } from '~/types'
import { fetchAllMcps, fetchAllSkills, filterMcps, filterSkills } from '~~/server/utils/data'

export default defineEventHandler(async (event) => {
  const query = getQuery<SearchQuery>(event)
  if (!query.q)
    throw createError({ statusCode: 400, statusMessage: 'Missing search query (q)' })

  const [allSkills, allMcps] = await Promise.all([fetchAllSkills(), fetchAllMcps()])
  const skills = filterSkills(allSkills, query).slice(0, 10)
  const mcps = filterMcps(allMcps, query).slice(0, 10)

  return { skills, mcps }
})
