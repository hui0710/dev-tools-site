<template>
  <div>
    <h3 class="text-sm font-semibold text-gray-700 mb-3">下载证件照</h3>

    <div class="space-y-3">
      <!-- 单张下载 -->
      <button
        class="w-full py-3 px-4 rounded-xl font-semibold text-white transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
        :class="hasPreview
          ? 'bg-primary hover:bg-primary-hover'
          : 'bg-gray-300 cursor-not-allowed'"
        :disabled="!hasPreview"
        @click="emit('download-single')"
      >
        <div class="flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          下载单张证件照
        </div>
      </button>

      <!-- 排版下载 -->
      <button
        v-if="hasLayout"
        class="w-full py-3 px-4 rounded-xl font-semibold text-white bg-success hover:bg-emerald-600 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
        @click="emit('download-layout')"
      >
        <div class="flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          下载A4排版（打印用）
        </div>
      </button>

      <!-- 广告位预留 -->
      <div class="ad-slot border border-dashed border-gray-200 rounded-lg p-4 text-center text-xs text-gray-400">
        广告位预留
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  hasPreview: boolean
  hasLayout: boolean
}>()

const emit = defineEmits<{
  (e: 'download-single'): void
  (e: 'download-layout'): void
}>()
</script>
