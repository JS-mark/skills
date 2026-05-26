import type { Skill } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<Skill>>(event)

  if (!body.name || !body.description || !body.author)
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields: name, description, author' })

  const id = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const skill: Skill = {
    id,
    name: body.name,
    description: body.description,
    version: body.version || '0.1.0',
    author: body.author,
    tags: body.tags || [],
    category: body.category || 'other',
    source: 'local',
    repository: body.repository,
    installCommand: body.installCommand || `claude skill add ${id}`,
    readme: body.readme,
    downloads: 0,
    rating: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await saveSkill(skill)
  return skill
})
