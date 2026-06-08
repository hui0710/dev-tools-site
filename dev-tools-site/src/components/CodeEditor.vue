<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder?: string
  readonly?: boolean
  label?: string
  rows?: number
}>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ label }}</label>
    <textarea
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      :placeholder="placeholder"
      :readonly="readonly"
      :rows="rows || 12"
      class="w-full resize-y rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      spellcheck="false"
    />
  </div>
</template>
