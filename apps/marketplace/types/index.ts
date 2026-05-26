/**
 * Skill format — follows SKILL.md frontmatter convention
 * (name, description, version, author, tags, allowed-tools)
 */
export interface Skill {
  id: string
  name: string
  description: string
  version: string
  author: string
  tags: string[]
  category: SkillCategory
  allowedTools?: string[]
  triggers?: string[]
  source: SourceType
  sourceId?: string
  repository?: string
  installCommand: string
  readme?: string
  downloads: number
  rating: number
  createdAt: string
  updatedAt: string
}

/**
 * MCP Server format — compatible with Smithery/mcp.so ecosystem
 */
export interface McpServer {
  id: string
  name: string
  description: string
  version: string
  vendor: string
  license?: string
  sourceUrl?: string
  homepage?: string
  tags: string[]
  category: McpCategory
  runtime: McpRuntime
  source: SourceType
  sourceId?: string
  npmPackage?: string
  pypiPackage?: string
  tools: McpTool[]
  resources?: McpResource[]
  prompts?: McpPrompt[]
  config: McpConfig
  downloads: number
  rating: number
  createdAt: string
  updatedAt: string
}

export interface McpTool {
  name: string
  description: string
  inputSchema?: Record<string, unknown>
}

export interface McpResource {
  uri: string
  name: string
  description?: string
}

export interface McpPrompt {
  name: string
  description?: string
  arguments?: { name: string, description?: string, required?: boolean }[]
}

export interface McpConfig {
  command: string
  args: string[]
  env?: Record<string, string>
}

export type McpRuntime = 'node' | 'python' | 'docker' | 'binary'

/**
 * Market source — for importing external skill/MCP registries
 */
export interface MarketSource {
  id: string
  type: 'registry' | 'git'
  name: string
  url: string
  branch?: string
  discovery?: {
    skills?: string
    mcps?: string
  }
  format?: 'smithery' | 'mcp-so' | 'skill-md' | 'custom'
  lastSynced?: string
  itemCount: number
  status: 'active' | 'error' | 'syncing'
}

/**
 * Smithery registry format (smithery.yaml)
 */
export interface SmitheryConfig {
  startCommand: {
    type: 'stdio' | 'sse'
    configSchema?: Record<string, unknown>
    commandFunction?: string
  }
}

/**
 * mcp.so / generic MCP registry item format
 */
export interface McpRegistryItem {
  name: string
  description: string
  vendor?: string
  sourceUrl?: string
  homepage?: string
  license?: string
  runtime?: McpRuntime
  tools?: McpTool[]
  resources?: McpResource[]
  prompts?: McpPrompt[]
  config?: McpConfig
  tags?: string[]
  category?: string
}

/**
 * Skill registry item format (parsed from SKILL.md frontmatter)
 */
export interface SkillRegistryItem {
  name: string
  description: string
  version: string
  author: string
  tags: string[]
  'allowed-tools'?: string[]
}

export type SourceType = 'local' | 'registry' | 'git'

export type SkillCategory =
  | 'development'
  | 'writing'
  | 'design'
  | 'automation'
  | 'data'
  | 'devops'
  | 'testing'
  | 'other'

export type McpCategory =
  | 'filesystem'
  | 'database'
  | 'api'
  | 'browser'
  | 'ai'
  | 'devtools'
  | 'communication'
  | 'other'

export interface SearchQuery {
  q?: string
  category?: string
  tags?: string[]
  source?: SourceType
  page?: number
  limit?: number
  sort?: 'downloads' | 'rating' | 'newest' | 'name'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
