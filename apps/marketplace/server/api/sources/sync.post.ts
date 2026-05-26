import type { MarketSource } from '~/types'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fetchAwesomeMcpList } from '~~/server/utils/awesome-list'
import { fetchGitMcps, fetchGitSkills } from '~~/server/utils/git-source'
import { fetchMcpRegistry, fetchSkillRegistry, mcpRegistryItemToMcpServer, skillRegistryItemToSkill } from '~~/server/utils/registry'

export default defineEventHandler(async (event) => {
  const { sourceId } = await readBody<{ sourceId: string }>(event)
  if (!sourceId)
    throw createError({ statusCode: 400, statusMessage: 'Missing sourceId' })

  const sourcesFile = resolve(process.cwd(), 'content/sources.json')
  const sources: MarketSource[] = JSON.parse(readFileSync(sourcesFile, 'utf-8'))
  const source = sources.find(s => s.id === sourceId)

  if (!source)
    throw createError({ statusCode: 404, statusMessage: 'Source not found' })

  source.status = 'syncing'
  writeFileSync(sourcesFile, JSON.stringify(sources, null, 2))

  try {
    let skillCount = 0
    let mcpCount = 0

    if (source.type === 'registry') {
      if (source.format === 'skill-md' || source.discovery?.skills) {
        const items = await fetchSkillRegistry(source.url)
        const skills = items.map(i => skillRegistryItemToSkill(i, source.id))
        for (const skill of skills)
          writeFileSync(resolve(process.cwd(), `content/skills/${skill.id}.json`), JSON.stringify(skill, null, 2))
        skillCount = skills.length
      }
      else {
        const items = await fetchMcpRegistry(source.url)
        const mcps = items.map(i => mcpRegistryItemToMcpServer(i, source.id))
        for (const mcp of mcps)
          writeFileSync(resolve(process.cwd(), `content/mcps/${mcp.id}.json`), JSON.stringify(mcp, null, 2))
        mcpCount = mcps.length
      }
    }
    else if (source.type === 'git') {
      const branch = source.branch || 'main'

      if (source.discovery?.skills) {
        const skills = await fetchGitSkills(source.url, branch, source.discovery.skills, source.id)
        for (const skill of skills)
          writeFileSync(resolve(process.cwd(), `content/skills/${skill.id}.json`), JSON.stringify(skill, null, 2))
        skillCount = skills.length
      }

      if (source.discovery?.mcps) {
        const isAwesomeList = source.discovery.mcps.endsWith('.md')
        const mcps = isAwesomeList
          ? await fetchAwesomeMcpList(source.url, branch, source.discovery.mcps, source.id)
          : await fetchGitMcps(source.url, branch, source.discovery.mcps, source.id)
        for (const mcp of mcps)
          writeFileSync(resolve(process.cwd(), `content/mcps/${mcp.id}.json`), JSON.stringify(mcp, null, 2))
        mcpCount = mcps.length
      }
    }

    source.status = 'active'
    source.lastSynced = new Date().toISOString()
    source.itemCount = skillCount + mcpCount
    writeFileSync(sourcesFile, JSON.stringify(sources, null, 2))

    return { success: true, skills: skillCount, mcps: mcpCount }
  }
  catch (error: any) {
    source.status = 'error'
    writeFileSync(sourcesFile, JSON.stringify(sources, null, 2))
    throw createError({ statusCode: 500, statusMessage: `Sync failed: ${error.message}` })
  }
})
