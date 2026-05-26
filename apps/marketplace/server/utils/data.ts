import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { MarketSource, McpServer, PaginatedResponse, SearchQuery, Skill } from '~/types'

const contentDir = resolve(process.cwd(), 'content')

function readJsonDir<T>(subdir: string): T[] {
  const dir = join(contentDir, subdir)
  if (!existsSync(dir))
    return []
  return readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(readFileSync(join(dir, f), 'utf-8')) as T)
}

function deduplicateByName<T extends { name: string, downloads: number }>(items: T[]): T[] {
  const map = new Map<string, T>()
  for (const item of items) {
    const existing = map.get(item.name)
    if (!existing || item.downloads > existing.downloads)
      map.set(item.name, item)
  }
  return [...map.values()]
}

export function getAllSkills(): Skill[] {
  const all = readJsonDir<Skill>('skills')
  return deduplicateByName(all)
}

export function getAllMcps(): McpServer[] {
  const all = readJsonDir<McpServer>('mcps')
  return deduplicateByName(all)
}

export function getSkillById(id: string): Skill | undefined {
  return getAllSkills().find(s => s.id === id)
}

export function getMcpById(id: string): McpServer | undefined {
  return getAllMcps().find(m => m.id === id)
}

export function getSources(): MarketSource[] {
  const file = join(contentDir, 'sources.json')
  if (!existsSync(file))
    return []
  return JSON.parse(readFileSync(file, 'utf-8'))
}

export function paginate<T>(items: T[], query: SearchQuery): PaginatedResponse<T> {
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 20
  const start = (page - 1) * limit
  return {
    items: items.slice(start, start + limit),
    total: items.length,
    page,
    limit,
    totalPages: Math.ceil(items.length / limit),
  }
}

export function filterSkills(items: Skill[], query: SearchQuery): Skill[] {
  let filtered = [...items]

  if (query.q) {
    const q = query.q.toLowerCase()
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(q)
      || item.description.toLowerCase().includes(q)
      || item.tags.some(t => t.toLowerCase().includes(q))
      || item.triggers?.some(t => t.toLowerCase().includes(q)),
    )
  }

  if (query.category)
    filtered = filtered.filter(item => item.category === query.category)

  if (query.tags?.length)
    filtered = filtered.filter(item => query.tags!.some(t => item.tags.includes(t)))

  if (query.source)
    filtered = filtered.filter(item => item.source === query.source)

  return sortItems(filtered, query.sort)
}

export function filterMcps(items: McpServer[], query: SearchQuery): McpServer[] {
  let filtered = [...items]

  if (query.q) {
    const q = query.q.toLowerCase()
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(q)
      || item.description.toLowerCase().includes(q)
      || item.tags.some(t => t.toLowerCase().includes(q))
      || item.tools.some(t => t.name.toLowerCase().includes(q)),
    )
  }

  if (query.category)
    filtered = filtered.filter(item => item.category === query.category)

  if (query.tags?.length)
    filtered = filtered.filter(item => query.tags!.some(t => item.tags.includes(t)))

  if (query.source)
    filtered = filtered.filter(item => item.source === query.source)

  return sortItems(filtered, query.sort)
}

function sortItems<T extends { downloads: number, rating: number, createdAt: string, name: string }>(
  items: T[],
  sort?: string,
): T[] {
  switch (sort) {
    case 'downloads':
      return items.sort((a, b) => b.downloads - a.downloads)
    case 'rating':
      return items.sort((a, b) => b.rating - a.rating)
    case 'newest':
      return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'name':
      return items.sort((a, b) => a.name.localeCompare(b.name))
    default:
      return items.sort((a, b) => b.downloads - a.downloads)
  }
}
