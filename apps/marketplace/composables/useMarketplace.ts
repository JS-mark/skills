import type { McpServer, PaginatedResponse, SearchQuery, Skill } from '~/types'

export function useMarketplace() {
  function fetchSkills(query: MaybeRefOrGetter<SearchQuery> = {}) {
    return useFetch<PaginatedResponse<Skill>>('/api/skills', { query })
  }

  function fetchSkill(id: string) {
    return useFetch<Skill>(`/api/skills/${id}`)
  }

  function fetchMcps(query: MaybeRefOrGetter<SearchQuery> = {}) {
    return useFetch<PaginatedResponse<McpServer>>('/api/mcps', { query })
  }

  function fetchMcp(id: string) {
    return useFetch<McpServer>(`/api/mcps/${id}`)
  }

  function search(q: string) {
    return useFetch<{ skills: Skill[], mcps: McpServer[] }>('/api/search', { query: { q } })
  }

  return { fetchSkills, fetchSkill, fetchMcps, fetchMcp, search }
}
