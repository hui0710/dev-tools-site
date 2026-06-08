<template>
  <div>
    <h3 class="text-sm font-semibold text-gray-700 mb-3">选择尺寸</h3>

    <!-- 分类Tab -->
    <div class="flex gap-1 mb-3 bg-gray-100 rounded-lg p-1">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="flex-1 py-1.5 px-3 text-xs rounded-md transition-all font-medium"
        :class="activeCategory === cat.id
          ? 'bg-white text-primary shadow-sm'
          : 'text-gray-500 hover:text-gray-700'"
        @click="activeCategory = cat.id"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- 尺寸卡片网格 -->
    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="size in filteredSizes"
        :key="size.id"
        class="relative p-3 rounded-lg border-2 text-left transition-all"
        :class="selected.id === size.id
          ? 'border-primary bg-primary-light'
          : 'border-gray-200 hover:border-gray-300 bg-white'"
        @click="emit('select', size)"
      >
        <div class="flex items-center gap-2 mb-1">
          <div
            class="w-6 h-8 rounded-sm border flex-shrink-0"
            :class="selected.id === size.id ? 'border-primary' : 'border-gray-300'"
            :style="{ aspectRatio: size.widthMm + '/' + size.heightMm }"
          ></div>
          <span class="text-sm font-medium" :class="selected.id === size.id ? 'text-primary' : 'text-gray-700'">
            {{ size.name }}
          </span>
        </div>
        <p class="text-xs text-gray-400">
          {{ size.widthMm }}×{{ size.heightMm }}mm
        </p>
        <p class="text-xs text-gray-400">
          {{ size.widthPx }}×{{ size.heightPx }}px
        </p>

        <!-- 选中标记 -->
        <div
          v-if="selected.id === size.id"
          class="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
        >
          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PhotoSize } from '../types'

const props = defineProps<{
  sizes: PhotoSize[]
  selected: PhotoSize
}>()

const emit = defineEmits<{
  (e: 'select', size: PhotoSize): void
}>()

const categories = [
  { id: 'common', name: '常用' },
  { id: 'passport', name: '护照' },
  { id: 'visa', name: '签证' }
]

const activeCategory = ref('common')

const filteredSizes = computed(() =>
  props.sizes.filter(s => s.category === activeCategory.value)
)
</script>
