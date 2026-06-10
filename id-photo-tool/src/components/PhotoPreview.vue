<template>
  <div class="w-full">
    <!-- 预览区 -->
    <div class="relative bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center min-h-[300px]"
         style="background-image: linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%); background-size: 16px 16px; background-position: 0 0, 0 8px, 8px -8px, -8px 0px;">

      <!-- Loading -->
      <div v-if="isProcessing || removing || modelLoading" class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-10">
        <div class="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full mb-4"></div>

        <!-- 步骤式进度提示 -->
        <div class="w-64">
          <!-- 主提示文字 -->
          <p class="text-white text-sm text-center mb-3 font-medium">{{ processingStepText }}</p>

          <!-- 步骤指示器 -->
          <div class="flex items-center justify-center gap-1 mb-3">
            <div
              v-for="(step, idx) in steps"
              :key="idx"
              class="flex items-center"
            >
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-300"
                :class="getStepClass(idx)"
              >
                <svg v-if="getStepStatus(idx) === 'done'" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <div v-if="idx < steps.length - 1" class="w-4 h-0.5 mx-0.5 rounded" :class="getStepStatus(idx) === 'done' ? 'bg-green-400' : 'bg-white/30'"></div>
            </div>
          </div>

          <!-- 步骤标签 -->
          <div class="flex justify-between text-[10px] text-white/60 px-0.5">
            <span>加载模型</span>
            <span>处理图片</span>
            <span>合成背景</span>
          </div>

          <!-- 模型加载进度条 -->
          <div v-if="modelLoading" class="mt-3">
            <div class="h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div class="h-full bg-primary rounded-full transition-all duration-300" :style="{ width: (modelProgress * 100) + '%' }"></div>
            </div>
            <p class="text-white/50 text-[10px] text-center mt-1">首次加载需下载模型，请稍候...</p>
          </div>
        </div>
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
import { computed } from 'vue'
import type { PhotoSize } from '../types'
import type { ProcessingStep } from '../composables/useBackground'

const props = defineProps<{
  previewUrl: string
  size: PhotoSize
  isProcessing: boolean
  modelLoading: boolean
  modelProgress: number
  removing: boolean
  processingStep: ProcessingStep
  processingStepText: string
}>()

const steps = ['load', 'process', 'composite'] as const

/** 根据当前processingStep获取步骤索引 */
const currentStepIndex = computed(() => {
  switch (props.processingStep) {
    case 'loading-model': return 0
    case 'processing-image': return 1
    case 'compositing': return 2
    default: return -1
  }
})

function getStepStatus(idx: number): 'done' | 'active' | 'pending' {
  const current = currentStepIndex.value
  if (current < 0) return 'pending'
  if (idx < current) return 'done'
  if (idx === current) return 'active'
  return 'pending'
}

function getStepClass(idx: number): string {
  const status = getStepStatus(idx)
  switch (status) {
    case 'done': return 'bg-green-500 text-white'
    case 'active': return 'bg-primary text-white ring-2 ring-white/50'
    case 'pending': return 'bg-white/30 text-white/60'
  }
}
</script>
