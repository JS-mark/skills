<script setup lang="ts">
import type { McpCategory } from '~/types'

const route = useRoute()

const searchQuery = ref((route.query.q as string) || '')
const selectedCategory = ref('')
const currentPage = ref(1)
const sortBy = ref('downloads')

const sortOptions = [
  { label: '最多下载', value: 'downloads' },
  { label: '最高评分', value: 'rating' },
  { label: '最新发布', value: 'newest' },
  { label: '名称', value: 'name' },
]

const query = computed(() => ({
  q: searchQuery.value || undefined,
  category: selectedCategory.value || undefined,
  page: currentPage.value,
  limit: 12,
  sort: sortBy.value,
}))

const { data } = useAsyncData(
  'mcps-list',
  () => $fetch('/api/mcps', { query: query.value }),
  { watch: [query] },
)

const categories: { label: string, value: McpCategory }[] = [
  { label: '文件系统', value: 'filesystem' },
  { label: '数据库', value: 'database' },
  { label: 'API', value: 'api' },
  { label: '浏览器', value: 'browser' },
  { label: 'AI', value: 'ai' },
  { label: '开发工具', value: 'devtools' },
  { label: '通信', value: 'communication' },
  { label: '其他', value: 'other' },
]
</script>

<template>
  <UContainer class="py-10">
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-1 h-5 rounded-full bg-[--color-accent]" />
        <h1 class="text-xl font-bold text-[--color-text-primary]">MCP 服务器</h1>
      </div>
      <p class="text-[13px] text-[--color-text-tertiary] ml-[19px]">浏览和搜索 Model Context Protocol 服务器</p>
    </div>

    <div class="space-y-4 mb-8">
      <div class="flex gap-3">
        <SearchBar v-model="searchQuery" placeholder="搜索 MCP 服务器..." class="flex-1" />
        <USelect v-model="sortBy" :items="sortOptions" class="w-36" />
      </div>
      <CategoryNav v-model="selectedCategory" :categories="categories" />
    </div>

    <div v-if="data?.items?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <MarketCard v-for="(mcp, i) in data.items" :key="mcp.id" :item="mcp" type="mcp" :index="i" />
    </div>
    <div v-else class="text-center py-20">
      <UIcon name="i-lucide-search" class="size-8 text-[--color-text-tertiary] mb-3" />
      <p class="text-[13px] text-[--color-text-tertiary]">未找到匹配的 MCP 服务器</p>
    </div>

    <div v-if="data && data.totalPages > 1" class="flex justify-center mt-10">
      <UPagination v-model:page="currentPage" :total="data.total" :items-per-page="12" />
    </div>
  </UContainer>
</template>
