<script setup lang="ts">
const route = useRoute()
const { fetchMcp } = useMarketplace()
const { data: mcp, error } = fetchMcp(route.params.id as string)
const toast = useToast()

async function copyConfig() {
  if (!mcp.value) return
  await navigator.clipboard.writeText(JSON.stringify({ mcpServers: { [mcp.value.id]: mcp.value.config } }, null, 2))
  toast.add({ title: '已复制到剪贴板', color: 'success' })
}
</script>

<template>
  <UContainer class="py-10 max-w-4xl">
    <UButton to="/mcps" variant="link" color="neutral" size="sm" icon="i-lucide-arrow-left" class="mb-6">
      返回列表
    </UButton>

    <div v-if="error" class="text-center py-20">
      <UIcon name="i-lucide-alert-circle" class="size-10 text-[--color-text-tertiary] mb-3" />
      <p class="text-[--color-text-tertiary]">MCP 服务器未找到</p>
    </div>

    <div v-else-if="mcp" class="space-y-5 animate-fade-up">
      <!-- Header Card -->
      <UCard>
        <div class="flex items-start gap-4">
          <UAvatar :text="mcp.name.charAt(0).toUpperCase()" size="xl" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-xl font-bold text-[--color-text-primary]">{{ mcp.name }}</h1>
              <UBadge variant="subtle" color="neutral" size="sm">{{ mcp.category }}</UBadge>
            </div>
            <p class="text-sm text-[--color-text-tertiary]">{{ mcp.vendor }} · v{{ mcp.version }}</p>
          </div>
          <UBadge variant="soft" color="warning" size="md">
            {{ mcp.downloads }} downloads
          </UBadge>
        </div>
        <div class="mt-5">
          <MarkdownBody :content="mcp.description" />
        </div>
        <div v-if="mcp.tags.length" class="flex flex-wrap gap-2 mt-5">
          <UBadge v-for="tag in mcp.tags" :key="tag" variant="subtle" color="neutral" size="sm">{{ tag }}</UBadge>
        </div>
      </UCard>

      <!-- Install Card -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-[13px] font-semibold text-[--color-text-primary]">安装配置</h2>
            <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-copy" @click="copyConfig">
              复制
            </UButton>
          </div>
        </template>
        <pre class="p-4 rounded-lg bg-[--color-surface] text-[12px] text-emerald-400 font-mono overflow-x-auto leading-relaxed"><code>{{ JSON.stringify({ mcpServers: { [mcp.id]: mcp.config } }, null, 2) }}</code></pre>
      </UCard>

      <!-- Tools Card -->
      <UCard v-if="mcp.tools.length">
        <template #header>
          <h2 class="text-[13px] font-semibold text-[--color-text-primary]">工具 ({{ mcp.tools.length }})</h2>
        </template>
        <div class="space-y-2">
          <div v-for="tool in mcp.tools" :key="tool.name" class="p-3 rounded-lg bg-[--color-surface]">
            <p class="text-[12px] font-semibold font-mono text-[--color-text-primary]">{{ tool.name }}</p>
            <p class="text-[11px] text-[--color-text-tertiary] mt-0.5">{{ tool.description }}</p>
          </div>
        </div>
      </UCard>

      <!-- Meta Card -->
      <UCard>
        <template #header>
          <h2 class="text-[13px] font-semibold text-[--color-text-primary]">详情</h2>
        </template>
        <dl class="grid grid-cols-2 gap-4 text-[12px]">
          <div><dt class="text-[--color-text-tertiary]">运行时</dt><dd class="text-[--color-text-primary] mt-0.5">{{ mcp.runtime }}</dd></div>
          <div v-if="mcp.npmPackage"><dt class="text-[--color-text-tertiary]">npm 包</dt><dd class="text-[--color-text-primary] mt-0.5 font-mono">{{ mcp.npmPackage }}</dd></div>
          <div v-if="mcp.sourceUrl"><dt class="text-[--color-text-tertiary]">源码</dt><dd class="mt-0.5"><UButton :to="mcp.sourceUrl" target="_blank" variant="link" size="xs" trailing-icon="i-lucide-external-link">GitHub</UButton></dd></div>
          <div><dt class="text-[--color-text-tertiary]">更新时间</dt><dd class="text-[--color-text-primary] mt-0.5">{{ new Date(mcp.updatedAt).toLocaleDateString('zh-CN') }}</dd></div>
        </dl>
      </UCard>
    </div>
  </UContainer>
</template>
