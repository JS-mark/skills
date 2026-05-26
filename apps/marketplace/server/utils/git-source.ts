import type { McpServer, Skill } from '~/types'

interface GitHubContent {
  name: string
  path: string
  type: 'file' | 'dir'
  download_url?: string
}

export function parseGitHubUrl(url: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (!match)
    throw new Error(`Invalid GitHub URL: ${url}`)
  return { owner: match[1], repo: match[2] }
}

/**
 * Discover skills from a Git repo by scanning SKILL.md files
 */
export async function fetchGitSkills(
  repoUrl: string,
  branch: string,
  pattern: string,
  sourceId: string,
): Promise<Skill[]> {
  const { owner, repo } = parseGitHubUrl(repoUrl)
  const basePath = pattern.split('/*')[0]

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${basePath}?ref=${branch}`,
    { headers: githubHeaders() },
  )
  if (!response.ok)
    return []

  const dirs: GitHubContent[] = await response.json()
  const skills: Skill[] = []

  for (const dir of dirs.filter(d => d.type === 'dir')) {
    const fileResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${dir.path}/SKILL.md?ref=${branch}`,
      { headers: githubHeaders() },
    )
    if (!fileResponse.ok)
      continue

    const file: GitHubContent = await fileResponse.json()
    if (!file.download_url)
      continue

    const content = await fetch(file.download_url).then(r => r.text())
    const meta = parseSkillMdFrontmatter(content, dir.name)
    if (meta) {
      skills.push({
        ...meta,
        id: `${sourceId}--${dir.name}`,
        source: 'git',
        sourceId,
        repository: `${repoUrl}/tree/${branch}/${dir.path}`,
        installCommand: `claude install-skill ${repoUrl}/tree/${branch}/${dir.path}`,
        downloads: 0,
        rating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
  }

  return skills
}

/**
 * Discover MCP servers from a Git repo by scanning package.json files
 */
export async function fetchGitMcps(
  repoUrl: string,
  branch: string,
  pattern: string,
  sourceId: string,
): Promise<McpServer[]> {
  const { owner, repo } = parseGitHubUrl(repoUrl)
  const basePath = pattern.split('/*')[0]

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${basePath}?ref=${branch}`,
    { headers: githubHeaders() },
  )
  if (!response.ok)
    return []

  const dirs: GitHubContent[] = await response.json()
  const mcps: McpServer[] = []

  for (const dir of dirs.filter(d => d.type === 'dir')) {
    const fileResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${dir.path}/package.json?ref=${branch}`,
      { headers: githubHeaders() },
    )
    if (!fileResponse.ok)
      continue

    const file: GitHubContent = await fileResponse.json()
    if (!file.download_url)
      continue

    const content = await fetch(file.download_url).then(r => r.text())
    const pkg = JSON.parse(content)

    if (pkg.keywords?.includes('mcp') || pkg.name?.includes('mcp') || pkg.description?.toLowerCase().includes('mcp')) {
      mcps.push({
        id: `${sourceId}--${dir.name}`,
        name: pkg.name || dir.name,
        description: pkg.description || '',
        version: pkg.version || '0.0.0',
        vendor: typeof pkg.author === 'string' ? pkg.author : pkg.author?.name || '',
        license: pkg.license,
        sourceUrl: `${repoUrl}/tree/${branch}/${dir.path}`,
        tags: pkg.keywords || [],
        category: 'other',
        runtime: 'node',
        source: 'git',
        sourceId,
        npmPackage: pkg.name,
        tools: [],
        resources: [],
        prompts: [],
        config: {
          command: 'npx',
          args: ['-y', pkg.name],
        },
        downloads: 0,
        rating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
  }

  return mcps
}

/**
 * Parse SKILL.md frontmatter (YAML between --- delimiters)
 */
function parseSkillMdFrontmatter(content: string, fallbackName: string): Partial<Skill> | null {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch)
    return null

  const fm = frontmatterMatch[1]
  const name = fm.match(/name:\s*(.+)/)?.[1]?.trim() || fallbackName
  const description = fm.match(/description:\s*[|>]?\s*\n?\s*(.+)/)?.[1]?.trim()
    || fm.match(/description:\s*(.+)/)?.[1]?.trim() || ''
  const version = fm.match(/version:\s*(.+)/)?.[1]?.trim() || '0.1.0'
  const author = fm.match(/author:\s*(.+)/)?.[1]?.trim() || ''

  const tagsMatch = fm.match(/tags:\s*\[([^\]]*)\]/)
  const tags = tagsMatch
    ? tagsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, '')).filter(Boolean)
    : []

  const allowedToolsMatch = fm.match(/allowed-tools:\s*(.+)/)
  const allowedTools = allowedToolsMatch
    ? allowedToolsMatch[1].split(',').map(t => t.trim()).filter(Boolean)
    : undefined

  return { name, description, version, author, tags, category: 'other', allowedTools }
}

export function githubHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = { 'Accept': 'application/vnd.github.v3+json' }
  if (token)
    headers.Authorization = `Bearer ${token}`
  return headers
}
