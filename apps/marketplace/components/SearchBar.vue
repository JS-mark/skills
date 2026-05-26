<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [value: string]
}>()

const input = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val),
})

function onSubmit() {
  emit('search', input.value)
}
</script>

<template>
  <form class="w-full max-w-[520px]" @submit.prevent="onSubmit">
    <UInput
      v-model="input"
      :placeholder="placeholder || '搜索 MCP 服务器...'"
      icon="i-lucide-search"
      size="lg"
      class="w-full"
    >
      <template #trailing>
        <UKbd>⌘K</UKbd>
      </template>
    </UInput>
  </form>
</template>
