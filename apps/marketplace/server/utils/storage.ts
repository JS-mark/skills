import type { MarketSource, McpServer, Skill } from '~/types'

const SOURCES_KEY = 'sources:index'

function store() {
  return useStorage('data')
}

export async function getSourcesList(): Promise<MarketSource[]> {
  const data = await store().getItem<MarketSource[]>(SOURCES_KEY)
  return data || []
}

export async function saveSourcesList(sources: MarketSource[]): Promise<void> {
  await store().setItem(SOURCES_KEY, sources)
}

export async function getAllSkills(): Promise<Skill[]> {
  const keys = await store().getKeys('skills')
  const items = await Promise.all(keys.map(k => store().getItem<Skill>(k)))
  return items.filter(Boolean) as Skill[]
}

export async function getSkillById(id: string): Promise<Skill | null> {
  return await store().getItem<Skill>(`skills:${id}`) || null
}

export async function saveSkill(skill: Skill): Promise<void> {
  await store().setItem(`skills:${skill.id}`, skill)
}

export async function getAllMcps(): Promise<McpServer[]> {
  const keys = await store().getKeys('mcps')
  const items = await Promise.all(keys.map(k => store().getItem<McpServer>(k)))
  return items.filter(Boolean) as McpServer[]
}

export async function getMcpById(id: string): Promise<McpServer | null> {
  return await store().getItem<McpServer>(`mcps:${id}`) || null
}

export async function saveMcp(mcp: McpServer): Promise<void> {
  await store().setItem(`mcps:${mcp.id}`, mcp)
}

export async function deleteItem(type: 'skills' | 'mcps', id: string): Promise<void> {
  await store().removeItem(`${type}:${id}`)
}
