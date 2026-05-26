<script setup lang="ts">
const props = defineProps<{
  type: 'skill' | 'mcp'
  name: string
  description: string
  version: string
  author: string
  tags: string[]
  category: string
}>()

const isMcp = computed(() => props.type === 'mcp')
</script>

<template>
  <div class="card p-5">
    <p class="text-xs text-gray-500 uppercase tracking-wide mb-3 font-medium">
      预览效果
    </p>
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2">
        <span
          class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
          :class="isMcp ? 'bg-emerald-500' : 'bg-primary'"
        >
          {{ (name || 'S').charAt(0).toUpperCase() }}
        </span>
        <div>
          <h3 class="font-semibold text-sm">
            {{ name || '未命名' }}
          </h3>
          <p class="text-xs text-gray-500">
            {{ author || '作者' }} · v{{ version || '0.1.0' }}
          </p>
        </div>
      </div>
      <span
        class="text-xs px-2 py-0.5 rounded-full"
        :class="isMcp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'"
      >
        {{ isMcp ? 'MCP' : 'Skill' }}
      </span>
    </div>

    <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
      {{ description || '暂无描述' }}
    </p>

    <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
      <span class="flex items-center gap-1">
        <span class="i-carbon-download" />
        0
      </span>
      <span class="flex items-center gap-1">
        <span class="i-carbon-star-filled text-amber-400" />
        0.0
      </span>
    </div>

    <div v-if="tags.length" class="flex flex-wrap gap-1">
      <span
        v-for="tag in tags.slice(0, 4)"
        :key="tag"
        class="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
      >
        {{ tag }}
      </span>
      <span v-if="tags.length > 4" class="text-xs text-gray-400">
        +{{ tags.length - 4 }}
      </span>
    </div>
  </div>
</template>
