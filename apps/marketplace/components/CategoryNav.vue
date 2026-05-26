<script setup lang="ts">
defineProps<{
  categories: { label: string, value: string }[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex items-center gap-2 overflow-x-auto pb-1">
    <UButton
      size="xs"
      :variant="modelValue === '' ? 'solid' : 'outline'"
      :color="modelValue === '' ? 'primary' : 'neutral'"
      @click="emit('update:modelValue', '')"
    >
      全部
    </UButton>
    <UButton
      v-for="cat in categories"
      :key="cat.value"
      size="xs"
      :variant="modelValue === cat.value ? 'solid' : 'outline'"
      :color="modelValue === cat.value ? 'primary' : 'neutral'"
      @click="emit('update:modelValue', cat.value)"
    >
      {{ cat.label }}
    </UButton>
  </div>
</template>
