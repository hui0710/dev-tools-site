import { ref } from 'vue'
import type { BackgroundColor } from '../types'

// ─── 处理步骤 ───
export type ProcessingStep = 'idle' | 'loading-model' | 'processing-image' | 'compositing'

/** 当前处理步骤 */
export const processingStep = ref<ProcessingStep>('idle')

/** 模型加载进度 0-1 */
export const modelProgress = ref(0)
/** 是否正在加载模型 */
export const modelLoading = ref(false)
/** 是否正在处理背景 */
export const removing = ref(false)

/** 最大输入尺寸，送入AI前缩放到此尺寸以内 */
const MAX_INPUT_SIZE = 1024

let bgRemovalFn: ((input: Blob | ImageData) => Promise<Blob>) | null = null

// ─── 结果缓存 ───
/** 缓存key: 图片尺寸+内容的简单hash */
let cachedInputHash = ''
let cachedForegroundBitmap: ImageBitmap | null = null

/**
 * 生成图片的简单hash（尺寸+大小，避免处理同一张图）
 */
function computeImageHash(blob: Blob, width: number, height: number): string {
  return `${width}x${height}_${blob.size}`
}

/**
 * 压缩图片：将输入图片缩放到MAX_INPUT_SIZE以内
 * 返回压缩后的Blob和原始尺寸
 */
export async function compressImage(
  file: File | Blob,
  originalWidth: number,
  originalHeight: number
): Promise<{ blob: Blob; width: number; height: number }> {
  // 如果图片已经在限制范围内，不需要压缩
  if (originalWidth <= MAX_INPUT_SIZE && originalHeight <= MAX_INPUT_SIZE) {
    return { blob: file, width: originalWidth, height: originalHeight }
  }

  const scale = MAX_INPUT_SIZE / Math.max(originalWidth, originalHeight)
  const targetW = Math.round(originalWidth * scale)
  const targetH = Math.round(originalHeight * scale)

  // 创建Image元素来绘制缩小版本
  const img = await createImageBitmap(file)

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, targetW, targetH)
  img.close()

  // 使用高质量JPEG压缩进一步减小体积
  const compressedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('Image compression failed')),
      'image/jpeg',
      0.92
    )
  })

  return { blob: compressedBlob, width: targetW, height: targetH }
}

/**
 * 初始化背景移除模型
 * 可在页面加载后立即调用以预加载模型
 */
export async function initModel() {
  if (bgRemovalFn) return

  modelLoading.value = true
  processingStep.value = 'loading-model'
  modelProgress.value = 0

  try {
    const { removeBackground } = await import('@imgly/background-removal')

    bgRemovalFn = removeBackground
    modelProgress.value = 1
  } catch (e) {
    console.error('Failed to load background removal model:', e)
    throw e
  } finally {
    modelLoading.value = false
    // 如果当前步骤还是loading-model，切回idle
    if (processingStep.value === 'loading-model') {
      processingStep.value = 'idle'
    }
  }
}

/**
 * 移除图片背景，返回透明背景的ImageBitmap
 * 支持缓存：同一张图片不会重复处理
 */
export async function removeBackground(
  imageBlob: Blob,
  imageWidth: number,
  imageHeight: number
): Promise<ImageBitmap> {
  // 检查缓存
  const hash = computeImageHash(imageBlob, imageWidth, imageHeight)
  if (hash === cachedInputHash && cachedForegroundBitmap) {
    return cachedForegroundBitmap
  }

  removing.value = true

  try {
    // 步骤1: 确保模型已加载
    await initModel()

    if (!bgRemovalFn) throw new Error('Background removal not initialized')

    // 步骤2: 压缩图片
    processingStep.value = 'processing-image'
    const { blob: compressedBlob } = await compressImage(imageBlob, imageWidth, imageHeight)

    // 步骤3: 执行AI抠图
    const resultBlob = await bgRemovalFn(compressedBlob)
    const bitmap = await createImageBitmap(resultBlob)

    // 缓存结果
    cachedInputHash = hash
    cachedForegroundBitmap = bitmap

    return bitmap
  } finally {
    removing.value = false
    processingStep.value = 'idle'
  }
}

/**
 * 将抠图结果合成到新背景色上
 * 优化：使用willReadFrequently选项、避免不必要的canvas操作
 */
export function compositeWithBackground(
  foreground: ImageBitmap | HTMLCanvasElement,
  bgColor: BackgroundColor,
  outputWidth: number,
  outputHeight: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = outputWidth
  canvas.height = outputHeight
  const ctx = canvas.getContext('2d', { willReadFrequently: false })!

  // 绘制背景
  if (bgColor.isGradient) {
    const gradient = ctx.createLinearGradient(0, 0, 0, outputHeight)
    gradient.addColorStop(0, '#438EDB')
    gradient.addColorStop(1, '#2563EB')
    ctx.fillStyle = gradient
  } else {
    ctx.fillStyle = bgColor.value
  }
  ctx.fillRect(0, 0, outputWidth, outputHeight)

  // 计算前景绘制参数（保持比例居中）
  const fgW = foreground instanceof HTMLCanvasElement ? foreground.width : foreground.width
  const fgH = foreground instanceof HTMLCanvasElement ? foreground.height : foreground.height

  const scale = Math.min(outputWidth / fgW, outputHeight / fgH)
  const dw = fgW * scale
  const dh = fgH * scale
  const dx = (outputWidth - dw) / 2
  const dy = (outputHeight - dh) / 2

  ctx.drawImage(foreground, dx, dy, dw, dh)
  return canvas
}

/**
 * Canvas转Blob
 */
export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png'): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('Canvas to blob failed')),
      type,
      1.0
    )
  })
}

/**
 * Canvas转DataURL
 * 优化：使用JPEG格式减少预览URL大小，加快渲染
 */
export function canvasToDataURL(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png')
}

/**
 * 清除缓存（换图片时调用）
 */
export function clearForegroundCache() {
  cachedInputHash = ''
  if (cachedForegroundBitmap) {
    cachedForegroundBitmap.close()
    cachedForegroundBitmap = null
  }
}
