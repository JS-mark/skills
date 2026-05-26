<script setup lang="ts">
defineProps<{
  steps: string[]
  current: number
}>()
</script>

<template>
  <div class="flex items-center gap-0">
    <template v-for="(step, i) in steps" :key="i">
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300"
          :class="[
            i < current ? 'bg-primary text-white' : '',
            i === current ? 'bg-primary text-white ring-4 ring-primary/20' : '',
            i > current ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400' : '',
          ]"
        >
          <span v-if="i < current" class="i-carbon-checkmark text-sm" />
          <span v-else>{{ i + 1 }}</span>
        </div>
        <span
          class="text-sm font-medium hidden sm:inline transition-colors"
          :class="i <= current ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'"
        >
          {{ step }}
        </span>
      </div>
      <div
        v-if="i < steps.length - 1"
        class="flex-1 h-0.5 mx-3 rounded transition-colors duration-300"
        :class="i < current ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'"
      />
    </template>
  </div>
</template>
