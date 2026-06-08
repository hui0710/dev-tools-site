<script setup lang="ts">
import { ref, computed } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import CopyButton from '../components/CopyButton.vue'

marked.setOptions({
  gfm: true,
  breaks: true,
})

const renderer = new marked.Renderer()
renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
  const highlighted = hljs.highlight(text, { language }).value
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
}
marked.use({ renderer })

const input = ref(`# Markdown 预览工具

## 功能特性

- **实时预览**：左编辑右预览
- 支持 GFM 语法
- 代码块语法高亮
- 导出为 HTML

### 代码示例

\`\`\`javascript
function hello() {
  console.log("Hello, DevTools!")
  return 42
}
\`\`\`

### 表格

| 工具 | 路径 | 描述 |
|------|------|------|
| JSON | /json | 格式化/压缩 |
| 正则 | /regex | 正则测试 |

### 任务列表

- [x] JSON 格式化
- [x] 正则测试
- [ ] 更多工具

> 这是一段引用文本，Markdown 是一种轻量级标记语言。

---

**粗体** | *斜体* | ~~删除线~~ | \`行内代码\`
`)

const htmlOutput = computed(() => {
  try {
    return marked.parse(input.value) as string
  } catch {
    return '<p>解析错误</p>'
  }
})

function exportHTML() {
  const fullHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Markdown Export</title>
<style>body{max-width:800px;margin:40px auto;padding:0 20px;font-family:system-ui,sans-serif;line-height:1.6}pre{background:#f5f5f5;padding:16px;border-radius:8px;overflow-x:auto}code{font-family:monospace}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}blockquote{border-left:4px solid #ddd;margin:0;padding-left:16px;color:#666}</style>
</head><body>${htmlOutput.value}</body></html>`
  const blob = new Blob([fullHtml], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'markdown-export.html'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Markdown 预览</h2>
      <div class="flex gap-2">
        <CopyButton :text="htmlOutput" />
        <button @click="exportHTML"
          class="rounded-lg bg-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
          导出 HTML
        </button>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">编辑区</label>
        <textarea v-model="input" rows="24" spellcheck="false"
          class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 outline-none focus:border-indigo-500" />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">预览区</label>
        <div
          class="prose prose-sm dark:prose-invert max-h-[600px] min-h-[576px] overflow-y-auto rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800"
          v-html="htmlOutput"
        />
      </div>
    </div>

    <div class="ad-slot mt-6">广告位</div>

    <section class="mt-8 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">使用说明</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Markdown预览工具支持GFM（GitHub Flavored Markdown）语法，包括表格、任务列表、删除线等。代码块自动语法高亮，支持多种编程语言。可导出为完整HTML文件，包含基础样式。左侧编辑，右侧实时预览。
      </p>
    </section>
  </div>
</template>

<style>
/* Basic prose styles for markdown */
.prose h1 { font-size: 1.8em; font-weight: bold; margin: 0.8em 0 0.4em; }
.prose h2 { font-size: 1.4em; font-weight: bold; margin: 0.7em 0 0.3em; }
.prose h3 { font-size: 1.2em; font-weight: 600; margin: 0.6em 0 0.3em; }
.prose p { margin: 0.5em 0; line-height: 1.7; }
.prose ul, .prose ol { padding-left: 1.5em; margin: 0.5em 0; }
.prose li { margin: 0.25em 0; }
.prose blockquote { border-left: 3px solid #6366f1; padding-left: 1em; margin: 0.5em 0; color: #666; }
.dark .prose blockquote { color: #aaa; }
.prose table { border-collapse: collapse; width: 100%; margin: 0.5em 0; }
.prose th, .prose td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
.prose th { background: #f5f5f5; font-weight: 600; }
.dark .prose th { background: #374151; }
.prose pre { margin: 0.5em 0; border-radius: 8px; overflow-x: auto; }
.prose code { font-family: 'JetBrains Mono', monospace; font-size: 0.9em; }
.prose :not(pre) > code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; }
.dark .prose :not(pre) > code { background: #374151; }
.prose hr { border: none; border-top: 1px solid #ddd; margin: 1em 0; }
.prose a { color: #6366f1; }
.prose img { max-width: 100%; border-radius: 8px; }
</style>
