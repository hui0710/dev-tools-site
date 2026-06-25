<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import CopyButton from '../components/CopyButton.vue'

const hexInput = ref('#6366F1')
const colorPickerValue = ref('#6366F1')

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!m) return null
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100
  if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v } }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return {
    r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
  }
}

const rgb = computed(() => hexToRgb(hexInput.value))
const hsl = computed(() => rgb.value ? rgbToHsl(rgb.value.r, rgb.value.g, rgb.value.b) : null)

const hexStr = computed(() => hexInput.value.toUpperCase())
const rgbStr = computed(() => rgb.value ? `rgb(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b})` : '')
const hslStr = computed(() => hsl.value ? `hsl(${hsl.value.h}, ${hsl.value.s}%, ${hsl.value.l}%)` : '')
const cssVar = computed(() => `--color-primary: ${hexInput.value};\n--color-primary-rgb: ${rgb.value?.r}, ${rgb.value?.g}, ${rgb.value?.b};`)

watch(colorPickerValue, (v) => { hexInput.value = v })
watch(hexInput, (v) => { if (/^#[0-9a-f]{6}$/i.test(v)) colorPickerValue.value = v })
</script>

<template>
  <div>
    <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">颜色格式转换</h2>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Color picker + preview -->
      <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 class="mb-3 font-semibold text-gray-900 dark:text-white">颜色选择</h3>
        <div class="mb-4 h-32 rounded-xl border border-gray-200 dark:border-gray-600" :style="{ backgroundColor: hexInput }"></div>
        <input type="color" v-model="colorPickerValue" class="h-12 w-full cursor-pointer rounded-lg" />
        <div class="mt-3">
          <label class="text-sm text-gray-500">HEX 输入</label>
          <input v-model="hexInput" class="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 outline-none focus:border-indigo-500" />
        </div>
      </div>

      <!-- Color values -->
      <div class="lg:col-span-2 space-y-3">
        <div v-for="(item, idx) in [
          { label: 'HEX', value: hexStr },
          { label: 'RGB', value: rgbStr },
          { label: 'HSL', value: hslStr },
          { label: 'CSS 变量', value: cssVar },
        ]" :key="idx"
          class="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div>
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ item.label }}</div>
            <div class="mt-1 font-mono text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{{ item.value }}</div>
          </div>
          <CopyButton :text="item.value" />
        </div>
      </div>
    </div>

    <div class="ad-slot mt-6">广告位</div>

    <section class="mt-8 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">使用说明</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        颜色转换工具支持HEX、RGB、HSL三种颜色格式之间的互相转换。可通过颜色选择器可视化选色，实时查看各格式值。自动生成CSS自定义属性代码，方便在项目中直接使用。
      </p>
    </section>
  </div>
</template>
