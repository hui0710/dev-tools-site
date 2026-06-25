<script setup lang="ts">
import { useTheme } from '../composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
      <router-link to="/" class="flex items-center gap-2 text-lg font-bold text-indigo-500">
        <span class="text-2xl">🛠️</span>
        <span>DevTools</span>
      </router-link>
      <div class="flex items-center gap-3">
        <button
          @click="toggleTheme"
          class="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          :title="isDark ? '切换到亮色模式' : '切换到暗色模式'"
        >
          <span v-if="isDark">☀️</span>
          <span v-else>🌙</span>
        </button>
        <a
          href="https://github.com"
          target="_blank"
          class="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          ⭐
        </a>
      </div>
    </div>
  </header>
</template>
