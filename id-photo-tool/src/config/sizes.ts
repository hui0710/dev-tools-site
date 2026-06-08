import type { PhotoSize, BackgroundColor } from '../types'

/** 证件照尺寸配置表 */
export const PHOTO_SIZES: PhotoSize[] = [
  {
    id: 'one-inch',
    name: '一寸',
    widthMm: 25,
    heightMm: 35,
    widthPx: 295,
    heightPx: 413,
    category: 'common'
  },
  {
    id: 'two-inch',
    name: '二寸',
    widthMm: 35,
    heightMm: 49,
    widthPx: 413,
    heightPx: 579,
    category: 'common'
  },
  {
    id: 'small-one-inch',
    name: '小一寸',
    widthMm: 22,
    heightMm: 32,
    widthPx: 260,
    heightPx: 378,
    category: 'common'
  },
  {
    id: 'large-one-inch',
    name: '大一寸',
    widthMm: 33,
    heightMm: 48,
    widthPx: 390,
    heightPx: 567,
    category: 'common'
  },
  {
    id: 'passport',
    name: '护照',
    widthMm: 33,
    heightMm: 48,
    widthPx: 390,
    heightPx: 567,
    category: 'passport'
  },
  {
    id: 'visa-us',
    name: '美国签证',
    widthMm: 51,
    heightMm: 51,
    widthPx: 600,
    heightPx: 600,
    category: 'visa'
  },
  {
    id: 'visa-jp',
    name: '日本签证',
    widthMm: 45,
    heightMm: 45,
    widthPx: 531,
    heightPx: 531,
    category: 'visa'
  },
  {
    id: 'visa-kr',
    name: '韩国签证',
    widthMm: 35,
    heightMm: 45,
    widthPx: 413,
    heightPx: 531,
    category: 'visa'
  }
]

/** 背景色配置 */
export const BG_COLORS: BackgroundColor[] = [
  { id: 'white', name: '白色', value: '#FFFFFF' },
  { id: 'red', name: '红色', value: '#FF0000' },
  { id: 'blue', name: '蓝色', value: '#438EDB' },
  { id: 'gradient-blue', name: '渐变蓝', value: 'linear-gradient(180deg, #438EDB 0%, #2563EB 100%)', isGradient: true }
]

/** A4纸尺寸 @300dpi */
export const A4 = {
  width: 2480,
  height: 3508,
  dpi: 300
}

/** 排版间距(px) */
export const LAYOUT_GUTTER = 20
