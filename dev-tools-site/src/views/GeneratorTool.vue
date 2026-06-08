<script setup lang="ts">
import { ref, computed } from 'vue'
import CopyButton from '../components/CopyButton.vue'

// UUID
const uuidCount = ref(5)
const uuids = ref<string[]>([])

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function generateUUIDs() {
  uuids.value = Array.from({ length: uuidCount.value }, () => generateUUID())
}

const uuidText = computed(() => uuids.value.join('\n'))

// Password
const pwdLength = ref(16)
const pwdUpper = ref(true)
const pwdLower = ref(true)
const pwdNumbers = ref(true)
const pwdSymbols = ref(true)
const pwdCount = ref(5)
const passwords = ref<string[]>([])

function generatePassword(): string {
  let chars = ''
  if (pwdLower.value) chars += 'abcdefghijklmnopqrstuvwxyz'
  if (pwdUpper.value) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (pwdNumbers.value) chars += '0123456789'
  if (pwdSymbols.value) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz'
  let pwd = ''
  const arr = new Uint32Array(pwdLength.value)
  crypto.getRandomValues(arr)
  for (let i = 0; i < pwdLength.value; i++) {
    pwd += chars[arr[i] % chars.length]
  }
  return pwd
}

function generatePasswords() {
  passwords.value = Array.from({ length: pwdCount.value }, () => generatePassword())
}

const pwdText = computed(() => passwords.value.join('\n'))

// Init
generateUUIDs()
generatePasswords()
</script>

<template>
  <div>
    <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">UUID / 随机密码生成器</h2>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- UUID -->
      <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 class="mb-3 font-semibold text-gray-900 dark:text-white">UUID v4 生成</h3>
        <div class="mb-3 flex items-center gap-2">
          <label class="text-sm text-gray-600 dark:text-gray-400">数量:</label>
          <input type="number" v-model.number="uuidCount" min="1" max="100"
            class="w-20 rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 outline-none" />
          <button @click="generateUUIDs"
            class="rounded-lg bg-indigo-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-600">生成</button>
          <CopyButton :text="uuidText" />
        </div>
        <div class="max-h-64 overflow-y-auto rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
          <div v-for="(uuid, i) in uuids" :key="i" class="flex items-center gap-2 py-1">
            <span class="font-mono text-sm text-gray-900 dark:text-gray-100">{{ uuid }}</span>
          </div>
        </div>
      </div>

      <!-- Password -->
      <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 class="mb-3 font-semibold text-gray-900 dark:text-white">随机密码生成</h3>
        <div class="mb-3 space-y-2">
          <div class="flex items-center gap-3">
            <label class="text-sm text-gray-600 dark:text-gray-400">长度:</label>
            <input type="range" v-model.number="pwdLength" min="4" max="64" class="flex-1" />
            <span class="w-8 text-center font-mono text-sm">{{ pwdLength }}</span>
          </div>
          <div class="flex flex-wrap gap-3 text-sm">
            <label class="flex items-center gap-1 dark:text-gray-300"><input type="checkbox" v-model="pwdUpper" /> 大写</label>
            <label class="flex items-center gap-1 dark:text-gray-300"><input type="checkbox" v-model="pwdLower" /> 小写</label>
            <label class="flex items-center gap-1 dark:text-gray-300"><input type="checkbox" v-model="pwdNumbers" /> 数字</label>
            <label class="flex items-center gap-1 dark:text-gray-300"><input type="checkbox" v-model="pwdSymbols" /> 特殊字符</label>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600 dark:text-gray-400">数量:</label>
            <input type="number" v-model.number="pwdCount" min="1" max="50"
              class="w-20 rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 outline-none" />
            <button @click="generatePasswords"
              class="rounded-lg bg-indigo-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-600">生成</button>
            <CopyButton :text="pwdText" />
          </div>
        </div>
        <div class="max-h-64 overflow-y-auto rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
          <div v-for="(pwd, i) in passwords" :key="i" class="flex items-center gap-2 py-1">
            <span class="font-mono text-sm text-gray-900 dark:text-gray-100">{{ pwd }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="ad-slot mt-6">广告位</div>

    <section class="mt-8 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">使用说明</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        UUID v4生成器支持一次生成多个UUID，适用于数据库主键、API密钥等场景。随机密码生成器可自定义长度（4-64位）和字符类型（大小写字母、数字、特殊字符），使用crypto.getRandomValues确保密码安全随机。支持一键复制所有结果。
      </p>
    </section>
  </div>
</template>
