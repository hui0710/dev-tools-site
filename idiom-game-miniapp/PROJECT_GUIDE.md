# 成语答题大挑战 - 微信小程序

## 项目简介

成语填字答题小游戏微信小程序，包含每日挑战、闯关模式、好友PK三种玩法，通过答对得分+连击奖励机制激励用户，以激励视频广告复活和获取提示实现变现。

## 技术栈

- 框架：uni-app (Vue 3 + TypeScript)
- UI：@climblee/uv-ui
- 状态管理：Pinia
- 构建工具：Vite + @dcloudio/vite-plugin-uni
- CSS预处理：Sass
- 数据来源：本地JSON成语题库

## 目录结构

```
src/
├── App.vue                 # 应用入口
├── main.ts                 # 入口文件
├── manifest.json           # uni-app 应用配置（AppID、权限等）
├── pages.json              # 页面路由与 tabBar 配置
├── uni.scss                # 全局样式变量
├── env.d.ts                # 类型声明
├── components/             # 公共组件
│   ├── AdReward.vue        # 激励视频广告组件
│   ├── AnswerGrid.vue      # 答题选项网格
│   ├── QuestionCard.vue    # 题目展示卡片
│   ├── ScoreCard.vue       # 分数展示卡片
│   └── Timer.vue           # 倒计时组件
├── composables/            # 组合式函数
│   ├── useAd.ts            # 广告逻辑（激励视频展示与回调）
│   ├── useGame.ts          # 游戏核心逻辑（流程控制/得分/复活）
│   ├── useQuestion.ts      # 题目管理（加载/随机/判题）
│   ├── useScore.ts         # 分数计算（基础分/连击/时间奖励）
│   └── useTimer.ts         # 计时器（倒计时/耗时统计）
├── stores/
│   ├── game.ts             # 游戏状态（当前题目/答案/连击/分数/进度）
│   └── user.ts             # 用户数据（累计统计/关卡进度/每日记录/设置）
├── data/
│   ├── idioms-easy.json    # 简单题库（约15KB）
│   ├── idioms-medium.json  # 中等题库（约15KB）
│   └── idioms-hard.json    # 困难题库（约15KB）
├── types/
│   └── index.ts            # 类型定义（GameState/GameMode/Question等）
├── utils/
│   ├── shuffle.ts          # 数组随机洗牌
│   └── storage.ts          # 本地存储封装
├── pages/
│   ├── index/              # 首页（游戏模式选择入口）
│   ├── daily/              # 每日挑战页
│   ├── level/              # 闯关模式页
│   ├── pk/                 # 好友PK页
│   ├── rank/               # 排行榜页
│   ├── result/             # 答题结果页
│   └── mine/               # 个人中心页
└── static/                 # 静态资源（tabBar图标等）
```

## 页面/路由说明

| 页面路径 | 导航栏标题 | TabBar | 功能说明 |
|---------|-----------|--------|---------|
| pages/index/index | 成语大挑战 | 首页 | 游戏主入口，三种模式选择（每日挑战/闯关/PK） |
| pages/daily/daily | 每日挑战 | - | 每日固定题目集，记录当日最佳成绩 |
| pages/level/level | 闯关模式 | - | 按难度递进闯关，获得星级评价 |
| pages/pk/pk | 好友PK | - | 与好友比拼答题成绩 |
| pages/rank/rank | 排行榜 | 排行 | 各模式排行榜展示 |
| pages/result/result | 答题结果 | - | 展示本轮成绩、连击数、正确率、分数 |
| pages/mine/mine | 我的 | 我的 | 个人中心，累计统计、设置（音效/震动） |

- TabBar 配置3个标签：首页、排行、我的
- 主题色：`#F59E0B`（琥珀色），背景色 `#FFFBEB`
- 答题页通过 `uni.navigateTo` 跳转

## 核心模块说明

### composables/

| 模块 | 职责 |
|------|------|
| `useGame` | 游戏核心逻辑：流程控制、得分计算、复活机制（看广告继续）、游戏结束判定 |
| `useQuestion` | 题目管理：从JSON题库加载、按难度筛选、随机出题、答案校验 |
| `useScore` | 分数计算：基础分 + 连击奖励 + 时间奖励的加权算法 |
| `useTimer` | 计时器：倒计时模式、耗时统计、超时自动结束 |
| `useAd` | 广告逻辑：创建激励视频广告、展示与回调处理 |

### stores/

| 模块 | 职责 |
|------|------|
| `game` | 游戏状态管理：当前模式/题目索引/答案记录/连击数/分数/是否复活/游戏进度，支持持久化恢复 |
| `user` | 用户数据：昵称/头像、累计答题统计、闯关进度（星级）、每日最佳成绩、音效/震动设置 |

### data/

三套难度题库（easy/medium/hard），每套约15KB，纯本地数据，无需后端。

## 本地开发

```bash
# 安装依赖
npm install

# H5开发模式
npm run dev:h5

# 微信小程序开发模式
npm run dev:mp-weixin
# 然后用微信开发者工具打开 dist/dev/mp-weixin 目录
```

## 构建部署

```bash
# 构建H5版本
npm run build:h5
# 输出目录：dist/build/h5

# 构建微信小程序版本
npm run build:mp-weixin
# 输出目录：dist/build/mp-weixin
# 通过微信开发者工具上传代码 → 提交审核
```

## 配置项

| 配置项 | 位置 | 说明 |
|-------|------|------|
| 微信小程序 AppID | `src/manifest.json` → `mp-weixin.appid` | 微信小程序的AppID |
| 广告位 ID | `src/composables/useAd.ts` → `AD_UNIT_ID` | 微信流量主广告单元ID |
| 题库数据 | `src/data/idioms-*.json` | 可按需扩充或替换题库内容 |
| H5路由模式 | `src/manifest.json` → `h5.router.mode` | 默认 hash 模式 |

## 开发指引

- **修改游戏流程**：编辑 `src/composables/useGame.ts`，核心游戏循环在其中
- **调整得分算法**：编辑 `src/composables/useScore.ts`，可修改连击倍率和时间奖励权重
- **扩充题库**：在 `src/data/` 下编辑JSON文件，保持相同数据结构即可自动加载
- **新增游戏模式**：1) 在 `src/pages/` 下创建新页面；2) 在 `pages.json` 注册；3) 在 `useGame.ts` 中扩展 GameMode 类型
- **新增页面**：在 `src/pages/` 下创建目录和vue文件，然后在 `src/pages.json` 的 `pages` 数组中注册
- **修改TabBar**：编辑 `src/pages.json` 的 `tabBar.list` 数组
- **样式规范**：全局变量在 `src/uni.scss`，主题色为 `#F59E0B`
- **排行榜**：当前为本地存储模拟排行，接入微信云开发可实现真实排行

## 变现模式

- **当前策略**：答错后看激励视频广告复活继续；获取提示需看广告
- **未来扩展**：闯关模式付费解锁高级关卡、去除广告的会员制、虚拟道具购买
