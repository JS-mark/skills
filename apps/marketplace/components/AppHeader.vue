<script setup lang="ts">
const route = useRoute()
const colorMode = useColorMode()

const showSubmitModal = ref(false)

const navItems = [
  { label: 'MCP 服务器', to: '/mcps' },
  { label: 'Skills', to: '/skills' },
  { label: '市场源', to: '/sources' },
]

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

const themeModes = [
  { label: '白昼', value: 'light', icon: 'i-lucide-sun' },
  { label: '暗黑', value: 'dark', icon: 'i-lucide-moon' },
  { label: '系统', value: 'system', icon: 'i-lucide-monitor' },
] as const

const currentThemeIcon = computed(() => {
  const mode = themeModes.find(m => m.value === colorMode.preference)
  return mode?.icon ?? 'i-lucide-monitor'
})

function setTheme(value: string) {
  colorMode.preference = value
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-[--color-surface]/85 backdrop-blur-xl">
    <UContainer class="h-14 flex items-center justify-between">
      <div class="flex items-center gap-10">
        <NuxtLink to="/" class="flex items-center gap-2">
          <UIcon name="i-lucide-anvil" class="text-[--color-accent] size-5" />
          <span class="text-sm font-bold text-[--color-text-primary]">SkillForge</span>
        </NuxtLink>
        <nav class="hidden md:flex items-center gap-1">
          <UButton
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            size="sm"
            :variant="isActive(item.to) ? 'soft' : 'ghost'"
            :color="isActive(item.to) ? 'primary' : 'neutral'"
          >
            {{ item.label }}
          </UButton>
        </nav>
      </div>
      <div class="flex items-center gap-2">
        <UDropdownMenu
          :items="themeModes.map(m => ({ label: m.label, icon: m.icon, onSelect: () => setTheme(m.value) }))"
        >
          <UButton
            :icon="currentThemeIcon"
            size="sm"
            variant="ghost"
            color="neutral"
          />
        </UDropdownMenu>
        <button
          class="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[--color-accent] rounded-md border border-[--color-accent]/30 bg-[--color-accent]/5 hover:bg-[--color-accent]/10 hover:border-[--color-accent]/50 transition-all duration-200 hover:shadow-[0_0_12px_var(--color-glow)]"
          @click="showSubmitModal = true"
        >
          <UIcon name="i-lucide-plus" class="size-3.5" />
          提交项目
        </button>
      </div>
    </UContainer>
  </header>
  <SubmitModal v-model="showSubmitModal" />
</template>
