import type { PhotoSize, LayoutConfig } from '../types'
import { A4, LAYOUT_GUTTER } from '../config/sizes'

/**
 * 计算A4纸排版配置
 */
export function calcLayout(size: PhotoSize): LayoutConfig {
  const gutter = LAYOUT_GUTTER
  const cols = Math.floor((A4.width - gutter) / (size.widthPx + gutter))
  const rows = Math.floor((A4.height - gutter) / (size.heightPx + gutter))

  return {
    paperWidth: A4.width,
    paperHeight: A4.height,
    photoWidth: size.widthPx,
    photoHeight: size.heightPx,
    cols,
    rows,
    gutter
  }
}

/**
 * 生成A4排版Canvas
 */
export function generateLayoutCanvas(
  photoCanvas: HTMLCanvasElement,
  layout: LayoutConfig
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = layout.paperWidth
  canvas.height = layout.paperHeight
  const ctx = canvas.getContext('2d')!

  // 白色背景
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 居中偏移
  const totalW = layout.cols * layout.photoWidth + (layout.cols - 1) * layout.gutter
  const totalH = layout.rows * layout.photoHeight + (layout.rows - 1) * layout.gutter
  const offsetX = (layout.paperWidth - totalW) / 2
  const offsetY = (layout.paperHeight - totalH) / 2

  // 绘制裁切线（浅灰色）
  ctx.strokeStyle = '#CCCCCC'
  ctx.lineWidth = 1
  ctx.setLineDash([8, 4])

  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      const x = offsetX + col * (layout.photoWidth + layout.gutter)
      const y = offsetY + row * (layout.photoHeight + layout.gutter)

      // 裁切线
      ctx.strokeRect(x - 1, y - 1, layout.photoWidth + 2, layout.photoHeight + 2)

      // 绘制照片
      ctx.drawImage(photoCanvas, x, y, layout.photoWidth, layout.photoHeight)
    }
  }

  return canvas
}

/**
 * 获取排版总照片数
 */
export function getLayoutCount(layout: LayoutConfig): number {
  return layout.cols * layout.rows
}
