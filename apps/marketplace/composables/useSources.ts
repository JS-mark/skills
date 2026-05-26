import type { MarketSource } from '~/types'

export function useSources() {
  function fetchSources() {
    return useFetch<MarketSource[]>('/api/sources')
  }

  async function addSource(source: Partial<MarketSource>) {
    return $fetch<MarketSource>('/api/sources/add', {
      method: 'POST',
      body: source,
    })
  }

  async function syncSource(sourceId: string) {
    return $fetch<{ success: boolean, skills: number, mcps: number }>('/api/sources/sync', {
      method: 'POST',
      body: { sourceId },
    })
  }

  async function deleteSource(id: string) {
    return $fetch<{ success: boolean }>(`/api/sources/${id}`, {
      method: 'DELETE',
    })
  }

  return { fetchSources, addSource, syncSource, deleteSource }
}
