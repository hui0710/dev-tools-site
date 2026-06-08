/** 证件照尺寸配置 */
export interface PhotoSize {
  id: string
  name: string
  widthMm: number
  heightMm: number
  widthPx: number
  heightPx: number
  category: 'common' | 'passport' | 'visa'
}

/** 背景色配置 */
export interface BackgroundColor {
  id: string
  name: string
  value: string
  isGradient?: boolean
}

/** 美颜参数 */
export interface BeautyParams {
  brightness: number
  contrast: number
  smooth: number
}

/** 排版配置 */
export interface LayoutConfig {
  paperWidth: number
  paperHeight: number
  photoWidth: number
  photoHeight: number
  cols: number
  rows: number
  gutter: number
}

/** 处理状态 */
export interface ProcessState {
  isUploading: boolean
  isRemoving: boolean
  isProcessing: boolean
  modelProgress: number
  modelLoading: boolean
  error: string | null
}
