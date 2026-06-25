import type { ToolConfig } from '../types'

export const tools: ToolConfig[] = [
  {
    name: 'JSON 格式化',
    path: '/json',
    icon: '🔧',
    description: 'JSON格式化、压缩、校验，支持转TypeScript接口和YAML',
    component: () => import('../views/JsonTool.vue'),
  },
  {
    name: '正则测试器',
    path: '/regex',
    icon: '🔍',
    description: '正则表达式测试，实时高亮匹配，常用正则模板',
    component: () => import('../views/RegexTool.vue'),
  },
  {
    name: '时间戳转换',
    path: '/timestamp',
    icon: '⏱️',
    description: 'Unix时间戳与可读时间双向转换，支持时区选择',
    component: () => import('../views/TimestampTool.vue'),
  },
  {
    name: 'Base64 编解码',
    path: '/base64',
    icon: '🔐',
    description: '文本/图片Base64编码与解码',
    component: () => import('../views/Base64Tool.vue'),
  },
  {
    name: 'URL 编解码',
    path: '/url-encode',
    icon: '🔗',
    description: 'URL编码与解码，支持批量处理',
    component: () => import('../views/UrlEncodeTool.vue'),
  },
  {
    name: '颜色转换',
    path: '/color',
    icon: '🎨',
    description: 'HEX/RGB/HSL颜色格式互转，可视化选色',
    component: () => import('../views/ColorTool.vue'),
  },
  {
    name: 'UUID/密码生成',
    path: '/generator',
    icon: '🔑',
    description: 'UUID v4批量生成，随机密码生成',
    component: () => import('../views/GeneratorTool.vue'),
  },
  {
    name: 'Markdown 预览',
    path: '/markdown',
    icon: '📝',
    description: 'Markdown实时预览，支持GFM语法和代码高亮',
    component: () => import('../views/MarkdownTool.vue'),
  },
  {
    name: 'CSS 渐变生成器',
    path: '/gradient',
    icon: '🌈',
    description: '可视化CSS渐变生成，支持线性和径向渐变',
    component: () => import('../views/GradientTool.vue'),
  },
  {
    name: '文本对比',
    path: '/diff',
    icon: '📊',
    description: '文本差异对比，高亮显示增删改',
    component: () => import('../views/DiffTool.vue'),
  },
]
