<script setup lang="ts">
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const pattern = ref('')
const flags = ref('g')
const testText = ref('')
const error = ref('')

const templates = [
  { name: '手机号', pattern: '1[3-9]\\d{9}' },
  { name: '邮箱', pattern: '[\\w.-]+@[\\w.-]+\\.\\w+' },
  { name: '身份证', pattern: '[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]' },
  { name: 'URL', pattern: 'https?://[\\w\\-._~:/?#\\[\\]@!$&\'()*+,;=%]+' },
  { name: 'IPv4', pattern: '(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)' },
  { name: '中文', pattern: '[\\u4e00-\\u9fa5]+' },
  { name: '日期YYYY-MM-DD', pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])' },
]

function applyTemplate(p: string) {
  pattern.value = p
}

const regex = computed(() => {
  error.value = ''
  if (!pattern.value) return null
  try {
    return new RegExp(pattern.value, flags.value)
  } catch (e: any) {
    error.value = e.message
    return null
  }
})

interface MatchResult {
  full: string
  index: number
  groups: string[]
}

const matches = computed<MatchResult[]>(() => {
  if (!regex.value || !testText.value) return []
  const results: MatchResult[] = []
  const re = new RegExp(regex.value.source, regex.value.flags)

  if (re.flags.includes('g')) {
    let m: RegExpExecArray | null
    while ((m = re.exec(testText.value)) !== null) {
      results.push({ full: m[0], index: m.index, groups: m.slice(1) })
      if (m[0].length === 0) re.lastIndex++
    }
  } else {
    const m = re.exec(testText.value)
    if (m) results.push({ full: m[0], index: m.index, groups: m.slice(1) })
  }
  return results
})

const highlightedHtml = computed(() => {
  if (!regex.value || !testText.value) return escapeHtml(testText.value)
  try {
    const re = new RegExp(regex.value.source, regex.value.flags.includes('g') ? regex.value.flags : regex.value.flags + 'g')
    const text = testText.value
    let result = ''
    let lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      result += escapeHtml(text.slice(lastIndex, m.index))
      result += `<mark class="bg-yellow-300 dark:bg-yellow-600 rounded px-0.5">${escapeHtml(m[0])}</mark>`
      lastIndex = m.index + m[0].length
      if (m[0].length === 0) { re.lastIndex++; lastIndex = re.lastIndex }
    }
    result += escapeHtml(text.slice(lastIndex))
    return result
  } catch { return escapeHtml(testText.value) }
})

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const matchSummary = computed(() => `找到 ${matches.value.length} 个匹配`)
</script>

<template>
  <div>
    <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">正则表达式测试器</h2>

    <!-- Templates -->
    <div class="mb-4">
      <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">常用正则模板</label>
      <div class="flex flex-wrap gap-2">
        <button v-for="t in templates" :key="t.name" @click="applyTemplate(t.pattern)"
          class="rounded-lg bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-indigo-100 hover:text-indigo-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-indigo-900 dark:hover:text-indigo-300">
          {{ t.name }}
        </button>
      </div>
    </div>

    <!-- Regex input -->
    <div class="mb-4 flex gap-2">
      <div class="flex flex-1 items-center rounded-lg border border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
        <span class="pl-3 text-gray-400">/</span>
        <input v-model="pattern" placeholder="输入正则表达式" spellcheck="false"
          class="flex-1 bg-transparent px-1 py-2 font-mono text-sm outline-none dark:text-gray-100" />
        <span class="text-gray-400">/</span>
        <input v-model="flags" class="w-12 bg-transparent px-1 py-2 font-mono text-sm text-indigo-500 outline-none" />
      </div>
    </div>

    <div v-if="error" class="mb-3 text-sm text-red-500">✗ {{ error }}</div>
    <div v-else-if="pattern" class="mb-3 text-sm" :class="matches.length > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'">
      {{ matchSummary }}
    </div>

    <!-- Test text + highlight -->
    <div class="grid gap-4 lg:grid-cols-2">
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">测试文本</label>
        <textarea v-model="testText" rows="12" spellcheck="false"
          class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 outline-none focus:border-indigo-500" />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">匹配高亮</label>
        <div class="min-h-[288px] whitespace-pre-wrap break-all rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" v-html="highlightedHtml"></div>
      </div>
    </div>

    <!-- Match details -->
    <div v-if="matches.length > 0" class="mt-4">
      <div class="mb-2 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">匹配详情</h3>
        <CopyButton :text="matches.map(m => m.full).join('\n')" />
      </div>
      <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table class="w-full text-sm">
          <thead class="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th class="px-3 py-2 text-left">#</th>
              <th class="px-3 py-2 text-left">匹配值</th>
              <th class="px-3 py-2 text-left">位置</th>
              <th class="px-3 py-2 text-left">分组</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(m, i) in matches" :key="i" class="border-t border-gray-200 dark:border-gray-700">
              <td class="px-3 py-2 text-gray-500">{{ i + 1 }}</td>
              <td class="px-3 py-2 font-mono text-indigo-600 dark:text-indigo-400">{{ m.full }}</td>
              <td class="px-3 py-2 text-gray-500">{{ m.index }}</td>
              <td class="px-3 py-2 font-mono text-gray-600 dark:text-gray-400">{{ m.groups.length ? m.groups.join(', ') : '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="ad-slot mt-6">广告位</div>

    <section class="mt-8 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">使用说明</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        输入正则表达式和测试文本，工具会实时高亮匹配结果并显示匹配分组信息。提供手机号、邮箱、身份证、URL等常用正则模板，点击即可使用。支持g(全局)、i(忽略大小写)、m(多行)等标志位。
      </p>
    </section>
  </div>
</template>
