<script setup lang="ts">
const route = useRoute()
const { fetchSkill } = useMarketplace()
const { data: skill, error } = fetchSkill(route.params.id as string)
const toast = useToast()

async function copyInstall() {
  if (!skill.value) return
  await navigator.clipboard.writeText(skill.value.installCommand)
  toast.add({ title: '已复制到剪贴板', color: 'success' })
}
</script>

<template>
  <UContainer class="py-10 max-w-4xl">
    <UButton to="/skills" variant="link" color="neutral" size="sm" icon="i-lucide-arrow-left" class="mb-6">
      返回列表
    </UButton>

    <div v-if="error" class="text-center py-20">
      <UIcon name="i-lucide-alert-circle" class="size-10 text-[--color-text-tertiary] mb-3" />
      <p class="text-[--color-text-tertiary]">Skill 未找到</p>
    </div>

    <div v-else-if="skill" class="space-y-5 animate-fade-up">
      <UCard>
        <div class="flex items-start gap-4">
          <UAvatar :text="skill.name.charAt(0).toUpperCase()" size="xl" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-xl font-bold text-[--color-text-primary]">{{ skill.name }}</h1>
              <UBadge variant="subtle" color="neutral" size="sm">{{ skill.category }}</UBadge>
            </div>
            <p class="text-sm text-[--color-text-tertiary]">{{ skill.author }} · v{{ skill.version }}</p>
          </div>
          <UBadge variant="soft" color="warning" size="md">
            {{ skill.downloads }} downloads
          </UBadge>
        </div>
        <div class="mt-5">
          <MarkdownBody :content="skill.description" />
        </div>
        <div v-if="skill.tags.length" class="flex flex-wrap gap-2 mt-5">
          <UBadge v-for="tag in skill.tags" :key="tag" variant="subtle" color="neutral" size="sm">{{ tag }}</UBadge>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-[13px] font-semibold text-[--color-text-primary]">安装命令</h2>
            <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-copy" @click="copyInstall">
              复制
            </UButton>
          </div>
        </template>
        <pre class="p-4 rounded-lg bg-[--color-surface] text-[12px] text-emerald-400 font-mono overflow-x-auto"><code>{{ skill.installCommand }}</code></pre>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-[13px] font-semibold text-[--color-text-primary]">详情</h2>
        </template>
        <dl class="grid grid-cols-2 gap-4 text-[12px]">
          <div v-if="skill.allowedTools?.length"><dt class="text-[--color-text-tertiary]">允许的工具</dt><dd class="text-[--color-text-primary] mt-0.5 font-mono">{{ skill.allowedTools.join(', ') }}</dd></div>
          <div v-if="skill.repository"><dt class="text-[--color-text-tertiary]">仓库</dt><dd class="mt-0.5"><UButton :to="skill.repository" target="_blank" variant="link" size="xs" trailing-icon="i-lucide-external-link">GitHub</UButton></dd></div>
          <div><dt class="text-[--color-text-tertiary]">分类</dt><dd class="text-[--color-text-primary] mt-0.5">{{ skill.category }}</dd></div>
          <div><dt class="text-[--color-text-tertiary]">更新时间</dt><dd class="text-[--color-text-primary] mt-0.5">{{ new Date(skill.updatedAt).toLocaleDateString('zh-CN') }}</dd></div>
        </dl>
      </UCard>
    </div>
  </UContainer>
</template>
