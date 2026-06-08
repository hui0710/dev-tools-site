import { ref, computed, watch } from 'vue'
import type { PhotoSize, BackgroundColor, BeautyParams } from '../types'
import { PHOTO_SIZES, BG_COLORS } from '../config/sizes'
import { cropToSize } from './useCrop'
import { applyBeauty, DEFAULT_BEAUTY } from './useBeauty'
import {
  removeBackground,
  compositeWithBackground,
  canvasToDataURL,
  canvasToBlob,
  modelLoading,
  modelProgress,
  removing
} from './useBackground'
import { calcLayout, generateLayoutCanvas, getLayoutCount } from './useLayout'

// ─── 核心状态 ───
/** 原始上传的图片 */
const originalImage = ref<HTMLImageElement | null>(null)
/** 原始图片Blob */
const originalBlob = ref<Blob | null>(null)
/** 抠图后的透明前景 */
const foregroundBitmap = ref<ImageBitmap | null>(null)
/** 当前选中的尺寸 */
const selectedSize = ref<PhotoSize>(PHOTO_SIZES[0])
/** 当前选中的背景色 */
const selectedBgColor = ref<BackgroundColor>(BG_COLORS[0])
/** 美颜参数 */
const beautyParams = ref<BeautyParams>({ ...DEFAULT_BEAUTY })
/** 自定义背景色 */
const customColor = ref('#FFFFFF')
/** 是否启用排版 */
const enableLayout = ref(false)

// ─── 处理状态 ───
const isProcessing = ref(false)
const error = ref<string | null>(null)

// ─── 渲染结果 ───
/** 最终输出的证件照Canvas */
const outputCanvas = ref<HTMLCanvasElement | null>(null)
/** 预览URL */
const previewURL = ref<string>('')
/** 排版Canvas */
const layoutCanvas = ref<HTMLCanvasElement | null>(null)
/** 排版预览URL */
const layoutPreviewURL = ref<string>('')

// ─── 计算属性 ───
const hasImage = computed(() => !!originalImage.value)
const currentLayout = computed(() => calcLayout(selectedSize.value))
const layoutPhotoCount = computed(() => getLayoutCount(currentLayout.value))

// ─── 核心处理函数 ───

/** 加载图片 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/** 上传照片处理 */
async function handleUpload(file: File) {
  error.value = null
  isProcessing.value = true

  try {
    const img = await loadImage(file)
    originalImage.value = img
    originalBlob.value = file
    foregroundBitmap.value = null

    // 自动抠图
    try {
      const bitmap = await removeBackground(file)
      foregroundBitmap.value = bitmap
    } catch (e) {
      console.warn('Background removal failed, using original:', e)
      // 抠图失败不阻断，使用原图继续
    }

    // 生成预览
    renderPreview()
  } catch (e: any) {
    error.value = e.message || '图片加载失败'
  } finally {
    isProcessing.value = false
  }
}

/** 渲染预览 */
function renderPreview() {
  const source = foregroundBitmap.value || originalImage.value
  if (!source) return

  const size = selectedSize.value
  const bgColor = selectedBgColor.value

  // 先裁剪
  let cropped: HTMLCanvasElement
  if (foregroundBitmap.value) {
    // 抠图模式下直接合成
    cropped = compositeWithBackground(
      foregroundBitmap.value,
      bgColor,
      size.widthPx,
      size.heightPx
    )
  } else {
    // 未抠图：先裁剪再合成背景
    const cropCanvas = cropToSize(originalImage.value!, size)
    cropped = compositeWithBackground(
      cropCanvas,
      { id: 'none', name: '', value: 'transparent' },
      size.widthPx,
      size.heightPx
    )
    // 未抠图时直接显示裁剪结果
    cropped = cropCanvas
  }

  // 应用美颜
  const hasBeauty = beautyParams.value.brightness !== 0 ||
    beautyParams.value.contrast !== 0 ||
    beautyParams.value.smooth !== 0

  if (hasBeauty) {
    cropped = applyBeauty(cropped, beautyParams.value)
  }

  outputCanvas.value = cropped
  previewURL.value = canvasToDataURL(cropped)

  // 更新排版
  if (enableLayout.value) {
    renderLayout()
  }
}

/** 渲染排版 */
function renderLayout() {
  if (!outputCanvas.value) return
  const layout = currentLayout.value
  const canvas = generateLayoutCanvas(outputCanvas.value, layout)
  layoutCanvas.value = canvas
  layoutPreviewURL.value = canvasToDataURL(canvas)
}

/** 下载单张证件照 */
function downloadSingle() {
  if (!outputCanvas.value) return
  const link = document.createElement('a')
  link.download = `证件照_${selectedSize.value.name}_${selectedSize.value.widthPx}x${selectedSize.value.heightPx}.png`
  link.href = canvasToDataURL(outputCanvas.value)
  link.click()
}

/** 下载排版A4 */
function downloadLayout() {
  if (!layoutCanvas.value) {
    renderLayout()
  }
  if (!layoutCanvas.value) return
  const link = document.createElement('a')
  link.download = `证件照排版_A4_${selectedSize.value.name}.png`
  link.href = canvasToDataURL(layoutCanvas.value)
  link.click()
}

/** 重置 */
function reset() {
  originalImage.value = null
  originalBlob.value = null
  foregroundBitmap.value = null
  outputCanvas.value = null
  layoutCanvas.value = null
  previewURL.value = ''
  layoutPreviewURL.value = ''
  beautyParams.value = { ...DEFAULT_BEAUTY }
  enableLayout.value = false
  error.value = null
}

// ─── 监听变化自动重渲染 ───
watch([selectedSize, selectedBgColor, beautyParams], () => {
  if (hasImage.value) {
    renderPreview()
  }
})

watch(enableLayout, (val) => {
  if (val && hasImage.value) {
    renderLayout()
  } else {
    layoutPreviewURL.value = ''
    layoutCanvas.value = null
  }
})

export function usePhoto() {
  return {
    // 状态
    originalImage,
    foregroundBitmap,
    selectedSize,
    selectedBgColor,
    beautyParams,
    customColor,
    enableLayout,
    isProcessing,
    error,
    previewURL,
    layoutPreviewURL,
    outputCanvas,
    layoutCanvas,
    hasImage,
    currentLayout,
    layoutPhotoCount,
    modelLoading,
    modelProgress,
    removing,

    // 配置
    sizes: PHOTO_SIZES,
    bgColors: BG_COLORS,

    // 方法
    handleUpload,
    renderPreview,
    renderLayout,
    downloadSingle,
    downloadLayout,
    reset
  }
}
