import type { SearchQuery } from '~/types'
import { fetchAllSkills, filterSkills, paginate } from '~~/server/utils/data'

export default defineEventHandler(async (event) => {
  const query = getQuery<SearchQuery>(event)
  const skills = await fetchAllSkills()
  const filtered = filterSkills(skills, query)
  return paginate(filtered, query)
})
