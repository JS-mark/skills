<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string[]
  placeholder?: string
  suggestions?: string[]
}>(), {
  placeholder: '输入后按 Enter 添加',
  suggestions: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const input = ref('')
const focused = ref(false)
const inputRef = ref<HTMLInputElement>()

const filteredSuggestions = computed(() => {
  if (!input.value || !props.suggestions.length)
    return []
  const q = input.value.toLowerCase()
  return props.suggestions.filter(
    s => s.toLowerCase().includes(q) && !props.modelValue.includes(s),
  )
})

function addTag(tag: string) {
  const trimmed = tag.trim()
  if (trimmed && !props.modelValue.includes(trimmed)) {
    emit('update:modelValue', [...props.modelValue, trimmed])
  }
  input.value = ''
}

function removeTag(index: number) {
  const newTags = [...props.modelValue]
  newTags.splice(index, 1)
  emit('update:modelValue', newTags)
}

function onKeydown(e: KeyboardEvent) {
  if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) {
    e.preventDefault()
    addTag(input.value.replace(',', ''))
  }
  else if (e.key === 'Backspace' && !input.value && props.modelValue.length) {
    removeTag(props.modelValue.length - 1)
  }
}

function selectSuggestion(s: string) {
  addTag(s)
  inputRef.value?.focus()
}

function onFocus() {
  focused.value = true
}

function onBlur() {
  setTimeout(() => { focused.value = false }, 150)
  if (input.value.trim())
    addTag(input.value)
}
</script>

<template>
  <div class="relative">
    <div
      class="flex flex-wrap items-center gap-1.5 min-h-10 px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 transition-colors"
      :class="focused ? 'border-primary ring-2 ring-primary/20' : 'border-gray-300 dark:border-gray-600'"
      @click="inputRef?.focus()"
    >
      <span
        v-for="(tag, i) in modelValue"
        :key="tag"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-sm font-medium"
      >
        {{ tag }}
        <button
          type="button"
          class="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-primary/20 transition-colors"
          @click.stop="removeTag(i)"
        >
          <span class="i-carbon-close text-xs" />
        </button>
      </span>
      <input
        ref="inputRef"
        v-model="input"
        type="text"
        class="flex-1 min-w-24 outline-none bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
        :placeholder="modelValue.length ? '' : placeholder"
        @keydown="onKeydown"
        @focus="onFocus"
        @blur="onBlur"
      >
    </div>

    <!-- Suggestions dropdown -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <ul
        v-if="focused && filteredSuggestions.length"
        class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 max-h-40 overflow-y-auto"
      >
        <li
          v-for="s in filteredSuggestions"
          :key="s"
          class="px-3 py-1.5 text-sm cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
          @mousedown.prevent="selectSuggestion(s)"
        >
          {{ s }}
        </li>
      </ul>
    </Transition>
  </div>
</template>
