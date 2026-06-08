import type { PhotoSize } from '../types'

/**
 * 裁剪图片到指定证件照尺寸（居中裁剪）
 */
export function cropToSize(
  source: HTMLImageElement | HTMLCanvasElement,
  size: PhotoSize
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = size.widthPx
  canvas.height = size.heightPx

  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  const srcW = source instanceof HTMLCanvasElement ? source.width : source.naturalWidth
  const srcH = source instanceof HTMLCanvasElement ? source.height : source.naturalHeight

  const targetRatio = size.widthPx / size.heightPx
  const srcRatio = srcW / srcH

  let sx = 0, sy = 0, sw = srcW, sh = srcH

  if (srcRatio > targetRatio) {
    // 原图更宽，裁剪左右
    sw = srcH * targetRatio
    sx = (srcW - sw) / 2
  } else {
    // 原图更高，裁剪上下
    sh = srcW / targetRatio
    sy = (srcH - sh) / 2
  }

  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, size.widthPx, size.heightPx)
  return canvas
}

/**
 * 获取裁剪预览URL
 */
export function getCroppedPreviewURL(
  source: HTMLImageElement | HTMLCanvasElement,
  size: PhotoSize
): string {
  const canvas = cropToSize(source, size)
  return canvas.toDataURL('image/png')
}
