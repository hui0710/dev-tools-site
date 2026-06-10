<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import { tools } from './config/tools'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const isHome = computed(() => route.path === '/')
const currentTool = computed(() => tools.find((t) => t.path === route.path))
</script>

<template>
  <div class="min-h-screen">
    <AppHeader />

    <!-- Breadcrumb for tool pages -->
    <nav v-if="!isHome" class="mx-auto max-w-7xl px-4 py-3">
      <ol class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <li><router-link to="/" class="hover:text-indigo-500">首页</router-link></li>
        <li>/</li>
        <li class="text-gray-900 dark:text-gray-100">{{ currentTool?.name }}</li>
      </ol>
    </nav>

    <main class="mx-auto max-w-7xl px-4 py-4">
      <router-view />
    </main>

    <!-- Sidebar quick nav for tool pages -->
    <aside v-if="!isHome" class="fixed left-0 top-1/2 z-40 hidden -translate-y-1/2 xl:block">
      <nav class="flex flex-col gap-1 rounded-r-lg bg-white/80 p-2 shadow backdrop-blur dark:bg-gray-800/80">
        <router-link
          v-for="tool in tools"
          :key="tool.path"
          :to="tool.path"
          :title="tool.name"
          class="rounded-md px-2 py-1.5 text-lg transition hover:bg-indigo-50 dark:hover:bg-gray-700"
          :class="route.path === tool.path ? 'bg-indigo-100 dark:bg-indigo-900/30' : ''"
        >
          {{ tool.icon }}
        </router-link>
      </nav>
    </aside>

    <footer class="mt-12 border-t border-gray-200 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
      <p>本站工具仅供开发参考使用，不保证结果的绝对准确性。</p>
      <p class="mt-2">© 2024 开发者在线工具集合 - 免费前端开发工具，纯前端计算，数据安全</p>
    </footer>
  </div>
</template>
