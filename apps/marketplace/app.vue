<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'zh-CN' },
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
  ],
})
</script>

<template>
  <UApp>
    <div class="flex flex-col h-screen bg-[--color-surface]">
      <AppHeader />
      <main class="flex-1 min-h-0 overflow-y-auto">
        <NuxtPage />
      </main>
      <AppFooter />
    </div>
  </UApp>
</template>
