<template>
  <view class="home-page">
    <!-- 顶部标题 -->
    <view class="home-header">
      <text class="home-title">成语大挑战</text>
      <text class="home-subtitle">学成语，涨知识</text>
    </view>

    <!-- 三个模式入口 -->
    <view class="mode-cards">
      <!-- 每日挑战 -->
      <view class="mode-card mode-card--daily" @tap="goDaily">
        <view class="mode-card__icon">🔥</view>
        <view class="mode-card__info">
          <text class="mode-card__title">每日挑战</text>
          <text class="mode-card__desc">每天10题，限时60秒</text>
        </view>
        <view class="mode-card__arrow">›</view>
      </view>

      <!-- 闯关模式 -->
      <view class="mode-card mode-card--level" @tap="goLevel">
        <view class="mode-card__icon">⚔️</view>
        <view class="mode-card__info">
          <text class="mode-card__title">闯关模式</text>
          <text class="mode-card__desc">300关由易到难</text>
        </view>
        <view class="mode-card__arrow">›</view>
      </view>

      <!-- 好友PK -->
      <view class="mode-card mode-card--pk" @tap="goPK">
        <view class="mode-card__icon">🎯</view>
        <view class="mode-card__info">
          <text class="mode-card__title">好友PK</text>
          <text class="mode-card__desc">挑战好友比分数</text>
        </view>
        <view class="mode-card__arrow">›</view>
      </view>
    </view>

    <!-- 底部导航 -->
    <view class="home-footer">
      <view class="footer-btn" @tap="goRank">
        <text class="footer-icon">🏆</text>
        <text class="footer-text">排行榜</text>
      </view>
      <view class="footer-btn" @tap="goMine">
        <text class="footer-icon">👤</text>
        <text class="footer-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

function goDaily() {
  uni.navigateTo({ url: '/pages/daily/daily' })
}

function goLevel() {
  uni.navigateTo({ url: `/pages/level/level?currentLevel=${userStore.user.currentLevel}` })
}

function goPK() {
  uni.navigateTo({ url: '/pages/pk/pk' })
}

function goRank() {
  uni.switchTab({ url: '/pages/rank/rank' })
}

function goMine() {
  uni.switchTab({ url: '/pages/mine/mine' })
}
</script>

<style lang="scss" scoped>
.home-page {
  height: 100%;
  background: $color-bg;
  padding: 0 32rpx;
  padding-bottom: 120rpx;
  box-sizing: border-box;
  overflow-y: auto;
}

.home-header {
  padding-top: 80rpx;
  text-align: center;
  margin-bottom: 60rpx;
}

.home-title {
  display: block;
  font-size: 56rpx;
  font-weight: 900;
  color: $color-primary;
  letter-spacing: 8rpx;
}

.home-subtitle {
  display: block;
  font-size: 28rpx;
  color: #92400e;
  margin-top: 12rpx;
}

.mode-cards {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

.mode-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 24rpx;
  padding: 36rpx 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  &--daily {
    border-left: 8rpx solid #ef4444;
  }

  &--level {
    border-left: 8rpx solid $color-primary;
  }

  &--pk {
    border-left: 8rpx solid #6366f1;
  }
}

.mode-card__icon {
  font-size: 64rpx;
  margin-right: 28rpx;
  flex-shrink: 0;
}

.mode-card__info {
  flex: 1;
}

.mode-card__title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #1f2937;
}

.mode-card__desc {
  display: block;
  font-size: 26rpx;
  color: #9ca3af;
  margin-top: 6rpx;
}

.mode-card__arrow {
  font-size: 48rpx;
  color: #d1d5db;
  font-weight: 300;
  flex-shrink: 0;
}

.home-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 80rpx;
  padding: 24rpx 0;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #f3f4f6;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.footer-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.footer-icon {
  font-size: 40rpx;
}

.footer-text {
  font-size: 22rpx;
  color: #6b7280;
}
</style>
