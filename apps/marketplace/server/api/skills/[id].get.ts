export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Missing id parameter' })

  const skill = await getSkillById(id)
  if (!skill)
    throw createError({ statusCode: 404, statusMessage: 'Skill not found' })

  return skill
})
