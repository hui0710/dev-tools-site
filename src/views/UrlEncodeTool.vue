<script setup lang="ts">
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const input = ref('')
const mode = ref<'component' | 'uri'>('component')

const encoded = computed(() => {
  if (!input.value) return ''
  try {
    return mode.value === 'component'
      ? encodeURIComponent(input.value)
      : encodeURI(input.value)
  } catch { return '' }
})

const decoded = computed(() => {
  if (!input.value) return ''
  try {
    return mode.value === 'component'
      ? decodeURIComponent(input.value)
      : decodeURI(input.value)
  } catch { return '解码失败：无效的编码字符串' }
})

const batchInput = ref('')
const batchResult = computed(() => {
  if (!batchInput.value) return ''
  return batchInput.value.split('\n').map(line => {
    try {
      return mode.value === 'component' ? encodeURIComponent(line) : encodeURI(line)
    } catch { return line }
  }).join('\n')
})

const batchDecoded = computed(() => {
  if (!batchInput.value) return ''
  return batchInput.value.split('\n').map(line => {
    try {
      return mode.value === 'component' ? decodeURIComponent(line) : decodeURI(line)
    } catch { return line }
  }).join('\n')
})

const batchMode = ref<'encode' | 'decode'>('encode')
const batchOutput = computed(() => batchMode.value === 'encode' ? batchResult.value : batchDecoded.value)
</script>

<template>
  <div>
    <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">URL 编解码</h2>

    <div class="mb-4 flex gap-2">
      <button @click="mode = 'component'"
        :class="mode === 'component' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'"
        class="rounded-lg px-4 py-2 text-sm font-medium transition">encodeURIComponent</button>
      <button @click="mode = 'uri'"
        :class="mode === 'uri' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'"
        class="rounded-lg px-4 py-2 text-sm font-medium transition">encodeURI</button>
    </div>

    <!-- Single -->
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 class="mb-3 font-semibold text-gray-900 dark:text-white">编码</h3>
        <textarea v-model="input" rows="4" placeholder="输入URL或文本" spellcheck="false"
          class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 outline-none focus:border-indigo-500" />
        <div class="mt-2 flex items-start gap-2">
          <div class="flex-1 break-all rounded bg-gray-100 p-2 font-mono text-xs dark:bg-gray-700 dark:text-gray-300">{{ encoded }}</div>
          <CopyButton :text="encoded" />
        </div>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 class="mb-3 font-semibold text-gray-900 dark:text-white">解码</h3>
        <div class="mb-2 text-xs text-gray-500">在左侧输入编码字符串，此处显示解码结果</div>
        <div class="flex items-start gap-2">
          <div class="flex-1 break-all rounded bg-gray-100 p-2 font-mono text-xs dark:bg-gray-700 dark:text-gray-300">{{ decoded }}</div>
          <CopyButton :text="decoded" />
        </div>
      </div>
    </div>

    <!-- Batch -->
    <div class="mt-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="font-semibold text-gray-900 dark:text-white">批量处理（每行一个）</h3>
        <div class="flex gap-2">
          <button @click="batchMode = 'encode'"
            :class="batchMode === 'encode' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'"
            class="rounded px-3 py-1 text-xs font-medium transition">批量编码</button>
          <button @click="batchMode = 'decode'"
            :class="batchMode === 'decode' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'"
            class="rounded px-3 py-1 text-xs font-medium transition">批量解码</button>
        </div>
      </div>
      <div class="grid gap-4 lg:grid-cols-2">
        <textarea v-model="batchInput" rows="6" placeholder="每行输入一个URL或文本" spellcheck="false"
          class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 outline-none focus:border-indigo-500" />
        <div>
          <div class="mb-1 flex items-center justify-between">
            <span class="text-sm text-gray-500">结果</span>
            <CopyButton :text="batchOutput" />
          </div>
          <textarea :value="batchOutput" readonly rows="6" spellcheck="false"
            class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 outline-none" />
        </div>
      </div>
    </div>

    <div class="ad-slot mt-6">广告位</div>

    <section class="mt-8 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">使用说明</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        URL编解码工具支持encodeURIComponent和encodeURI两种编码模式。encodeURIComponent会编码所有特殊字符，适合编码URL参数值；encodeURI保留URL结构字符（:/?#等），适合编码完整URL。支持批量处理，每行一条数据。
      </p>
    </section>
  </div>
</template>
