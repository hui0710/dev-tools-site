<script setup lang="ts">
defineProps<{
  name: string
  icon: string
  description: string
  path: string
}>()
</script>

<template>
  <router-link
    :to="path"
    class="group block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
  >
    <div class="mb-3 text-3xl">{{ icon }}</div>
    <h3 class="mb-1 text-base font-semibold text-gray-900 group-hover:text-indigo-500 dark:text-gray-100 dark:group-hover:text-indigo-400">
      {{ name }}
    </h3>
    <p class="text-sm text-gray-500 dark:text-gray-400">{{ description }}</p>
  </router-link>
</template>
