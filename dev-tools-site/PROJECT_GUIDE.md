# 开发者在线工具集合 - Web应用

## 项目简介

一站式前端/开发者在线工具集合站，提供10种常用开发工具（JSON格式化、正则测试、时间戳转换、Base64编解码、URL编解码、颜色转换、UUID/密码生成、Markdown预览、CSS渐变生成、文本对比），纯前端处理，免费使用，通过Google AdSense实现变现。

## 技术栈

- 框架：Vue 3 (Composition API + TypeScript)
- 路由：Vue Router 4（History模式）
- UI：原生HTML + Tailwind CSS 4.x
- 构建工具：Vite 8.x + @vitejs/plugin-vue
- 代码高亮：highlight.js
- Markdown渲染：marked
- 文本对比：diff
- CSS框架：Tailwind CSS 4.x（通过 @tailwindcss/vite 插件集成）
- 部署：Vercel

## 目录结构

```
src/
├── App.vue                 # 应用主组件（Header + RouterView）
├── main.ts                 # 入口文件
├── style.css               # 全局样式 + Tailwind指令
├── env.d.ts                # 类型声明
├── components/             # 公共组件
│   ├── AppHeader.vue       # 顶部导航栏
│   ├── CodeEditor.vue      # 代码编辑器（带行号）
│   ├── CopyButton.vue      # 复制到剪贴板按钮
│   └── ToolCard.vue        # 工具卡片（首页展示）
├── composables/            # 组合式函数
│   ├── useCopy.ts          # 剪贴板复制功能
│   └── useTheme.ts         # 主题切换（亮/暗模式）
├── config/
│   └── tools.ts            # 工具配置（名称/路径/图标/描述/组件映射）
├── router/
│   └── index.ts            # Vue Router配置（动态从tools配置生成路由）
├── types/
│   └── index.ts            # 类型定义（ToolConfig等）
├── views/                  # 各工具页面
│   ├── Home.vue            # 首页（工具卡片网格）
│   ├── JsonTool.vue        # JSON格式化/压缩/校验/转TS/YAML
│   ├── RegexTool.vue       # 正则表达式测试器
│   ├── TimestampTool.vue   # 时间戳转换
│   ├── Base64Tool.vue      # Base64编解码
│   ├── UrlEncodeTool.vue   # URL编解码
│   ├── ColorTool.vue       # 颜色格式转换（HEX/RGB/HSL）
│   ├── GeneratorTool.vue   # UUID/密码生成器
│   ├── MarkdownTool.vue    # Markdown实时预览
│   ├── GradientTool.vue    # CSS渐变生成器
│   └── DiffTool.vue        # 文本差异对比
└── assets/                 # 静态资源
```

## 页面/路由说明

| 路由路径 | 工具名称 | 功能说明 |
|---------|---------|---------|
| `/` | 首页 | 工具卡片网格展示，搜索/分类筛选 |
| `/json` | JSON 格式化 | JSON格式化、压缩、校验、转TypeScript接口、转YAML |
| `/regex` | 正则测试器 | 正则表达式实时匹配测试，常用正则模板库 |
| `/timestamp` | 时间戳转换 | Unix时间戳 ↔ 可读时间双向转换，支持时区选择 |
| `/base64` | Base64 编解码 | 文本/图片Base64编码与解码 |
| `/url-encode` | URL 编解码 | URL编码与解码，支持批量处理 |
| `/color` | 颜色转换 | HEX/RGB/HSL颜色格式互转，可视化选色器 |
| `/generator` | UUID/密码生成 | UUID v4批量生成，自定义规则随机密码生成 |
| `/markdown` | Markdown 预览 | Markdown实时预览，支持GFM语法和代码高亮 |
| `/gradient` | CSS 渐变生成器 | 可视化CSS渐变生成，线性和径向渐变 |
| `/diff` | 文本对比 | 文本差异对比，高亮显示增删改 |

- 路由模式：History（`createWebHistory`）
- 路由配置动态生成：从 `src/config/tools.ts` 的 tools 数组自动映射

## 核心模块说明

### config/

| 模块 | 职责 |
|------|------|
| `tools` | 工具注册表：定义10个工具的name/path/icon/description/component，新增工具只需在此数组添加一项 |

### composables/

| 模块 | 职责 |
|------|------|
| `useCopy` | 剪贴板复制：调用 `navigator.clipboard.writeText`，带成功提示 |
| `useTheme` | 主题管理：亮/暗模式切换，持久化到localStorage |

### components/

| 模块 | 职责 |
|------|------|
| `AppHeader` | 全局导航栏：Logo + 工具下拉菜单 + 主题切换 |
| `CodeEditor` | 代码编辑器：带行号的文本输入区域 |
| `CopyButton` | 通用复制按钮：调用useCopy，带复制成功反馈 |
| `ToolCard` | 工具卡片：首页展示，包含图标/名称/描述/跳转链接 |

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

- 已配置 Vercel 部署，推送到仓库自动构建
- 构建产物为纯静态文件，可部署到任何静态托管

## 配置项

| 配置项 | 位置 | 说明 |
|-------|------|------|
| 工具列表 | `src/config/tools.ts` → `tools` | 所有工具的注册配置，新增工具只需添加一项 |
| 路由配置 | `src/router/index.ts` | 从tools配置动态生成，无需手动维护 |
| SEO元信息 | `src/router/index.ts` → `beforeEach` | 每个页面的title和description自动设置 |

## 开发指引

- **新增工具**（只需3步）：
  1. 在 `src/views/` 下创建新工具页面组件（如 `NewTool.vue`）
  2. 在 `src/config/tools.ts` 的 `tools` 数组中添加一项（name/path/icon/description/component）
  3. 路由和首页卡片会自动生成，无需额外配置
- **修改现有工具**：直接编辑 `src/views/` 下对应的Vue文件
- **修改全局布局**：编辑 `src/App.vue`（Header）和 `src/style.css`（全局样式）
- **修改导航栏**：编辑 `src/components/AppHeader.vue`
- **样式规范**：使用 Tailwind CSS 4.x 类名，支持亮/暗模式
- **公共组件**：`CodeEditor`（代码输入）、`CopyButton`（复制功能）可在各工具页面中复用
- **SEO优化**：每个工具路由自动设置 `document.title` 和 `meta[description]`

## 变现模式

- **当前策略**：免费使用，纯前端无后端成本，通过Google AdSense变现
- **SEO引流**：各工具页面有独立的title和description，利于搜索引擎收录
- **未来扩展**：高级功能付费（如JSON Schema生成、批量处理）、去除广告的会员制
