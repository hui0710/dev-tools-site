<script setup lang="ts">
import ToolCard from '../components/ToolCard.vue'
import { tools } from '../config/tools'
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="py-12 text-center">
      <h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white">开发者在线工具集合</h1>
      <p class="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
        免费、快速、安全的前端开发工具集。纯前端运行，数据不会离开您的浏览器。
      </p>
    </section>

    <!-- Tool Grid -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <template v-for="(tool, idx) in tools" :key="tool.path">
        <ToolCard :name="tool.name" :icon="tool.icon" :description="tool.description" :path="tool.path" />
        <!-- Ad slot after 4th tool card -->
        <div v-if="idx === 3" class="ad-slot sm:col-span-2 lg:col-span-1">
          <span>广告位</span>
        </div>
      </template>
    </section>

    <!-- SEO content -->
    <section class="mt-16 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 class="mb-3 text-xl font-semibold text-gray-900 dark:text-white">关于开发者工具集合</h2>
      <div class="space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        <p>本站提供一系列免费的在线开发工具，包括JSON格式化与校验、正则表达式测试、时间戳转换、Base64编解码、URL编解码、颜色格式转换、UUID与密码生成、Markdown实时预览、CSS渐变生成器以及文本差异对比工具。</p>
        <p>所有工具均在浏览器端运行，您的数据不会发送到任何服务器，确保数据安全。每个工具支持一键复制结果，提高开发效率。</p>
        <p>适合前端开发者、后端开发者、测试工程师以及所有需要快速处理数据的开发者使用。无需注册，打开即用。</p>
      </div>
    </section>
  </div>
</template>
