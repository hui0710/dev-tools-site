<template>
  <div>
    <h3 class="text-sm font-semibold text-gray-700 mb-3">美颜调节</h3>

    <div class="space-y-4">
      <div v-for="item in sliders" :key="item.key">
        <div class="flex justify-between items-center mb-1">
          <label class="text-xs text-gray-600">{{ item.label }}</label>
          <span class="text-xs text-gray-400 tabular-nums">{{ params[item.key] }}%</span>
        </div>
        <input
          type="range"
          min="-50"
          max="50"
          :value="params[item.key]"
          class="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
          @input="(e) => updateParam(item.key, Number((e.target as HTMLInputElement).value))"
        />
        <div class="flex justify-between text-[10px] text-gray-400 mt-0.5">
          <span>-50</span>
          <button
            class="text-primary hover:text-primary-hover"
            @click="updateParam(item.key, 0)"
          >
            重置
          </button>
          <span>+50</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BeautyParams } from '../types'

const props = defineProps<{
  params: BeautyParams
}>()

const emit = defineEmits<{
  (e: 'update', params: BeautyParams): void
}>()

const sliders: { key: keyof BeautyParams; label: string }[] = [
  { key: 'brightness', label: '亮度' },
  { key: 'contrast', label: '对比度' },
  { key: 'smooth', label: '磨皮' }
]

function updateParam(key: keyof BeautyParams, value: number) {
  emit('update', { ...props.params, [key]: value })
}
</script>
