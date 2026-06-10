# 在线证件照制作 - Web应用

## 项目简介

纯前端在线证件照制作工具，基于浏览器端AI抠图模型实现本地去背景，支持标准证件照尺寸选择、背景色替换、美颜调节、A4排版打印，所有照片处理均在浏览器本地完成，无需上传服务器。

## 技术栈

- 框架：Vue 3 (Composition API + TypeScript)
- UI：原生HTML + Tailwind CSS
- AI抠图：@imgly/background-removal（浏览器端ML模型）
- 构建工具：Vite + @vitejs/plugin-vue
- CSS框架：Tailwind CSS 3.x
- 状态管理：无Pinia，通过composables内部ref管理

## 目录结构

```
src/
├── App.vue                 # 单页应用主组件（包含全部UI布局和逻辑整合）
├── main.ts                 # 入口文件
├── style.css               # 全局样式 + Tailwind指令
├── env.d.ts                # 类型声明
├── components/             # UI组件
│   ├── PhotoUploader.vue   # 照片上传（拖拽/点击/拍照）
│   ├── PhotoPreview.vue    # 照片预览（处理进度/模型加载状态）
│   ├── SizeSelector.vue    # 证件照尺寸选择器
│   ├── ColorPicker.vue     # 背景色选择（白/红/蓝/渐变蓝/自定义）
│   ├── BeautySlider.vue    # 美颜调节（亮度/对比度/饱和度）
│   ├── LayoutPreview.vue   # A4排版预览
│   └── DownloadPanel.vue   # 下载面板（单张/排版）
├── composables/            # 组合式函数
│   ├── usePhoto.ts         # 核心状态整合（上传/处理/预览/下载全流程）
│   ├── useBackground.ts    # AI抠图 + 背景合成（@imgly/background-removal）
│   ├── useCrop.ts          # 裁剪到标准尺寸
│   ├── useBeauty.ts        # 美颜滤镜（Canvas像素级处理）
│   └── useLayout.ts        # A4排版计算与生成
├── config/
│   └── sizes.ts            # 证件照尺寸配置表 + 背景色配置 + A4纸参数
└── types/
    └── index.ts            # 类型定义（PhotoSize/BackgroundColor/BeautyParams等）
```

## 页面/路由说明

本项目为**单页应用（SPA）**，无路由，所有功能在同一个页面中完成：

| 功能区域 | 说明 |
|---------|------|
| 顶部导航 | Logo + "重新开始"按钮 |
| 上传区域 | 未上传图片时显示，支持拖拽/点击/手机拍照 |
| 左侧预览 | 已上传后显示，展示处理进度和证件照预览 |
| 右侧控制面板 | 尺寸选择 → 背景色 → 美颜 → 排版 → 下载（sticky定位） |
| 底部使用说明 | 三步引导 + SEO文案 + 广告位预留 |

## 核心模块说明

### composables/

| 模块 | 职责 |
|------|------|
| `usePhoto` | 核心状态整合器：管理上传→抠图→裁剪→美颜→合成→排版的完整流程，暴露所有响应式状态和方法给App.vue |
| `useBackground` | AI抠图引擎：初始化@imgly/background-removal模型、执行去背景、前景与背景色合成，处理模型加载进度 |
| `useCrop` | 裁剪逻辑：将抠图结果裁剪到标准证件照尺寸（基于mm→px换算） |
| `useBeauty` | 美颜滤镜：通过Canvas像素操作调节亮度/对比度/饱和度 |
| `useLayout` | A4排版：计算排版布局（照片数量/间距），生成A4尺寸Canvas用于打印 |

### config/

| 模块 | 职责 |
|------|------|
| `sizes` | 定义8种标准证件照尺寸（一寸/二寸/小一寸/大一寸/护照/美日韩签证），4种背景色，A4纸参数 |

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
# 默认端口：http://localhost:5173
```

## 构建部署

```bash
# 类型检查 + 构建
npm run build
# 输出目录：dist/

# 本地预览构建结果
npm run preview
```

- 推荐部署到 Vercel / Netlify / Cloudflare Pages
- 构建产物为纯静态文件，可部署到任何静态托管

## 配置项

| 配置项 | 位置 | 说明 |
|-------|------|------|
| 证件照尺寸 | `src/config/sizes.ts` → `PHOTO_SIZES` | 预设8种标准尺寸，可自行添加 |
| 背景色选项 | `src/config/sizes.ts` → `BG_COLORS` | 白/红/蓝/渐变蓝，可扩展 |
| A4纸参数 | `src/config/sizes.ts` → `A4` | 2480x3508px @300dpi |
| AI模型 | `src/composables/useBackground.ts` | @imgly/background-removal，模型自动下载到浏览器缓存 |

## 开发指引

- **修改证件照尺寸**：编辑 `src/config/sizes.ts` 中的 `PHOTO_SIZES` 数组，按相同结构添加即可
- **修改背景色选项**：编辑 `src/config/sizes.ts` 中的 `BG_COLORS` 数组
- **调整AI抠图模型**：编辑 `src/composables/useBackground.ts`，可替换为其他浏览器端ML模型
- **修改美颜算法**：编辑 `src/composables/useBeauty.ts`，当前为Canvas像素级处理
- **修改布局/样式**：编辑 `src/App.vue`，使用Tailwind CSS类名
- **添加新功能面板**：1) 在 `src/components/` 下创建组件；2) 在 `src/App.vue` 右侧控制面板区域引入；3) 如需独立状态，在 `src/composables/` 下新建composable
- **SEO文案**：在 `src/App.vue` 底部footer区域修改
- **广告位**：底部已预留Google AdSense广告位，替换占位HTML即可接入

## 变现模式

- **当前策略**：免费使用，底部预留Google AdSense广告位（未接入）
- **隐私优势**：纯前端处理，不上传服务器，可在宣传中强调隐私安全
- **未来扩展**：高清无水印下载付费、批量处理收费、高级排版模板
