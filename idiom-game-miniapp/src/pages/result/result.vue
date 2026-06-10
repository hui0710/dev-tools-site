<template>
  <view class="result-page">
    <!-- 成绩卡片 -->
    <ScoreCard
      :title="modeLabel"
      :score="score"
      :correct-count="correct"
      :total-count="total"
      :max-combo="combo"
      :elapsed-time="time"
      :show-stars="mode === 'level'"
      :stars="stars"
    />

    <!-- 操作按钮 -->
    <view class="result-actions">
      <!-- 保存成绩卡 -->
      <view class="result-btn result-btn--save" @tap="saveShareCard">
        <text class="result-btn-text">保存成绩卡</text>
      </view>

      <!-- 分享给好友 -->
      <view class="result-btn result-btn--share" @tap="shareToFriend">
        <text class="result-btn-text">分享给好友</text>
      </view>

      <!-- 再来一局 -->
      <view v-if="mode === 'daily'" class="result-btn result-btn--replay" @tap="replayDaily">
        <text class="result-btn-text result-btn-text--replay">再来一局</text>
      </view>

      <!-- 继续闯关 -->
      <view v-if="mode === 'level'" class="result-btn result-btn--next" @tap="nextLevel">
        <text class="result-btn-text">继续闯关</text>
      </view>

      <!-- 返回首页 -->
      <view class="result-btn result-btn--home" @tap="goHome">
        <text class="result-btn-text result-btn-text--home">返回首页</text>
      </view>
    </view>

    <!-- 隐藏Canvas用于生成分享图 -->
    <canvas canvas-id="shareCanvas" class="share-canvas" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useGameStore } from '@/stores/game'
import ScoreCard from '@/components/ScoreCard.vue'

const userStore = useUserStore()
const gameStore = useGameStore()

const mode = ref('daily')
const score = ref(0)
const correct = ref(0)
const total = ref(0)
const combo = ref(0)
const time = ref(0)
const stars = ref(0)
const level = ref(1)

const modeLabel = ref('')

onLoad((options: Record<string, string | undefined>) => {
  mode.value = options?.mode || 'daily'
  score.value = Number(options?.score) || 0
  correct.value = Number(options?.correct) || 0
  total.value = Number(options?.total) || 0
  combo.value = Number(options?.combo) || 0
  time.value = Number(options?.time) || 0
  stars.value = Number(options?.stars) || 0
  level.value = Number(options?.level) || 1

  switch (mode.value) {
    case 'daily': modeLabel.value = '每日挑战'; break
    case 'level': modeLabel.value = `第${level.value}关`; break
    case 'pk': modeLabel.value = '好友PK'; break
  }
})

function saveShareCard() {
  drawShareCard().then(() => {
    uni.canvasToTempFilePath({
      canvasId: 'shareCanvas',
      success: (res) => {
        uni.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            uni.showToast({ title: '已保存到相册', icon: 'success' })
          },
          fail: () => {
            uni.showToast({ title: '保存失败，请授权', icon: 'none' })
          }
        })
      }
    })
  })
}

function drawShareCard(): Promise<void> {
  return new Promise((resolve) => {
    const ctx = uni.createCanvasContext('shareCanvas')
    const w = 375
    const h = 600

    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, w, h)
    gradient.addColorStop(0, '#FFFBEB')
    gradient.addColorStop(0.5, '#FEF3C7')
    gradient.addColorStop(1, '#FDE68A')
    ctx.setFillStyle(gradient)
    ctx.fillRect(0, 0, w, h)

    // 装饰元素
    ctx.setFontSize(60)
    ctx.setFillStyle('rgba(245, 158, 11, 0.1)')
    ctx.fillText('成语', 20, 100)
    ctx.fillText('大挑战', 240, 600)

    // 标题
    ctx.setFontSize(28)
    ctx.setFillStyle('#92400E')
    ctx.setTextAlign('center')
    ctx.fillText('成语大挑战', w / 2, 60)

    // 模式
    ctx.setFontSize(18)
    ctx.setFillStyle('#B45309')
    ctx.fillText(modeLabel.value, w / 2, 90)

    // 分数
    ctx.setFontSize(64)
    ctx.setFillStyle('#F59E0B')
    ctx.fillText(String(score.value), w / 2, 180)

    ctx.setFontSize(16)
    ctx.setFillStyle('#92400E')
    ctx.fillText('分', w / 2 + 50, 180)

    // 分割线
    ctx.setStrokeStyle('#FDE68A')
    ctx.setLineWidth(1)
    ctx.beginPath()
    ctx.moveTo(50, 210)
    ctx.lineTo(325, 210)
    ctx.stroke()

    // 统计信息
    ctx.setFontSize(16)
    ctx.setFillStyle('#6B7280')
    ctx.setTextAlign('left')
    const startY = 250
    const gap = 40
    ctx.fillText(`✅ 答对：${correct.value}/${total.value}`, 50, startY)
    ctx.fillText(`🔥 最高连击：${combo.value}`, 50, startY + gap)
    ctx.fillText(`⏱ 用时：${formatTime(time.value)}`, 50, startY + gap * 2)

    // 星级（闯关模式）
    if (mode.value === 'level' && stars.value > 0) {
      const starStr = '★'.repeat(stars.value) + '☆'.repeat(3 - stars.value)
      ctx.setFontSize(24)
      ctx.setFillStyle('#F59E0B')
      ctx.setTextAlign('center')
      ctx.fillText(starStr, w / 2, startY + gap * 3)
    }

    // 底部提示
    ctx.setFontSize(12)
    ctx.setFillStyle('#9CA3AF')
    ctx.setTextAlign('center')
    ctx.fillText('长按识别小程序码', w / 2, h - 30)

    ctx.draw(false, () => {
      setTimeout(resolve, 300)
    })
  })
}

function shareToFriend() {
  // #ifdef MP-WEIXIN
  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession',
    type: 0,
    title: '成语大挑战 - 我的成绩',
    summary: `我在${modeLabel.value}中获得了${score.value}分！`,
    href: ''
  })
  // #endif

  // #ifndef MP-WEIXIN
  uni.showToast({ title: '请在小程序中分享', icon: 'none' })
  // #endif
}

async function replayDaily() {
  gameStore.resetGame()
  uni.redirectTo({ url: '/pages/daily/daily' })
}

function nextLevel() {
  gameStore.resetGame()
  uni.redirectTo({ url: `/pages/level/level?currentLevel=${userStore.user.currentLevel}` })
}

function goHome() {
  gameStore.resetGame()
  uni.reLaunch({ url: '/pages/index/index' })
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.result-page {
  height: 100%;
  background: $color-bg;
  padding: 40rpx 32rpx;
  box-sizing: border-box;
  overflow-y: auto;
}

.result-actions {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.result-btn {
  height: 96rpx;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:active { transform: scale(0.97); }

  &--save {
    background: linear-gradient(135deg, $color-primary 0%, #d97706 100%);
    box-shadow: 0 4rpx 16rpx rgba(245, 158, 11, 0.3);
  }

  &--share {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    box-shadow: 0 4rpx 16rpx rgba(99, 102, 241, 0.3);
  }

  &--replay {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    box-shadow: 0 4rpx 16rpx rgba(16, 185, 129, 0.3);
  }

  &--next {
    background: linear-gradient(135deg, $color-primary 0%, #d97706 100%);
    box-shadow: 0 4rpx 16rpx rgba(245, 158, 11, 0.3);
  }

  &--home {
    background: transparent;
    border: 2rpx solid #e5e7eb;
  }
}

.result-btn-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;

  &--replay { font-size: 28rpx; }
  &--home { color: #6b7280; font-weight: 400; }
}

.share-canvas {
  position: fixed;
  left: -9999px;
  width: 750rpx;
  height: 1200rpx;
}
</style>
