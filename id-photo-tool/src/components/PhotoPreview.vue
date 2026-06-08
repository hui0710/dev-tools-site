<template>
  <div class="w-full">
    <!-- 预览区 -->
    <div class="relative bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center min-h-[300px]"
         style="background-image: linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%); background-size: 16px 16px; background-position: 0 0, 0 8px, 8px -8px, -8px 0px;">

      <!-- Loading -->
      <div v-if="isProcessing || removing || modelLoading" class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-10">
        <div class="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full mb-4"></div>

        <!-- 模型加载进度 -->
        <div v-if="modelLoading" class="w-48">
          <p class="text-white text-sm text-center mb-2">正在加载AI模型...</p>
          <div class="h-2 bg-white/30 rounded-full overflow-hidden">
            <div class="h-full bg-primary rounded-full transition-all" :style="{ width: (modelProgress * 100) + '%' }"></div>
          </div>
        </div>

        <p v-else class="text-white text-sm">
          {{ removing ? 'AI抠图处理中...' : '处理中...' }}
        </p>
      </div>

      <!-- 预览图 -->
      <img
        v-if="previewUrl"
        :src="previewUrl"
        alt="证件照预览"
        class="max-w-full max-h-[400px] object-contain shadow-lg"
      />

      <!-- 空状态 -->
      <div v-else-if="!isProcessing" class="text-center py-12 px-6">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-white/80 flex items-center justify-center">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p class="text-gray-500">上传照片后在此预览效果</p>
      </div>
    </div>

    <!-- 尺寸信息 -->
    <div v-if="previewUrl" class="mt-3 flex items-center justify-center gap-4 text-sm text-gray-600">
      <span>{{ size.name }}</span>
      <span class="text-gray-300">|</span>
      <span>{{ size.widthPx }} × {{ size.heightPx }} px</span>
      <span class="text-gray-300">|</span>
      <span>{{ size.widthMm }} × {{ size.heightMm }} mm</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PhotoSize } from '../types'

defineProps<{
  previewUrl: string
  size: PhotoSize
  isProcessing: boolean
  modelLoading: boolean
  modelProgress: number
  removing: boolean
}>()
</script>
