import type { McpServer, Skill } from '~/types'

export function useSubmit() {
  async function submitSkill(skill: Partial<Skill>) {
    return $fetch<Skill>('/api/skills/submit', {
      method: 'POST',
      body: skill,
    })
  }

  async function submitMcp(mcp: Partial<McpServer>) {
    return $fetch<McpServer>('/api/mcps/submit', {
      method: 'POST',
      body: mcp,
    })
  }

  return { submitSkill, submitMcp }
}
