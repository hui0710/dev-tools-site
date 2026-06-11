# Vue3 + uni-app 开发微信小程序完整指南（2025最新）

> 2025年了，还有人问"uni-app值不值得学"。我的回答是：如果你需要一套代码同时跑小程序和H5，它依然是最务实的选择。这篇文章从项目初始化到打包发布，手把手走一遍完整流程，代码都来自真实项目。

## 为什么选 Vue3 + uni-app

先客观对比一下主流方案：

| 方案 | 多端支持 | Vue3 支持 | 学习成本 | 生态成熟度 |
|------|---------|----------|---------|-----------|
| 原生微信小程序 | 仅微信 | 不适用 | 低 | 微信官方 |
| Taro 3.x | 多端 | 支持 | 中 | 京东维护 |
| uni-app | 多端 | 支持 | 低 | DCloud维护 |
| mpx | 多端 | 支持 | 高 | 滴滴维护 |

选 uni-app 的理由很简单：

1. **模板语法就是 Vue**，会 Vue3 就能用，不需要学 React（Taro）或微信原生语法
2. **条件编译**优雅地解决了跨平台差异，比 Taro 的环境判断更直观
3. **HBuilderX + CLI 两种模式**都支持，用 VS Code / Cursor 开发完全没问题
4. **插件市场**丰富，UI 组件、支付、分享这些常见需求都有现成方案

## 项目初始化和目录结构

### 创建项目

推荐用 CLI 方式创建，不用 HBuilderX：

```bash
npx degit dcloudio/uni-preset-vue#vite-ts my-project
cd my-project
pnpm install
```

这会创建一个 Vue3 + Vite + TypeScript 的 uni-app 项目模板。

### 推荐的目录结构

经过5个项目的实践，我总结出一套比较成熟的目录组织方式：

```
src/
├── components/        # 公共组件
│   ├── AdReward.vue       # 激励视频广告组件
│   ├── QuotaBar.vue       # 配额进度条
│   └── TypeWriter.vue     # 打字机效果
├── composables/       # 组合式函数（核心逻辑）
│   ├── useAI.ts           # AI调用逻辑
│   ├── useAd.ts           # 广告加载逻辑
│   ├── useQuota.ts        # 配额管理逻辑
│   └── useCutout.ts       # 抠图核心逻辑
├── config/            # 配置文件
│   └── scenes.ts          # 业务场景配置
├── pages/             # 页面
│   ├── index/             # 首页
│   ├── result/            # 结果页
│   └── mine/              # 我的
├── services/          # API 服务层
│   └── api.ts              # 接口封装
├── stores/            # Pinia 状态管理
│   └── app.ts             # 全局状态
├── types/             # TypeScript 类型
│   └── index.ts
├── utils/             # 工具函数
│   ├── storage.ts          # 存储封装
│   └── image.ts            # 图片处理工具
├── static/            # 静态资源
├── App.vue            # 根组件
├── main.ts            # 入口文件
├── manifest.json      # 应用配置
├── pages.json         # 页面路由配置
└── uni.scss           # 全局样式变量
```

关键设计思路：

- **composables 是核心**：每个业务逻辑模块抽取为独立的 composable，页面只负责组合和展示
- **services 和 composables 分离**：services 负责纯 API 调用，composables 负责业务逻辑和状态管理
- **config 外置**：场景配置、业务常量等抽取为独立文件，方便维护

## 组件开发实践

### 组合式 API + TypeScript 的标准写法

以一个典型的 composable 为例——每日配额管理：

```typescript
// composables/useQuota.ts
import { ref, computed } from 'vue'

const DAILY_FREE_LIMIT = 3

export function useQuota() {
  const remainQuota = ref(DAILY_FREE_LIMIT)
  const usedCount = computed(() => DAILY_FREE_LIMIT - remainQuota.value)
  const hasQuota = computed(() => remainQuota.value > 0)

  /** 初始化配额（App启动时调用） */
  function initQuota() {
    const today = new Date().toDateString()
    const saved = uni.getStorageSync('quota_date')
    if (saved !== today) {
      // 新的一天，重置配额
      uni.setStorageSync('quota_date', today)
      uni.setStorageSync('quota_used', 0)
      remainQuota.value = DAILY_FREE_LIMIT
    } else {
      const used = uni.getStorageSync('quota_used') || 0
      remainQuota.value = DAILY_FREE_LIMIT - used
    }
  }

  /** 消耗一次配额 */
  function useQuota() {
    const used = uni.getStorageSync('quota_used') || 0
    uni.setStorageSync('quota_used', used + 1)
    remainQuota.value = DAILY_FREE_LIMIT - used - 1
  }

  /** 看广告增加配额 */
  function gainQuota(count = 1) {
    const used = uni.getStorageSync('quota_used') || 0
    const newUsed = Math.max(0, used - count)
    uni.setStorageSync('quota_used', newUsed)
    remainQuota.value = DAILY_FREE_LIMIT - newUsed
  }

  return { remainQuota, usedCount, hasQuota, initQuota, useQuota, gainQuota }
}
```

在页面组件中使用：

```vue
<!-- pages/index/index.vue -->
<template>
  <view class="container">
    <QuotaBar :remain="remainQuota" :total="3" />
    <button @click="handleProcess" :disabled="!hasQuota">
      开始处理
    </button>
  </view>
</template>

<script setup lang="ts">
import { useQuota } from '@/composables/useQuota'
import QuotaBar from '@/components/QuotaBar.vue'

const { remainQuota, hasQuota, useQuota } = useQuota()

async function handleProcess() {
  if (!hasQuota.value) {
    uni.showToast({ title: '今日次数已用完', icon: 'none' })
    return
  }
  // ... 业务逻辑
  useQuota()
}
</script>
```

### 条件编译处理平台差异

uni-app 的条件编译是处理多端差异的利器。最常见的场景是 API 调用的平台适配：

```typescript
// services/api.ts - 流式请求的双端适配

export function chatCompletionStream(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (error: Error) => void
): () => void {
  let aborted = false
  let fullText = ''

  // #ifdef H5
  // H5端：使用原生 fetch + ReadableStream
  ;(async () => {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: buildAuthHeader(),
        body: JSON.stringify({ model: MODEL, messages, stream: true })
      })
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      while (true) {
        if (aborted) { reader?.cancel(); break }
        const { done, value } = await reader!.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.trim())
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) { fullText += content; onChunk(content) }
          }
        }
      }
      if (!aborted) onDone(fullText)
    } catch (e: any) {
      if (!aborted) onError(e)
    }
  })()
  // #endif

  // #ifdef MP-WEIXIN
  // 小程序端：使用 uni.request + onChunkReceived
  const task = uni.request({
    url: API_BASE,
    method: 'POST',
    enableChunkedTransfer: true,
    header: buildAuthHeader(),
    data: { model: MODEL, messages, stream: true },
    success: (res) => {
      if (res.statusCode !== 200 && !aborted) {
        onError(new Error(`请求失败: ${res.statusCode}`))
      }
    },
    fail: (err) => {
      if (!aborted) onError(new Error(err.errMsg || '请求失败'))
    }
  }) as any

  if (task?.onChunkReceived) {
    let buffer = ''
    task.onChunkReceived((res: any) => {
      if (aborted) return
      const text = arrayBufferToString(res.data)
      buffer += text
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      // ... SSE 解析逻辑
    })
  }
  // #endif

  return () => { aborted = true }
}
```

这种写法的好处是：**同一份代码，编译时自动选择对应平台的实现**，运行时零开销。

## 状态管理

### Pinia 在 uni-app 中的使用

uni-app 的 Vue3 版本原生支持 Pinia，配置很简单：

```typescript
// main.ts
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  return { app }
}
```

### Store 的标准写法

推荐使用 Setup Store 风格（组合式 API），比 Option Store 更灵活，TypeScript 支持更好：

```typescript
// stores/game.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameState, Question } from '@/types'

export const useGameStore = defineStore('game', () => {
  // 状态
  const state = ref<GameState>({
    currentIndex: 0,
    questions: [],
    answers: {},
    combo: 0,
    totalScore: 0,
    isFinished: false
  })

  // 计算属性
  const currentQuestion = computed(() =>
    state.value.questions[state.value.currentIndex] ?? null
  )

  const correctCount = computed(() =>
    Object.values(state.value.answers).filter(Boolean).length
  )

  // 方法
  function initGame(questions: Question[]) {
    state.value = { ...createDefaultState(), questions, startTime: Date.now() }
    saveState()
  }

  function recordAnswer(id: number, isCorrect: boolean) {
    state.value.answers[id] = isCorrect
    if (isCorrect) {
      state.value.combo++
    } else {
      state.value.combo = 0
    }
    saveState()
  }

  // 持久化
  function saveState() {
    uni.setStorageSync('game_state', JSON.stringify(state.value))
  }

  function restoreState() {
    const saved = uni.getStorageSync('game_state')
    if (saved) {
      state.value = JSON.parse(saved)
    }
  }

  return {
    state, currentQuestion, correctCount,
    initGame, recordAnswer, restoreState
  }
})
```

### 持久化的注意事项

uni-app 的本地存储用 `uni.setStorageSync` / `uni.getStorageSync`，但有几个坑：

1. **存储大小限制**：微信小程序单 key 上限 1MB，总上限 10MB，别存大数据
2. **数据格式**：只支持 JSON 可序列化的数据，`Date` 对象、`Map`、`Set` 存进去会变味
3. **写入时机**：频繁写入会影响性能，建议在关键操作后手动触发，不要用 `watch` 自动同步

## 网络请求封装

### 基础封装

```typescript
// services/api.ts
const API_BASE = 'https://api.example.com/v1'

function buildHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getApiKey()}`
  }
}

function handleApiError(status: number): string {
  switch (status) {
    case 401: return 'API Key无效，请检查设置'
    case 402: return '余额不足，请充值后重试'
    case 429: return '请求过于频繁，请稍后再试'
    case 500:
    case 502:
    case 503: return '服务暂时不可用，请稍后再试'
    default: return `请求失败（${status}）`
  }
}

export async function request<T>(
  url: string,
  options: UniApp.RequestOptions
): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${url}`,
      header: buildHeaders(),
      ...options,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data as T)
        } else {
          reject(new Error(handleApiError(res.statusCode)))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络请求失败'))
      }
    })
  })
}
```

### API Key 的多来源解析

实际项目中，API Key 可能来自多个地方——用户在设置页输入的、环境变量配置的。需要一个优先级解析：

```typescript
function resolveApiKey(): string {
  // 1. 优先从 localStorage 读取（用户手动输入的）
  const storedKey = uni.getStorageSync('api_key')
  if (storedKey) return storedKey

  // 2. 其次从环境变量读取（H5端 .env 文件配置）
  // @ts-ignore - 小程序端不存在 import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) {
    const envKey = import.meta.env.VITE_API_KEY
    if (envKey && envKey !== 'sk-your-key-here') {
      return envKey
    }
  }

  return ''
}
```

## 常见坑和解决方案

### 1. 条件编译的边界情况

条件编译 `#ifdef` 和 `#endif` 之间不能有空行注释，否则可能编译失败：

```typescript
// ❌ 错误：中间有空行可能导致解析异常
// #ifdef H5
const a = 1

// #endif

// ✅ 正确
// #ifdef H5
const a = 1
// #endif
```

另外，条件编译只在 `.ts` / `.vue` 文件中生效，`.json` 文件里不支持。

### 2. 样式兼容

小程序的样式限制比 H5 多得多：

- **不支持 `*` 选择器**
- **不支持属性选择器** `[attr=value]`
- **不支持 `:not()`、`:is()` 等伪类**（部分基础库版本支持）
- **`rpx` 和 `px` 混用容易出问题**：建议统一用 `rpx`（小程序）或 `px`（H5），别混着来
- **`v-show` 在小程序中不生效**：小程序没有 `display: none` 的原生支持，`v-show` 会被编译为 `v-if`，性能上要注意

### 3. 生命周期差异

uni-app 的生命周期和 Vue3 原生不完全一样，这里列几个关键差异：

| 生命周期 | Vue3 原生 | uni-app 小程序 | 说明 |
|---------|----------|--------------|------|
| `onMounted` | 可用 | 可用但时机不同 | 小程序中可能在页面渲染前触发 |
| `onShow` | 不存在 | 页面每次显示触发 | 小程序特有，Tab页切回时触发 |
| `onHide` | 不存在 | 页面隐藏触发 | 切到其他Tab时触发 |
| `onLoad` | 不存在 | 页面加载时触发 | 类似 `onMounted`，但只触发一次 |
| `onReady` | 不存在 | 页面初次渲染完成 | 比 `onMounted` 更接近"页面可交互" |

**实践建议**：初始化逻辑放 `onLoad`，需要每次显示都执行的逻辑放 `onShow`，DOM 操作放 `onReady`。

### 4. `uni.xxx` API 的异步陷阱

`uni.xxx` 的异步 API 有两种风格：回调式和 Promise 式。在 Vue3 + TypeScript 项目中，建议统一用 Promise 包装：

```typescript
// ❌ 回调地狱
uni.getLocation({
  success: (res) => {
    uni.request({
      url: '/api/weather',
      data: { lat: res.latitude },
      success: (res2) => { /* ... */ }
    })
  }
})

// ✅ Promise 包装
function getLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      success: (res) => resolve(res),
      fail: (err) => reject(new Error(err.errMsg))
    })
  })
}

// 使用 async/await
const location = await getLocation()
const weather = await request('/api/weather', { data: { lat: location.latitude } })
```

### 5. 长列表性能

小程序的长列表（比如100+条历史记录）直接 `v-for` 渲染会卡顿。解决方案：

- 分页加载：每次只渲染20条，触底加载更多
- 虚拟列表：uni-app 插件市场有 `z-paging`、`mescroll` 等
- 避免在列表项里放复杂组件，尽量用原生 `view` + `text`

## 打包发布流程

### 小程序打包

```bash
# 构建
pnpm build:mp-weixin

# 产物在 dist/build/mp-weixin 目录
```

然后用微信开发者工具打开 `dist/build/mp-weixin` 目录：

1. 填写 AppID
2. 点击"上传"，填写版本号和备注
3. 登录微信公众平台 → 版本管理 → 提交审核

**审核注意事项**：
- 个人主体小程序类目有限，提前确认你的功能在允许范围内
- AI生成内容类需要用户协议和免责声明
- 涉及用户信息的需要隐私政策
- 广告不能强制观看，必须有"关闭"或"跳过"入口

### H5 打包

```bash
# 构建
pnpm build:h5

# 产物在 dist/build/h5 目录
# 部署到 Nginx 或 CDN 即可
```

Nginx 配置示例（支持 history 模式路由）：

```nginx
server {
    listen 80;
    server_name example.com;

    root /var/www/h5;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 环境变量管理

在项目根目录创建 `.env` 文件：

```
# .env.production
VITE_API_BASE=https://api.example.com
VITE_APP_TITLE=我的应用

# .env.development
VITE_API_BASE=http://localhost:3000
VITE_APP_TITLE=我的应用(开发)
```

在代码中使用：

```typescript
const apiBase = import.meta.env.VITE_API_BASE
```

**重要**：`VITE_` 前缀的变量才会被 Vite 注入，自定义前缀的变量在客户端不可用。

---

这篇文章的所有代码模式都来自我实际开发的5个产品。如果你对完整的代码结构感兴趣，可以看看我的 [开发者工具集合站](https://huiquicktool.cn) 和 [证件照制作工具](https://photo.huiquicktool.cn)，微信小程序搜索"AI智能抠图""成语答题""AI文案生成助手"也能体验。有问题欢迎评论区交流。

---

**标签**：Vue3 | uni-app | 微信小程序 | TypeScript | 前端
