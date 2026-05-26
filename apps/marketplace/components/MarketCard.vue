<script setup lang="ts">
import type { McpServer, Skill } from '~/types'

const props = defineProps<{
  item: Skill | McpServer
  type: 'skill' | 'mcp'
  index?: number
}>()

const isMcp = computed(() => props.type === 'mcp')
const detailUrl = computed(() => isMcp.value ? `/mcps/${props.item.id}` : `/skills/${props.item.id}`)
const authorName = computed(() => isMcp.value ? (props.item as McpServer).vendor : (props.item as Skill).author)
const displayDownloads = computed(() => {
  const d = props.item.downloads
  if (d >= 1000) return `${(d / 1000).toFixed(1)}k`
  return String(d)
})
const plainDescription = computed(() => {
  return (props.item.description || '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1')
    .replace(/[#*`~>_\-|]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
})
</script>

<template>
  <NuxtLink :to="detailUrl" class="animate-fade-up" :class="[`stagger-${(index || 0) % 6 + 1}`]">
    <UCard class="h-full transition-all duration-200 hover:border-[--color-border-hover] hover:shadow-[0_0_16px_var(--color-glow)]">
      <div class="flex items-start gap-3 mb-3">
        <UAvatar :text="item.name.charAt(0).toUpperCase()" size="sm" />
        <div class="min-w-0 flex-1">
          <p class="text-[13px] font-semibold text-[--color-text-primary] truncate">{{ item.name }}</p>
          <p class="text-[11px] text-[--color-text-tertiary] mt-0.5">{{ authorName }}</p>
        </div>
      </div>
      <p class="text-[12px] text-[--color-text-secondary] leading-[1.7] line-clamp-2 mb-4">
        {{ plainDescription }}
      </p>
      <USeparator />
      <div class="flex items-center justify-between pt-3">
        <UBadge variant="subtle" color="neutral" size="sm">
          {{ item.category }}
        </UBadge>
        <div class="flex items-center gap-1">
          <UIcon name="i-lucide-star" class="text-yellow-400 size-3" />
          <span class="text-[11px] text-[--color-text-tertiary] tabular-nums">{{ displayDownloads }}</span>
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>
