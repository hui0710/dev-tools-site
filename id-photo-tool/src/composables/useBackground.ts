import { ref } from 'vue'
import type { BackgroundColor } from '../types'

/** 模型加载进度 0-1 */
export const modelProgress = ref(0)
/** 是否正在加载模型 */
export const modelLoading = ref(false)
/** 是否正在处理背景 */
export const removing = ref(false)

let bgRemovalFn: ((input: Blob | ImageData) => Promise<Blob>) | null = null

/**
 * 初始化背景移除模型
 */
async function initModel() {
  if (bgRemovalFn) return

  modelLoading.value = true
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
  }
}

/**
 * 移除图片背景，返回透明背景的ImageBitmap
 */
export async function removeBackground(
  imageBlob: Blob
): Promise<ImageBitmap> {
  removing.value = true
  try {
    await initModel()

    if (!bgRemovalFn) throw new Error('Background removal not initialized')

    const blob = await bgRemovalFn(imageBlob)
    const bitmap = await createImageBitmap(blob)
    return bitmap
  } finally {
    removing.value = false
  }
}

/**
 * 将抠图结果合成到新背景色上
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
  const ctx = canvas.getContext('2d')!

  // 绘制背景
  if (bgColor.isGradient) {
    // 解析渐变
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
 */
export function canvasToDataURL(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png')
}
