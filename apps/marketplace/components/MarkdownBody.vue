<script setup lang="ts">
import { marked } from 'marked'

const props = defineProps<{ content: string }>()

const html = computed(() => marked.parse(props.content || '', { breaks: true }))
</script>

<template>
  <div class="prose prose-sm dark:prose-invert max-w-none" v-html="html" />
</template>

<style scoped>
.prose :deep(a) {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.prose :deep(a:hover) {
  opacity: 0.8;
}
.prose :deep(img) {
  border-radius: 6px;
  max-width: 100%;
}
.prose :deep(code) {
  font-size: 0.85em;
  padding: 0.15em 0.4em;
  border-radius: 4px;
  background: var(--color-surface-2);
}
.prose :deep(pre) {
  background: var(--color-surface-1);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1em;
  overflow-x: auto;
}
.prose :deep(pre code) {
  background: none;
  padding: 0;
}
.prose :deep(blockquote) {
  border-left: 3px solid var(--color-accent);
  padding-left: 1em;
  color: var(--color-text-secondary);
}
.prose :deep(h1, h2, h3, h4) {
  color: var(--color-text-primary);
}
.prose :deep(p) {
  color: var(--color-text-secondary);
  line-height: 1.75;
}
.prose :deep(ul), .prose :deep(ol) {
  color: var(--color-text-secondary);
}
.prose :deep(table) {
  width: 100%;
  border-collapse: collapse;
}
.prose :deep(th), .prose :deep(td) {
  border: 1px solid var(--color-border);
  padding: 0.5em 0.75em;
  text-align: left;
}
.prose :deep(th) {
  background: var(--color-surface-1);
}
</style>
