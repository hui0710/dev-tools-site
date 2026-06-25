<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const timestampInput = ref('')
const dateInput = ref('')
const timeInput = ref('')
const unit = ref<'s' | 'ms'>('s')
const timezone = ref('local')
const now = ref(Date.now())
let timer: number

onMounted(() => { timer = window.setInterval(() => { now.value = Date.now() }, 1000) })
onUnmounted(() => clearInterval(timer))

const timezones = [
  { label: '本地时间', value: 'local' },
  { label: 'UTC', value: 'UTC' },
  { label: '北京 (UTC+8)', value: 'Asia/Shanghai' },
  { label: '东京 (UTC+9)', value: 'Asia/Tokyo' },
  { label: '纽约 (UTC-5)', value: 'America/New_York' },
  { label: '伦敦 (UTC+0)', value: 'Europe/London' },
]

const currentTimestamp = computed(() => {
  return unit.value === 's' ? Math.floor(now.value / 1000) : now.value
})

const currentReadable = computed(() => {
  return formatDate(new Date(now.value))
})

function formatDate(d: Date): string {
  if (!d || isNaN(d.getTime())) return ''
  if (timezone.value === 'local') {
    return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  }
  return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: timezone.value })
}

const tsToDate = computed(() => {
  if (!timestampInput.value) return ''
  const num = Number(timestampInput.value)
  if (isNaN(num)) return '无效的时间戳'
  const ms = unit.value === 's' ? num * 1000 : num
  const d = new Date(ms)
  if (isNaN(d.getTime())) return '无效的时间戳'
  return formatDate(d)
})

const dateToTs = computed(() => {
  if (!dateInput.value) return ''
  const d = new Date(dateInput.value + (timeInput.value ? 'T' + timeInput.value : 'T00:00:00'))
  if (isNaN(d.getTime())) return ''
  const ms = d.getTime()
  return unit.value === 's' ? Math.floor(ms / 1000) : ms
})

function fillNow() {
  timestampInput.value = String(currentTimestamp.value)
}

function fillNowDate() {
  const d = new Date(now.value)
  dateInput.value = d.toISOString().slice(0, 10)
  timeInput.value = d.toTimeString().slice(0, 8)
}
</script>

<template>
  <div>
    <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">时间戳转换</h2>

    <!-- Options -->
    <div class="mb-6 flex flex-wrap gap-4">
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">单位:</label>
        <select v-model="unit" class="rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
          <option value="s">秒 (s)</option>
          <option value="ms">毫秒 (ms)</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">时区:</label>
        <select v-model="timezone" class="rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
          <option v-for="tz in timezones" :key="tz.value" :value="tz.value">{{ tz.label }}</option>
        </select>
      </div>
    </div>

    <!-- Current time -->
    <div class="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950">
      <div class="text-sm text-gray-600 dark:text-gray-400">当前时间</div>
      <div class="mt-1 text-xl font-bold text-indigo-600 dark:text-indigo-400">{{ currentTimestamp }}</div>
      <div class="text-sm text-gray-500 dark:text-gray-400">{{ currentReadable }}</div>
    </div>

    <!-- Timestamp → Date -->
    <div class="mb-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h3 class="mb-3 font-semibold text-gray-900 dark:text-white">时间戳 → 可读时间</h3>
      <div class="flex flex-wrap gap-2">
        <input v-model="timestampInput" type="text" placeholder="输入时间戳"
          class="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 outline-none focus:border-indigo-500" />
        <button @click="fillNow" class="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">填入当前</button>
      </div>
      <div class="mt-3 flex items-center gap-2">
        <span class="text-lg font-medium text-gray-900 dark:text-white">{{ tsToDate }}</span>
        <CopyButton v-if="tsToDate && !tsToDate.includes('无效')" :text="tsToDate" />
      </div>
    </div>

    <!-- Date → Timestamp -->
    <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h3 class="mb-3 font-semibold text-gray-900 dark:text-white">可读时间 → 时间戳</h3>
      <div class="flex flex-wrap gap-2">
        <input v-model="dateInput" type="date" class="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 outline-none focus:border-indigo-500" />
        <input v-model="timeInput" type="time" step="1" class="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 outline-none focus:border-indigo-500" />
        <button @click="fillNowDate" class="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">填入当前</button>
      </div>
      <div class="mt-3 flex items-center gap-2">
        <span class="text-lg font-mono font-medium text-gray-900 dark:text-white">{{ dateToTs }}</span>
        <CopyButton v-if="dateToTs" :text="String(dateToTs)" />
      </div>
    </div>

    <div class="ad-slot mt-6">广告位</div>

    <section class="mt-8 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">使用说明</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        时间戳转换工具支持Unix时间戳（秒）和毫秒级时间戳与可读时间之间的双向转换。可选择不同单位（秒/毫秒）和时区（本地、UTC、北京、东京等）。实时显示当前时间戳，方便快速获取。
      </p>
    </section>
  </div>
</template>
