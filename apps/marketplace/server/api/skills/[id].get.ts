import { getSkillById } from '~~/server/utils/data'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Missing id parameter' })

  const skill = getSkillById(id)
  if (!skill)
    throw createError({ statusCode: 404, statusMessage: 'Skill not found' })

  return skill
})
