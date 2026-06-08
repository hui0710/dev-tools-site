export interface ToolConfig {
  name: string
  path: string
  icon: string
  description: string
  component: () => Promise<any>
}

export interface ColorFormats {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
}
