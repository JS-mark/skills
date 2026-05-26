<script setup lang="ts">
import type { MarketSource } from '~/types'

const { fetchSources, addSource, syncSource, deleteSource } = useSources()
const { data: sources, refresh } = fetchSources()
const toast = useToast()

const showModal = ref(false)
const syncing = ref<string | null>(null)

const sourceTypeOptions = [
  { label: 'Registry URL', value: 'registry' },
  { label: 'Git 仓库', value: 'git' },
]

const formatOptions = [
  { label: 'Smithery', value: 'smithery' },
  { label: 'mcp.so', value: 'mcp-so' },
  { label: 'Skill Registry', value: 'skill-md' },
  { label: '自定义', value: 'custom' },
]

const newSource = reactive<Partial<MarketSource>>({
  type: 'registry',
  name: '',
  url: '',
  branch: 'main',
  format: 'smithery',
  discovery: { skills: '', mcps: '' },
})

async function handleAdd() {
  if (!newSource.name || !newSource.url) return
  await addSource(newSource)
  showModal.value = false
  Object.assign(newSource, { name: '', url: '', branch: 'main', discovery: { skills: '', mcps: '' } })
  toast.add({ title: '添加成功', color: 'success' })
  refresh()
}

async function handleSync(sourceId: string) {
  syncing.value = sourceId
  try {
    const res = await syncSource(sourceId)
    toast.add({ title: `同步完成: ${res.skills} skills, ${res.mcps} MCPs`, color: 'success' })
  }
  catch {
    toast.add({ title: '同步失败', color: 'error' })
  }
  finally { syncing.value = null; refresh() }
}

async function handleDelete(id: string) {
  await deleteSource(id)
  toast.add({ title: '已删除', color: 'success' })
  refresh()
}

function statusColor(status: MarketSource['status']): 'success' | 'error' | 'info' {
  switch (status) {
    case 'active': return 'success'
    case 'error': return 'error'
    case 'syncing': return 'info'
  }
}
</script>

<template>
  <UContainer class="py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <div class="w-1 h-5 rounded-full bg-amber-400" />
          <h1 class="text-xl font-bold text-[--color-text-primary]">市场源</h1>
        </div>
        <p class="text-[13px] text-[--color-text-tertiary] ml-[19px]">导入外部 Skill 和 MCP 市场源</p>
      </div>
      <button
        class="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[--color-accent] rounded-md border border-[--color-accent]/30 bg-[--color-accent]/5 hover:bg-[--color-accent]/10 hover:border-[--color-accent]/50 transition-all duration-200 hover:shadow-[0_0_12px_var(--color-glow)]"
        @click="showModal = true"
      >
        <UIcon name="i-lucide-plus" class="size-3.5" />
        添加源
      </button>
    </div>

    <!-- List -->
    <div v-if="sources?.length" class="space-y-3">
      <UCard v-for="source in sources" :key="source.id">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UAvatar :icon="source.type === 'git' ? 'i-lucide-github' : 'i-lucide-globe'" size="sm" />
            <div>
              <p class="text-[13px] font-medium text-[--color-text-primary]">{{ source.name }}</p>
              <p class="text-[11px] text-[--color-text-tertiary] font-mono">{{ source.url }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <UBadge :color="statusColor(source.status)" variant="subtle" size="xs">
              {{ source.status }}
            </UBadge>
            <span class="text-[11px] text-[--color-text-tertiary]">{{ source.itemCount }} 条目</span>
            <UButton
              size="xs"
              variant="ghost"
              color="neutral"
              icon="i-lucide-refresh-cw"
              :loading="syncing === source.id"
              @click="handleSync(source.id)"
            />
            <UButton
              size="xs"
              variant="ghost"
              color="error"
              icon="i-lucide-trash-2"
              @click="handleDelete(source.id)"
            />
          </div>
        </div>
        <p v-if="source.lastSynced" class="text-[10px] text-[--color-text-tertiary] mt-3 ml-12">
          上次同步: {{ new Date(source.lastSynced).toLocaleString('zh-CN') }}
        </p>
      </UCard>
    </div>
    <div v-else class="text-center py-20">
      <UIcon name="i-lucide-cloud-download" class="size-8 text-[--color-text-tertiary] mb-3" />
      <p class="text-[13px] text-[--color-text-tertiary]">还没有配置外部市场源</p>
    </div>

    <!-- Add Modal -->
    <UModal v-model:open="showModal" title="添加外部源" description="导入 Skill 或 MCP 市场数据" :close="true">
      <template #body>
        <form id="add-source-form" class="space-y-4" @submit.prevent="handleAdd">
          <UFormField label="名称">
            <UInput v-model="newSource.name" class="w-full" placeholder="Community MCP Servers" />
          </UFormField>

          <div class="grid grid-cols-2 gap-3">
            <UFormField label="类型">
              <USelect v-model="newSource.type" :items="sourceTypeOptions" class="w-full" />
            </UFormField>
            <UFormField v-if="newSource.type === 'registry'" label="格式">
              <USelect v-model="newSource.format" :items="formatOptions" class="w-full" />
            </UFormField>
            <UFormField v-if="newSource.type === 'git'" label="分支">
              <UInput v-model="newSource.branch" class="w-full" placeholder="main" />
            </UFormField>
          </div>

          <UFormField label="URL">
            <UInput
              v-model="newSource.url"
              class="w-full"
              :placeholder="newSource.type === 'registry' ? 'https://registry.example.com/api' : 'https://github.com/user/repo'"
            />
          </UFormField>

          <template v-if="newSource.type === 'git'">
            <div class="grid grid-cols-2 gap-3">
              <UFormField label="Skill 路径">
                <UInput v-model="newSource.discovery!.skills" class="w-full" placeholder="skills/*/SKILL.md" />
              </UFormField>
              <UFormField label="MCP 路径">
                <UInput v-model="newSource.discovery!.mcps" class="w-full" placeholder="packages/*/package.json" />
              </UFormField>
            </div>
          </template>
        </form>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="showModal = false">
            取消
          </UButton>
          <UButton type="submit" form="add-source-form">
            添加
          </UButton>
        </div>
      </template>
    </UModal>
  </UContainer>
</template>
