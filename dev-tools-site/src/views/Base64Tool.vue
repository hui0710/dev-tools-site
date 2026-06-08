<script setup lang="ts">
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const textInput = ref('Hello, World!')
const base64Input = ref('')
const imageBase64 = ref('')
const imagePreview = ref('')

const encoded = computed(() => {
  try {
    return btoa(unescape(encodeURIComponent(textInput.value)))
  } catch { return '' }
})

const decoded = computed(() => {
  try {
    return decodeURIComponent(escape(atob(base64Input.value)))
  } catch { return '无效的Base64字符串' }
})

function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const result = reader.result as string
    imageBase64.value = result
  }
  reader.readAsDataURL(file)
}

function decodeBase64ToImage() {
  const input = base64Input.value.trim()
  if (!input) { imagePreview.value = ''; return }
  if (input.startsWith('data:')) {
    imagePreview.value = input
  } else {
    imagePreview.value = `data:image/png;base64,${input}`
  }
}

function handlePasteImage(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        const reader = new FileReader()
        reader.onload = () => { imageBase64.value = reader.result as string }
        reader.readAsDataURL(file)
      }
    }
  }
}
</script>

<template>
  <div>
    <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Base64 编解码</h2>

    <!-- Text encode/decode -->
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 class="mb-3 font-semibold text-gray-900 dark:text-white">文本 → Base64 编码</h3>
        <textarea v-model="textInput" rows="6" placeholder="输入文本" spellcheck="false"
          class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 outline-none focus:border-indigo-500" />
        <div class="mt-2 flex items-center gap-2">
          <div class="flex-1 break-all rounded bg-gray-100 p-2 font-mono text-xs dark:bg-gray-700 dark:text-gray-300">{{ encoded }}</div>
          <CopyButton :text="encoded" />
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 class="mb-3 font-semibold text-gray-900 dark:text-white">Base64 → 文本 解码</h3>
        <textarea v-model="base64Input" rows="6" placeholder="输入Base64字符串" spellcheck="false"
          class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 outline-none focus:border-indigo-500" />
        <div class="mt-2 flex items-center gap-2">
          <div class="flex-1 break-all rounded bg-gray-100 p-2 font-mono text-xs dark:bg-gray-700 dark:text-gray-300">{{ decoded }}</div>
          <CopyButton :text="decoded" />
        </div>
        <button @click="decodeBase64ToImage" class="mt-2 rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium dark:bg-gray-700 dark:text-gray-300">尝试解码为图片</button>
      </div>
    </div>

    <!-- Image to Base64 -->
    <div class="mt-6 grid gap-4 lg:grid-cols-2">
      <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 class="mb-3 font-semibold text-gray-900 dark:text-white">图片 → Base64</h3>
        <label class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition hover:border-indigo-500 dark:border-gray-600">
          <span class="text-3xl">📁</span>
          <span class="mt-2 text-sm text-gray-500">点击上传图片或粘贴图片</span>
          <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
        </label>
        <div @paste="handlePasteImage" tabindex="0" class="mt-2 text-center text-xs text-gray-400">也可以在此区域Ctrl+V粘贴截图</div>
        <div v-if="imageBase64" class="mt-3">
          <div class="mb-1 flex items-center justify-between">
            <span class="text-xs text-gray-500">Data URL ({{ imageBase64.length }} chars)</span>
            <CopyButton :text="imageBase64" />
          </div>
          <textarea :value="imageBase64" readonly rows="4" spellcheck="false"
            class="w-full rounded-lg border border-gray-300 bg-gray-50 p-2 font-mono text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 outline-none" />
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 class="mb-3 font-semibold text-gray-900 dark:text-white">Base64 → 图片预览</h3>
        <div v-if="imagePreview" class="flex items-center justify-center rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
          <img :src="imagePreview" class="max-h-64 rounded" alt="preview" />
        </div>
        <div v-else class="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-400 dark:border-gray-600">
          输入Base64后点击"尝试解码为图片"
        </div>
      </div>
    </div>

    <div class="ad-slot mt-6">广告位</div>

    <section class="mt-8 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">使用说明</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Base64编解码工具支持文本与Base64之间的互相转换，以及图片文件转Base64 Data URL。支持UTF-8编码的中文文本编码，也支持通过粘贴板直接粘贴截图。图片转Base64常用于前端内联图片、邮件嵌入等场景。
      </p>
    </section>
  </div>
</template>
