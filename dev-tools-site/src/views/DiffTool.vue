<script setup lang="ts">
import { ref, computed } from 'vue'
import * as Diff from 'diff'
import CopyButton from '../components/CopyButton.vue'

const leftText = ref(`function greet(name) {
  console.log("Hello, " + name)
  return true
}

const users = ["Alice", "Bob"]
users.forEach(greet)`)

const rightText = ref(`function greet(name: string) {
  console.log(\`Hello, \${name}!\`)
  return true
}

const users = ["Alice", "Bob", "Charlie"]
users.forEach(greet)
console.log("Done")`)

interface DiffLine {
  type: 'same' | 'add' | 'remove'
  text: string
  leftNum?: number
  rightNum?: number
}

const diffResult = computed<DiffLine[]>(() => {
  if (!leftText.value && !rightText.value) return []
  const changes = Diff.diffLines(leftText.value, rightText.value)
  const lines: DiffLine[] = []
  let leftNum = 0
  let rightNum = 0

  for (const part of changes) {
    const partLines = part.value.split('\n').filter((_, i, arr) => i < arr.length - 1 || arr[arr.length - 1] !== '')

    if (part.added) {
      for (const line of partLines) {
        rightNum++
        lines.push({ type: 'add', text: line, rightNum })
      }
    } else if (part.removed) {
      for (const line of partLines) {
        leftNum++
        lines.push({ type: 'remove', text: line, leftNum })
      }
    } else {
      for (const line of partLines) {
        leftNum++
        rightNum++
        lines.push({ type: 'same', text: line, leftNum, rightNum })
      }
    }
  }
  return lines
})

const stats = computed(() => {
  const adds = diffResult.value.filter(l => l.type === 'add').length
  const removes = diffResult.value.filter(l => l.type === 'remove').length
  return { adds, removes }
})
</script>

<template>
  <div>
    <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">文本对比工具</h2>

    <!-- Stats -->
    <div class="mb-4 flex gap-4 text-sm">
      <span class="text-green-600 dark:text-green-400">+{{ stats.adds }} 新增</span>
      <span class="text-red-500">-{{ stats.removes }} 删除</span>
    </div>

    <!-- Input -->
    <div class="mb-6 grid gap-4 lg:grid-cols-2">
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">原始文本</label>
        <textarea v-model="leftText" rows="10" spellcheck="false"
          class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 outline-none focus:border-indigo-500" />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">修改后文本</label>
        <textarea v-model="rightText" rows="10" spellcheck="false"
          class="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 outline-none focus:border-indigo-500" />
      </div>
    </div>

    <!-- Diff output -->
    <div class="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
      <div class="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-700">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">对比结果</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full font-mono text-sm">
          <tbody>
            <tr v-for="(line, i) in diffResult" :key="i"
              :class="{
                'bg-gray-50 dark:bg-gray-800': line.type === 'same',
                'bg-green-50 dark:bg-green-950': line.type === 'add',
                'bg-red-50 dark:bg-red-950': line.type === 'remove',
              }">
              <td class="w-10 select-none border-r border-gray-200 px-2 py-0.5 text-right text-xs text-gray-400 dark:border-gray-700">
                {{ line.leftNum ?? '' }}
              </td>
              <td class="w-10 select-none border-r border-gray-200 px-2 py-0.5 text-right text-xs text-gray-400 dark:border-gray-700">
                {{ line.rightNum ?? '' }}
              </td>
              <td class="w-6 select-none px-2 py-0.5 text-center">
                <span v-if="line.type === 'add'" class="text-green-600">+</span>
                <span v-else-if="line.type === 'remove'" class="text-red-500">-</span>
              </td>
              <td class="whitespace-pre px-2 py-0.5"
                :class="{
                  'text-gray-900 dark:text-gray-100': line.type === 'same',
                  'text-green-700 dark:text-green-300': line.type === 'add',
                  'text-red-600 dark:text-red-300': line.type === 'remove',
                }">{{ line.text }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="ad-slot mt-6">广告位</div>

    <section class="mt-8 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">使用说明</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        文本对比工具基于逐行差异算法，高亮显示两段文本之间的差异。绿色表示新增行，红色表示删除行。左右两侧显示对应行号，方便定位修改位置。适用于代码审查、文档版本对比等场景。
      </p>
    </section>
  </div>
</template>
