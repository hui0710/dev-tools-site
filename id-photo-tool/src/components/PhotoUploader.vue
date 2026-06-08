<template>
  <div
    class="relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer"
    :class="[
      isDragOver
        ? 'border-primary bg-primary-light scale-[1.02]'
        : 'border-gray-300 hover:border-primary hover:bg-gray-50'
    ]"
    @dragover.prevent="isDragOver = true"
    @dragleave.prevent="isDragOver = false"
    @drop.prevent="handleDrop"
    @click="triggerFileInput"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      capture="environment"
      class="hidden"
      @change="handleFileChange"
    />

    <!-- 上传图标 -->
    <div class="flex flex-col items-center gap-4">
      <div class="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center">
        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <div>
        <p class="text-lg font-medium text-gray-700">点击或拖拽上传照片</p>
        <p class="text-sm text-gray-500 mt-1">支持 JPG、PNG 格式，手机可直接拍照</p>
      </div>

      <div class="flex gap-3 text-xs text-gray-400">
        <span class="px-2 py-1 bg-gray-100 rounded">拖拽上传</span>
        <span class="px-2 py-1 bg-gray-100 rounded">点击选择</span>
        <span class="px-2 py-1 bg-gray-100 rounded">拍照上传</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'upload', file: File): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file && file.type.startsWith('image/')) {
    emit('upload', file)
  }
}

function handleDrop(e: DragEvent) {
  isDragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    emit('upload', file)
  }
}
</script>
