<template>
  <div>
    <h3 class="text-sm font-semibold text-gray-700 mb-3">背景颜色</h3>

    <div class="flex flex-wrap gap-3">
      <!-- 预设颜色 -->
      <button
        v-for="color in colors"
        :key="color.id"
        class="group relative"
        @click="emit('select', color)"
        :title="color.name"
      >
        <div
          class="w-10 h-10 rounded-full transition-all border-2"
          :class="selected.id === color.id
            ? 'border-primary scale-110 shadow-md'
            : 'border-gray-200 hover:border-gray-400'"
          :style="color.isGradient
            ? { background: color.value }
            : { backgroundColor: color.value }"
        ></div>
        <span class="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 whitespace-nowrap">
          {{ color.name }}
        </span>
      </button>

      <!-- 自定义颜色 -->
      <div class="relative">
        <input
          type="color"
          :value="customColor"
          class="w-10 h-10 rounded-full cursor-pointer border-2 border-dashed border-gray-300 p-0"
          @input="handleCustomColor"
          title="自定义颜色"
        />
        <span class="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 whitespace-nowrap">
          自定义
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BackgroundColor } from '../types'

const props = defineProps<{
  colors: BackgroundColor[]
  selected: BackgroundColor
  customColor: string
}>()

const emit = defineEmits<{
  (e: 'select', color: BackgroundColor): void
  (e: 'custom', color: string): void
}>()

function handleCustomColor(e: Event) {
  const value = (e.target as HTMLInputElement).value
  emit('custom', value)
  emit('select', {
    id: 'custom',
    name: '自定义',
    value
  })
}
</script>
