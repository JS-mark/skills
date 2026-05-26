import type { McpCategory, McpServer } from '~/types'
import { parseGitHubUrl } from './git-source'

const CATEGORY_MAP: Record<string, McpCategory> = {
  'browser': 'browser',
  'web': 'browser',
  'database': 'database',
  'db': 'database',
  'sql': 'database',
  'file': 'filesystem',
  'filesystem': 'filesystem',
  'api': 'api',
  'cloud': 'api',
  'ai': 'ai',
  'llm': 'ai',
  'machine learning': 'ai',
  'dev': 'devtools',
  'development': 'devtools',
  'code': 'devtools',
  'git': 'devtools',
  'communication': 'communication',
  'messaging': 'communication',
  'slack': 'communication',
  'email': 'communication',
}

function inferCategory(heading: string): McpCategory {
  const lower = heading.toLowerCase()
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(keyword))
      return category
  }
  return 'other'
}

function inferRuntime(url: string, name: string): McpServer['runtime'] {
  const lower = `${url} ${name}`.toLowerCase()
  if (lower.includes('python') || lower.includes('pypi'))
    return 'python'
  if (lower.includes('docker'))
    return 'docker'
  return 'node'
}

export async function fetchAwesomeMcpList(
  repoUrl: string,
  branch: string,
  readmePath: string,
  sourceId: string,
): Promise<McpServer[]> {
  const { owner, repo } = parseGitHubUrl(repoUrl)
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${readmePath}`

  const response = await fetch(rawUrl)
  if (!response.ok)
    return []

  const content = await response.text()
  return parseAwesomeList(content, sourceId)
}

export function parseAwesomeList(content: string, sourceId: string): McpServer[] {
  const servers: McpServer[] = []
  const lines = content.split('\n')
  let currentCategory = ''

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)/)
    if (headingMatch) {
      currentCategory = headingMatch[1]!.trim()
      continue
    }

    const itemMatch = line.match(/^[-*]\s+\[([^\]]+)\]\(([^)]+)\)(?:\s[-–—:.]\s?|\s\s)?(.*)$/)
    if (!itemMatch)
      continue

    const name = itemMatch[1]!
    const url = itemMatch[2]!
    const description = itemMatch[3] || ''

    if (!url.includes('github.com') && !url.includes('npm') && !url.includes('pypi'))
      continue

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const category = inferCategory(currentCategory)

    servers.push({
      id: `${sourceId}--${id}`,
      name,
      description: cleanDescription(description) || `${name} MCP server`,
      version: '0.0.0',
      vendor: extractVendor(url),
      sourceUrl: url,
      tags: [cleanTag(currentCategory)].filter(Boolean),
      category,
      runtime: inferRuntime(url, name),
      source: 'git',
      sourceId,
      tools: [],
      resources: [],
      prompts: [],
      config: {
        command: 'npx',
        args: ['-y', name],
      },
      downloads: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  return servers
}

function extractVendor(url: string): string {
  const match = url.match(/github\.com\/([^/]+)/)
  return match ? match[1]! : ''
}

function cleanDescription(desc: string): string {
  return desc
    .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .trim()
    .replace(/^[-–—:.\s]+/, '')
}

function cleanTag(heading: string): string {
  return heading
    .replace(/<[^>]+>/g, '')
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '')
    .trim()
    .toLowerCase()
}
