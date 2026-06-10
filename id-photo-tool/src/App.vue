<template>
  <div class="min-h-screen flex flex-col">
    <!-- 顶部导航 -->
    <header class="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-800">在线证件照制作</h1>
            <p class="text-xs text-gray-500 hidden sm:block">免费AI抠图 · 一键换背景 · 标准尺寸排版</p>
          </div>
        </div>

        <!-- 重置按钮 -->
        <button
          v-if="hasImage"
          class="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          @click="reset"
        >
          重新开始
        </button>
      </div>
    </header>

    <!-- 主体内容 -->
    <main class="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
      <!-- 错误提示 -->
      <div
        v-if="error"
        class="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        {{ error }}
      </div>

      <!-- 未上传图片：上传区域 -->
      <div v-if="!hasImage" class="max-w-xl mx-auto">
        <PhotoUploader @upload="handleUpload" />
      </div>

      <!-- 已上传：左右/上下布局 -->
      <div v-else class="flex flex-col lg:flex-row gap-6">
        <!-- 左侧：照片预览 -->
        <div class="flex-1 min-w-0">
          <PhotoPreview
            :preview-url="previewURL"
            :size="selectedSize"
            :is-processing="isProcessing"
            :model-loading="modelLoading"
            :model-progress="modelProgress"
            :removing="removing"
            :processing-step="processingStep"
            :processing-step-text="processingStepText"
          />
        </div>

        <!-- 右侧：控制面板 -->
        <div class="w-full lg:w-80 flex-shrink-0">
          <div class="bg-white rounded-xl shadow-sm border p-5 space-y-6 sticky top-20">
            <SizeSelector
              :sizes="sizes"
              :selected="selectedSize"
              @select="(s) => selectedSize = s"
            />

            <div class="border-t"></div>

            <ColorPicker
              :colors="bgColors"
              :selected="selectedBgColor"
              :custom-color="customColor"
              @select="(c) => selectedBgColor = c"
              @custom="(c) => customColor = c"
            />

            <div class="border-t"></div>

            <BeautySlider
              :params="beautyParams"
              @update="(p) => beautyParams = p"
            />

            <div class="border-t"></div>

            <LayoutPreview
              :enabled="enableLayout"
              :preview-url="layoutPreviewURL"
              :layout="currentLayout"
              :count="layoutPhotoCount"
              @toggle="(v) => enableLayout = v"
            />

            <div class="border-t"></div>

            <DownloadPanel
              :has-preview="!!previewURL"
              :has-layout="!!layoutPreviewURL"
              @download-single="downloadSingle"
              @download-layout="downloadLayout"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- 底部 -->
    <footer class="bg-white border-t mt-12">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <!-- 使用说明 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="text-center">
            <div class="w-12 h-12 rounded-full bg-primary-light mx-auto mb-3 flex items-center justify-center">
              <span class="text-primary font-bold text-lg">1</span>
            </div>
            <h3 class="font-semibold text-gray-700 mb-1">上传照片</h3>
            <p class="text-sm text-gray-500">支持拖拽、点击选择或手机拍照上传证件照原图</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 rounded-full bg-primary-light mx-auto mb-3 flex items-center justify-center">
              <span class="text-primary font-bold text-lg">2</span>
            </div>
            <h3 class="font-semibold text-gray-700 mb-1">选择参数</h3>
            <p class="text-sm text-gray-500">选择证件照尺寸、背景颜色，可调节亮度对比度美颜</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 rounded-full bg-primary-light mx-auto mb-3 flex items-center justify-center">
              <span class="text-primary font-bold text-lg">3</span>
            </div>
            <h3 class="font-semibold text-gray-700 mb-1">下载打印</h3>
            <p class="text-sm text-gray-500">下载单张证件照或A4排版打印版，支持300dpi高清输出</p>
          </div>
        </div>

        <!-- SEO文案 -->
        <div class="text-center text-sm text-gray-500 mb-6 max-w-2xl mx-auto">
          <p>
            免费在线证件照制作工具，支持一寸、二寸、小一寸、大一寸、护照、签证等标准尺寸。
            AI智能抠图换背景，支持白色、红色、蓝色背景色一键切换。
            A4排版打印功能，方便在家自制证件照，省时省钱。
          </p>
        </div>

        <!-- 免责声明 -->
        <div class="text-center text-xs text-gray-400 mb-4">
          <p>免责声明：本工具仅供个人使用，照片处理均在浏览器本地完成，不会上传至任何服务器。</p>
        </div>

        <!-- Google AdSense预留 -->
        <div class="ad-slot border border-dashed border-gray-200 rounded-lg p-6 text-center text-xs text-gray-400 max-w-3xl mx-auto">
          广告位预留 - Google AdSense
        </div>

        <div class="text-center text-xs text-gray-400 mt-6">
          <p>© 2024 在线证件照制作工具 · 纯前端处理 · 隐私安全</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import PhotoUploader from './components/PhotoUploader.vue'
import PhotoPreview from './components/PhotoPreview.vue'
import SizeSelector from './components/SizeSelector.vue'
import ColorPicker from './components/ColorPicker.vue'
import BeautySlider from './components/BeautySlider.vue'
import LayoutPreview from './components/LayoutPreview.vue'
import DownloadPanel from './components/DownloadPanel.vue'
import { usePhoto } from './composables/usePhoto'
import { onMounted } from 'vue'

const {
  selectedSize,
  selectedBgColor,
  beautyParams,
  customColor,
  enableLayout,
  isProcessing,
  error,
  previewURL,
  layoutPreviewURL,
  hasImage,
  currentLayout,
  layoutPhotoCount,
  modelLoading,
  modelProgress,
  removing,
  processingStep,
  processingStepText,
  sizes,
  bgColors,
  handleUpload,
  downloadSingle,
  downloadLayout,
  reset,
  preloadModel
} = usePhoto()

// 页面加载后立即预加载AI模型
onMounted(() => {
  preloadModel()
})
</script>
