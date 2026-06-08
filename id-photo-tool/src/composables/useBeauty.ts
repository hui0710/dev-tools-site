import type { BeautyParams } from '../types'

/**
 * 应用美颜效果到Canvas
 */
export function applyBeauty(
  source: HTMLCanvasElement,
  params: BeautyParams
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = source.width
  canvas.height = source.height
  const ctx = canvas.getContext('2d')!

  // 构建CSS滤镜
  const filters: string[] = []
  filters.push(`brightness(${100 + params.brightness}%)`)
  filters.push(`contrast(${100 + params.contrast}%)`)

  ctx.filter = filters.join(' ')
  ctx.drawImage(source, 0, 0)
  ctx.filter = 'none'

  // 磨皮：简易高斯模糊模拟（使用多次缩放实现）
  if (params.smooth > 0) {
    const smoothCanvas = document.createElement('canvas')
    smoothCanvas.width = canvas.width
    smoothCanvas.height = canvas.height
    const sCtx = smoothCanvas.getContext('2d')!

    // 缩小再放大实现模糊
    const scale = 1 - params.smooth * 0.004
    const sw = Math.round(canvas.width * scale)
    const sh = Math.round(canvas.height * scale)

    const tmpCanvas = document.createElement('canvas')
    tmpCanvas.width = sw
    tmpCanvas.height = sh
    const tmpCtx = tmpCanvas.getContext('2d')!
    tmpCtx.imageSmoothingEnabled = true
    tmpCtx.drawImage(canvas, 0, 0, sw, sh)

    sCtx.imageSmoothingEnabled = true
    sCtx.drawImage(tmpCanvas, 0, 0, canvas.width, canvas.height)

    // 混合原图和磨皮图
    const alpha = params.smooth / 100
    ctx.globalAlpha = 1 - alpha
    ctx.drawImage(canvas, 0, 0)
    ctx.globalAlpha = alpha
    ctx.drawImage(smoothCanvas, 0, 0)
    ctx.globalAlpha = 1
  }

  return canvas
}

/** 默认美颜参数 */
export const DEFAULT_BEAUTY: BeautyParams = {
  brightness: 0,
  contrast: 0,
  smooth: 0
}
