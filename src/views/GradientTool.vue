<script setup lang="ts">
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const type = ref<'linear' | 'radial'>('linear')
const angle = ref(90)
const colors = ref([
  { color: '#6366F1', stop: 0 },
  { color: '#EC4899', stop: 100 },
])

function addColor() {
  const lastStop = colors.value[colors.value.length - 1]?.stop ?? 100
  const newStop = Math.round((colors.value[colors.value.length - 1]?.stop ?? 0) / 2 + (lastStop) / 2) || 50
  colors.value.push({ color: '#10B981', stop: Math.min(newStop, 100) })
}

function removeColor(idx: number) {
  if (colors.value.length <= 2) return
  colors.value.splice(idx, 1)
}

const cssCode = computed(() => {
  const stops = colors.value.map(c => `${c.color} ${c.stop}%`).join(', ')
  if (type.value === 'linear') {
    return `background: linear-gradient(${angle.value}deg, ${stops});`
  }
  return `background: radial-gradient(circle, ${stops});`
})

const previewStyle = computed(() => ({
  background: type.value === 'linear'
    ? `linear-gradient(${angle.value}deg, ${colors.value.map(c => `${c.color} ${c.stop}%`).join(', ')})`
    : `radial-gradient(circle, ${colors.value.map(c => `${c.color} ${c.stop}%`).join(', ')})`
}))

const directions = [
  { label: '→', value: 90 },
  { label: '←', value: 270 },
  { label: '↓', value: 180 },
  { label: '↑', value: 0 },
  { label: '↘', value: 135 },
  { label: '↗', value: 45 },
  { label: '↙', value: 225 },
  { label: '↖', value: 315 },
]
</script>

<template>
  <div>
    <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">CSS 渐变生成器</h2>

    <!-- Preview -->
    <div class="mb-6 h-48 rounded-xl border border-gray-200 dark:border-gray-700" :style="previewStyle"></div>

    <!-- Controls -->
    <div class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2 space-y-4">
        <!-- Type -->
        <div class="flex gap-2">
          <button @click="type = 'linear'"
            :class="type === 'linear' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'"
            class="rounded-lg px-4 py-2 text-sm font-medium transition">线性渐变 linear-gradient</button>
          <button @click="type = 'radial'"
            :class="type === 'radial' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'"
            class="rounded-lg px-4 py-2 text-sm font-medium transition">径向渐变 radial-gradient</button>
        </div>

        <!-- Direction (linear only) -->
        <div v-if="type === 'linear'" class="flex flex-wrap items-center gap-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">方向:</label>
          <button v-for="d in directions" :key="d.value" @click="angle = d.value"
            :class="angle === d.value ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'"
            class="rounded px-3 py-1.5 text-sm transition">{{ d.label }} {{ d.value }}°</button>
          <div class="flex items-center gap-1">
            <input type="number" v-model.number="angle" min="0" max="360"
              class="w-16 rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
            <span class="text-sm text-gray-500">°</span>
          </div>
        </div>

        <!-- Colors -->
        <div>
          <div class="mb-2 flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">颜色节点</label>
            <button @click="addColor" class="rounded-lg bg-gray-200 px-3 py-1 text-xs font-medium dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300">+ 添加颜色</button>
          </div>
          <div class="space-y-2">
            <div v-for="(c, i) in colors" :key="i" class="flex items-center gap-2">
              <input type="color" v-model="c.color" class="h-8 w-10 cursor-pointer rounded" />
              <input :value="c.color" @input="c.color = ($event.target as HTMLInputElement).value"
                class="w-24 rounded border border-gray-300 bg-gray-50 px-2 py-1 font-mono text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
              <input type="range" v-model.number="c.stop" min="0" max="100" class="flex-1" />
              <span class="w-10 text-center font-mono text-xs text-gray-500">{{ c.stop }}%</span>
              <button v-if="colors.length > 2" @click="removeColor(i)" class="text-red-400 hover:text-red-600">✕</button>
            </div>
          </div>
        </div>
      </div>

      <!-- CSS Output -->
      <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div class="mb-2 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">CSS 代码</h3>
          <CopyButton :text="cssCode" />
        </div>
        <pre class="whitespace-pre-wrap break-all rounded-lg bg-gray-100 p-3 font-mono text-xs dark:bg-gray-700 dark:text-gray-300">{{ cssCode }}</pre>
      </div>
    </div>

    <div class="ad-slot mt-6">广告位</div>

    <section class="mt-8 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">使用说明</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        CSS渐变生成器支持线性渐变（linear-gradient）和径向渐变（radial-gradient）。可自定义渐变方向（8个预设方向或自定义角度）、颜色节点数量和位置。实时预览渐变效果，一键复制CSS代码。
      </p>
    </section>
  </div>
</template>
