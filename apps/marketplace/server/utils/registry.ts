import type { McpRegistryItem, McpServer, Skill, SkillRegistryItem } from '~/types'

/**
 * Fetch a registry that returns MCP servers in mcp.so-compatible format
 */
export async function fetchMcpRegistry(url: string): Promise<McpRegistryItem[]> {
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  })
  if (!response.ok)
    throw new Error(`Registry fetch failed: ${response.status} ${response.statusText}`)

  const data = await response.json()
  return Array.isArray(data) ? data : data.items || data.servers || []
}

/**
 * Fetch a registry that returns skills
 */
export async function fetchSkillRegistry(url: string): Promise<SkillRegistryItem[]> {
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  })
  if (!response.ok)
    throw new Error(`Registry fetch failed: ${response.status} ${response.statusText}`)

  const data = await response.json()
  return Array.isArray(data) ? data : data.items || data.skills || []
}

export function mcpRegistryItemToMcpServer(item: McpRegistryItem, sourceId: string): McpServer {
  const id = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return {
    id: `${sourceId}--${id}`,
    name: item.name,
    description: item.description,
    version: '0.0.0',
    vendor: item.vendor || '',
    license: item.license,
    sourceUrl: item.sourceUrl,
    homepage: item.homepage,
    tags: item.tags || [],
    category: (item.category as McpServer['category']) || 'other',
    runtime: item.runtime || 'node',
    source: 'registry',
    sourceId,
    tools: item.tools || [],
    resources: item.resources || [],
    prompts: item.prompts || [],
    config: item.config || { command: 'npx', args: ['-y', item.name] },
    downloads: 0,
    rating: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function skillRegistryItemToSkill(item: SkillRegistryItem, sourceId: string): Skill {
  const id = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return {
    id: `${sourceId}--${id}`,
    name: item.name,
    description: item.description,
    version: item.version || '0.1.0',
    author: item.author || '',
    tags: item.tags || [],
    category: 'other',
    allowedTools: item['allowed-tools'],
    source: 'registry',
    sourceId,
    installCommand: `claude install-skill ${item.name}`,
    downloads: 0,
    rating: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}
