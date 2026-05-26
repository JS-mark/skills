import type { SearchQuery } from '~/types'
import { filterSkills, getAllSkills, paginate } from '~~/server/utils/data'

export default defineEventHandler((event) => {
  const query = getQuery<SearchQuery>(event)
  const skills = getAllSkills()
  const filtered = filterSkills(skills, query)
  return paginate(filtered, query)
})
