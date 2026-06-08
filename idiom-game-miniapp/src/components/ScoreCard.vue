<template>
  <view class="score-card">
    <view class="score-card__header">
      <text class="score-card__title">{{ title }}</text>
    </view>

    <view class="score-card__body">
      <view class="score-card__main-score">
        <text class="score-card__score-num">{{ score }}</text>
        <text class="score-card__score-label">分</text>
      </view>

      <view class="score-card__stats">
        <view class="stat-item">
          <text class="stat-value correct">{{ correctCount }}</text>
          <text class="stat-label">答对</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-value error">{{ totalCount - correctCount }}</text>
          <text class="stat-label">答错</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-value combo">{{ maxCombo }}</text>
          <text class="stat-label">连击</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-value time">{{ formatTime(elapsedTime) }}</text>
          <text class="stat-label">用时</text>
        </view>
      </view>
    </view>

    <!-- 星级评价（闯关模式） -->
    <view v-if="showStars" class="score-card__stars">
      <text
        v-for="i in 3"
        :key="i"
        class="star"
        :class="{ 'star--active': i <= stars }"
      >
        ★
      </text>
    </view>

    <!-- 连击倍率提示 -->
    <view v-if="combo > 1" class="score-card__combo-tip">
      🔥 {{ combo }}连击 x{{ multiplier }}倍率
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  title?: string
  score: number
  correctCount: number
  totalCount: number
  maxCombo: number
  combo?: number
  multiplier?: number
  elapsedTime: number
  showStars?: boolean
  stars?: number
}>()

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.score-card {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(245, 158, 11, 0.15);
  text-align: center;
}

.score-card__header {
  margin-bottom: 24rpx;
}

.score-card__title {
  font-size: 32rpx;
  font-weight: 700;
  color: #92400e;
}

.score-card__body {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-card__main-score {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 32rpx;
}

.score-card__score-num {
  font-size: 88rpx;
  font-weight: 900;
  color: $color-primary;
  line-height: 1;
}

.score-card__score-label {
  font-size: 32rpx;
  color: #b45309;
  margin-left: 8rpx;
}

.score-card__stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16rpx;
  padding: 20rpx 32rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 28rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 800;
  line-height: 1.2;

  &.correct { color: $color-correct; }
  &.error { color: $color-error; }
  &.combo { color: $color-primary; }
  &.time { color: #6366f1; }
}

.stat-label {
  font-size: 22rpx;
  color: #9ca3af;
  margin-top: 4rpx;
}

.stat-divider {
  width: 2rpx;
  height: 48rpx;
  background: #e5e7eb;
}

.score-card__stars {
  margin-top: 24rpx;
  display: flex;
  justify-content: center;
  gap: 12rpx;
}

.star {
  font-size: 56rpx;
  color: #d1d5db;
  transition: all 0.3s ease;

  &--active {
    color: $color-primary;
    animation: starPop 0.4s ease;
  }
}

.score-card__combo-tip {
  margin-top: 20rpx;
  padding: 12rpx 32rpx;
  background: rgba(245, 158, 11, 0.15);
  border-radius: 32rpx;
  font-size: 28rpx;
  color: #92400e;
  font-weight: 700;
}

@keyframes starPop {
  0% { transform: scale(0); }
  60% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
</style>
