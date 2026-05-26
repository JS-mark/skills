<script setup lang="ts">
const { fetchSkills, fetchMcps } = useMarketplace()
const router = useRouter()

const searchQuery = ref('')
const { data: skillsData } = fetchSkills({ sort: 'downloads', limit: 6 })
const { data: mcpsData } = fetchMcps({ sort: 'downloads', limit: 6 })

function onSearch() {
  if (searchQuery.value.trim())
    router.push({ path: '/mcps', query: { q: searchQuery.value } })
}

const categories = [
  { label: '全部', active: true },
  { label: '开发者工具', active: false },
  { label: 'API 开发', active: false },
  { label: '数据科学', active: false },
  { label: '浏览器自动化', active: false },
  { label: '设计工具', active: false },
  { label: '生产力', active: false },
  { label: 'DevOps', active: false },
  { label: '安全与测试', active: false },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <!-- Grid background -->
      <div class="absolute inset-0 bg-[image:linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] pointer-events-none" />
      <!-- Glow effect -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,var(--color-glow)_0%,transparent_70%)] pointer-events-none" />

      <div class="relative max-w-[1140px] mx-auto px-5 pt-20 pb-14 text-center">
        <!-- Stats pill -->
        <div class="animate-fade-up inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-[--color-surface-2] border border-[--color-border] text-[12px] text-[--color-text-secondary]">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" style="animation: pulse-dot 2s infinite" />
          <span class="font-medium">{{ (skillsData?.total || 0) + (mcpsData?.total || 0) }} 个项目</span>
          <span class="text-[--color-text-tertiary]">·</span>
          <span class="text-[--color-text-tertiary]">持续更新</span>
        </div>

        <!-- Title -->
        <h1 class="animate-fade-up stagger-1 text-[clamp(28px,4.5vw,44px)] font-bold text-[--color-text-primary] leading-[1.15] tracking-tight mb-4">
          发现最佳
          <span class="text-[--color-accent]">AI 开发工具</span>
        </h1>

        <p class="animate-fade-up stagger-2 text-[15px] text-[--color-text-secondary] max-w-[420px] mx-auto mb-8 leading-relaxed">
          一站式聚合 Skills、MCP 服务器与开发者工具，为你的 AI Agent 锻造超能力。
        </p>

        <!-- Search -->
        <div class="animate-fade-up stagger-3 flex justify-center mb-8">
          <SearchBar v-model="searchQuery" placeholder="搜索服务器、技能、工具..." @search="onSearch" />
        </div>

        <!-- Category pills -->
        <div class="animate-fade-up stagger-4 flex items-center justify-center gap-2 flex-wrap">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.label"
            to="/mcps"
            class="inline-flex items-center px-3.5 py-[7px] rounded-lg text-[12px] font-medium transition-all duration-200 border"
            :style="cat.active
              ? { background: 'var(--color-accent)', color: 'white', borderColor: 'var(--color-accent)', boxShadow: '0 0 12px var(--color-glow)' }
              : { background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }"
          >
            {{ cat.label }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- MCP Servers -->
    <section class="max-w-[1140px] mx-auto px-5 pt-14 pb-10">
      <div class="flex items-center justify-between mb-7">
        <div class="flex items-center gap-3">
          <div class="w-1 h-5 rounded-full bg-[--color-accent]" />
          <h2 class="text-[15px] font-semibold text-[--color-text-primary]">
            热门 MCP 服务器
          </h2>
          <span class="text-[12px] text-[--color-text-tertiary] font-medium">MCP Servers</span>
        </div>
        <NuxtLink to="/mcps" class="text-[12px] font-medium text-[--color-text-tertiary] hover:text-[--color-accent] transition-colors flex items-center gap-1">
          查看全部
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 2l4 4-4 4" /></svg>
        </NuxtLink>
      </div>
      <div v-if="mcpsData?.items" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MarketCard v-for="(mcp, i) in mcpsData.items" :key="mcp.id" :item="mcp" type="mcp" :index="i" />
      </div>
    </section>

    <!-- Spacer -->
    <div class="h-4" />

    <!-- Skills -->
    <section class="max-w-[1140px] mx-auto px-5 pt-10 pb-16">
      <div class="flex items-center justify-between mb-7">
        <div class="flex items-center gap-3">
          <div class="w-1 h-5 rounded-full bg-emerald-400" />
          <h2 class="text-[15px] font-semibold text-[--color-text-primary]">
            热门 Agent Skills
          </h2>
          <span class="text-[12px] text-[--color-text-tertiary] font-medium">Skills</span>
        </div>
        <NuxtLink to="/skills" class="text-[12px] font-medium text-[--color-text-tertiary] hover:text-[--color-accent] transition-colors flex items-center gap-1">
          查看全部
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 2l4 4-4 4" /></svg>
        </NuxtLink>
      </div>
      <div v-if="skillsData?.items" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MarketCard v-for="(skill, i) in skillsData.items" :key="skill.id" :item="skill" type="skill" :index="i" />
      </div>
    </section>
  </div>
</template>
