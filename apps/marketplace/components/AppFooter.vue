<script setup lang="ts">
const showSubmitModal = ref(false)
</script>

<template>
  <footer class="shrink-0 py-6">
    <UContainer>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-anvil" class="text-[--color-accent] size-4" />
            <span class="text-[12px] font-semibold text-[--color-text-secondary]">SkillForge</span>
          </div>
          <nav class="flex items-center gap-4">
            <NuxtLink to="/mcps" class="text-[12px] text-[--color-text-tertiary] hover:text-[--color-text-secondary] transition-colors">MCP 服务器</NuxtLink>
            <NuxtLink to="/skills" class="text-[12px] text-[--color-text-tertiary] hover:text-[--color-text-secondary] transition-colors">Skills</NuxtLink>
            <a class="text-[12px] text-[--color-text-tertiary] hover:text-[--color-text-secondary] transition-colors cursor-pointer" @click="showSubmitModal = true">提交项目</a>
            <a href="https://github.com/JS-mark/skills" target="_blank" class="text-[12px] text-[--color-text-tertiary] hover:text-[--color-text-secondary] transition-colors">GitHub</a>
          </nav>
        </div>
        <p class="text-[11px] text-[--color-text-tertiary]">© 2026 SkillForge</p>
      </div>
    </UContainer>
  </footer>
  <SubmitModal v-model="showSubmitModal" />
</template>
