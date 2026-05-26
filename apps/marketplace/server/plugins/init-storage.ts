import type { MarketSource } from '~~/types'

const DEFAULT_SOURCES: MarketSource[] = [
  {
    id: 'local',
    type: 'git',
    name: 'Official Skills',
    url: 'https://github.com/JS-mark/skills',
    branch: 'main',
    discovery: { skills: 'skills/*/SKILL.md', mcps: 'packages/*/package.json' },
    itemCount: 0,
    status: 'active',
  },
  {
    id: 'mcp-official',
    type: 'git',
    name: 'MCP Official Servers',
    url: 'https://github.com/modelcontextprotocol/servers',
    branch: 'main',
    discovery: { mcps: 'src/*/package.json' },
    itemCount: 0,
    status: 'active',
  },
  {
    id: 'awesome-mcp-servers',
    type: 'git',
    name: 'Awesome MCP Servers',
    url: 'https://github.com/punkpeye/awesome-mcp-servers',
    branch: 'main',
    discovery: { mcps: 'README.md' },
    itemCount: 0,
    status: 'active',
  },
  {
    id: 'awesome-design-skills',
    type: 'git',
    name: 'Awesome Design Skills',
    url: 'https://github.com/bergside/awesome-design-skills',
    branch: 'main',
    discovery: { skills: 'skills/*/SKILL.md' },
    itemCount: 0,
    status: 'active',
  },
]

export default defineNitroPlugin(async () => {
  const storage = useStorage('data')
  const existing = await storage.getItem('sources:index')
  if (!existing) {
    await storage.setItem('sources:index', DEFAULT_SOURCES)
  }
})
