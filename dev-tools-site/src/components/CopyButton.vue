<script setup lang="ts">
import { useCopy } from '../composables/useCopy'

defineProps<{ text: string }>()
const { copy, copied } = useCopy()
</script>

<template>
  <button
    @click="copy(text)"
    class="inline-flex items-center gap-1 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-600 active:scale-95"
  >
    <span v-if="copied">✓ 已复制</span>
    <span v-else>📋 复制</span>
  </button>
</template>
