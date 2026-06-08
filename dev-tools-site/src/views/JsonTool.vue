<script setup lang="ts">
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const input = ref('{\n  "name": "DevTools",\n  "version": 1,\n  "features": ["json", "regex", "base64"]\n}')
const indentSize = ref(2)
const activeTab = ref<'format' | 'compress' | 'ts' | 'yaml'>('format')
const errorMsg = ref('')

function parseJSON(str: string): any {
  errorMsg.value = ''
  try {
    return JSON.parse(str)
  } catch (e: any) {
    errorMsg.value = e.message
    return null
  }
}

const formatted = computed(() => {
  const obj = parseJSON(input.value)
  if (obj === null && errorMsg.value) return ''
  return JSON.stringify(obj, null, indentSize.value)
})

const compressed = computed(() => {
  const obj = parseJSON(input.value)
  if (obj === null && errorMsg.value) return ''
  return JSON.stringify(obj)
})

const tsInterface = computed(() => {
  const obj = parseJSON(input.value)
  if (obj === null && errorMsg.value) return ''
  return jsonToTS(obj, 'Root')
})

function jsonToTS(obj: any, name: string): string {
  if (obj === null || obj === undefined) return `type ${name} = any`
  if (Array.isArray(obj)) {
    if (obj.length === 0) return `type ${name} = any[]`
    const itemType = typeof obj[0]
    if (itemType === 'object' && obj[0] !== null) {
      return jsonToTS(obj[0], name + 'Item') + `\n\ntype ${name} = ${name}Item[]`
    }
    return `type ${name} = ${itemType}[]`
  }
  if (typeof obj === 'object') {
    const lines = Object.entries(obj).map(([key, val]) => {
      const t = inferType(val, key)
      return `  ${key}: ${t}`
    })
    return `interface ${name} {\n${lines.join('\n')}\n}`
  }
  return `type ${name} = ${typeof obj}`
}

function inferType(val: any, key: string): string {
  if (val === null || val === undefined) return 'any'
  if (Array.isArray(val)) {
    if (val.length === 0) return 'any[]'
    return inferType(val[0], key) + '[]'
  }
  if (typeof val === 'object') return jsonToTS(val, capitalize(key)).replace(/^interface \w+ /, '')
  return typeof val
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const yamlOutput = computed(() => {
  const obj = parseJSON(input.value)
  if (obj === null && errorMsg.value) return ''
  return jsonToYAML(obj)
})

function jsonToYAML(obj: any, indent = 0): string {
  const prefix = '  '.repeat(indent)
  if (obj === null || obj === undefined) return 'null'
  if (typeof obj === 'string') return `"${obj.replace(/"/g, '\\"')}"`
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj)
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    return obj.map((item) => `${prefix}- ${jsonToYAML(item, indent + 1).trimStart()}`).join('\n')
  }
  if (typeof obj === 'object') {
    return Object.entries(obj)
      .map(([key, val]) => {
        if (typeof val === 'object' && val !== null && (Array.isArray(val) ? val.length > 0 : true)) {
          return `${prefix}${key}:\n${jsonToYAML(val, indent + 1)}`
        }
        return `${prefix}${key}: ${jsonToYAML(val, indent + 1)}`
      })
      .join('\n')
  }
  return String(obj)
}

const output = computed(() => {
  switch (activeTab.value) {
    case 'format': return formatted.value
    case 'compress': return compressed.value
    case 'ts': return tsInterface.value
    case 'yaml': return yamlOutput.value
  }
})

const isValid = computed(() => {
  parseJSON(input.value)
  return !errorMsg.value
})
</script>

<template>
  <div>
    <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">JSON 格式化 / 压缩 / 校验</h2>

    <!-- Tabs -->
    <div class="mb-4 flex flex-wrap gap-2">
      <button v-for="tab in [
        { key: 'format', label: '格式化' },
        { key: 'compress', label: '压缩' },
        { key: 'ts', label: '转TypeScript' },
        { key: 'yaml', label: '转YAML' }
      ]" :key="tab.key"
        @click="activeTab = tab.key as any"
        :class="activeTab === tab.key
          ? 'bg-indigo-500 text-white'
          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'"
        class="rounded-lg px-4 py-2 text-sm font-medium transition"
      >{{ tab.label }}</button>

      <div v-if="activeTab === 'format'" class="ml-auto flex items-center gap-2">
        <label class="text-sm text-gray-600 dark:text-gray-400">缩进:</label>
        <select v-model.number="indentSize" class="rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
          <option :value="2">2 空格</option>
          <option :value="4">4 空格</option>
        </select>
      </div>
    </div>

    <!-- Validation status -->
    <div class="mb-3 flex items-center gap-2">
      <span v-if="isValid" class="text-sm text-green-600 dark:text-green-400">✓ JSON 格式有效</span>
      <span v-else class="text-sm text-red-500">✗ {{ errorMsg }}</span>
    </div>

    <!-- Editor layout -->
    <div class="grid gap-4 lg:grid-cols-2">
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">输入 JSON</label>
        <textarea v-model="input" rows="18" spellcheck="false"
          class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 outline-none focus:border-indigo-500" />
      </div>
      <div>
        <div class="mb-1 flex items-center justify-between">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">输出结果</label>
          <CopyButton :text="output" />
        </div>
        <textarea :value="output" readonly rows="18" spellcheck="false"
          class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 outline-none" />
      </div>
    </div>

    <!-- Ad slot -->
    <div class="ad-slot mt-6">广告位</div>

    <!-- SEO -->
    <section class="mt-8 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">使用说明</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        在左侧输入框中粘贴JSON数据，工具会实时解析并提供格式化、压缩、转TypeScript接口、转YAML等功能。支持自定义缩进大小（2或4空格）。JSON校验功能会在输入无效时高亮显示错误信息。本工具完全在浏览器端运行，您的数据不会被上传。
      </p>
    </section>
  </div>
</template>
