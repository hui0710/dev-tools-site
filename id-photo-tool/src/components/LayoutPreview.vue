<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-700">A4排版</h3>
      <label class="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          :checked="enabled"
          class="sr-only peer"
          @change="emit('toggle', !enabled)"
        />
        <div class="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
      </label>
    </div>

    <div v-if="enabled" class="space-y-3">
      <!-- 排版信息 -->
      <div class="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
        <div class="flex justify-between">
          <span class="text-gray-500">纸张尺寸</span>
          <span class="text-gray-700">A4 (2480×3508px)</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">排列方式</span>
          <span class="text-gray-700">{{ layout.cols }}列 × {{ layout.rows }}行</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">总张数</span>
          <span class="text-primary font-semibold">{{ count }}张</span>
        </div>
      </div>

      <!-- 排版预览缩略图 -->
      <div v-if="previewUrl" class="border rounded-lg overflow-hidden bg-white">
        <img :src="previewUrl" alt="排版预览" class="w-full h-auto" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LayoutConfig } from '../types'

defineProps<{
  enabled: boolean
  previewUrl: string
  layout: LayoutConfig
  count: number
}>()

const emit = defineEmits<{
  (e: 'toggle', value: boolean): void
}>()
</script>
