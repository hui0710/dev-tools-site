<template>
  <view class="mine-page">
    <!-- 用户信息卡片 -->
    <view class="mine-profile">
      <view class="mine-avatar">
        <text class="avatar-text">{{ userStore.user.nickname.slice(0, 1) }}</text>
      </view>
      <view class="mine-info">
        <text class="mine-name">{{ userStore.user.nickname }}</text>
        <text class="mine-level">闯关进度：第{{ userStore.user.currentLevel }}关</text>
      </view>
    </view>

    <!-- 统计数据 -->
    <view class="mine-stats">
      <view class="mine-stat-item">
        <text class="stat-num">{{ userStore.user.totalAnswered }}</text>
        <text class="stat-label">总答题</text>
      </view>
      <view class="mine-stat-divider" />
      <view class="mine-stat-item">
        <text class="stat-num correct">{{ userStore.user.totalCorrect }}</text>
        <text class="stat-label">答对</text>
      </view>
      <view class="mine-stat-divider" />
      <view class="mine-stat-item">
        <text class="stat-num primary">{{ userStore.accuracy }}%</text>
        <text class="stat-label">正确率</text>
      </view>
      <view class="mine-stat-divider" />
      <view class="mine-stat-item">
        <text class="stat-num primary">{{ userStore.user.totalScore }}</text>
        <text class="stat-label">总分</text>
      </view>
    </view>

    <!-- 设置项 -->
    <view class="mine-section">
      <text class="mine-section-title">设置</text>

      <view class="mine-setting-item">
        <text class="setting-label">音效</text>
        <switch
          :checked="userStore.user.soundEnabled"
          color="#F59E0B"
          @change="userStore.toggleSound()"
        />
      </view>

      <view class="mine-setting-item">
        <text class="setting-label">震动反馈</text>
        <switch
          :checked="userStore.user.vibrationEnabled"
          color="#F59E0B"
          @change="userStore.toggleVibration()"
        />
      </view>

      <view class="mine-setting-item" @tap="clearData">
        <text class="setting-label setting-label--danger">清除数据</text>
        <text class="setting-arrow">›</text>
      </view>
    </view>

    <!-- 关于 -->
    <view class="mine-section">
      <text class="mine-section-title">关于</text>
      <view class="mine-about">
        <text class="about-text">成语答题大挑战 v1.0.0</text>
        <text class="about-text about-text--sub">每天学成语，涨知识</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

function clearData() {
  uni.showModal({
    title: '确认清除',
    content: '清除所有数据后将无法恢复，确定继续吗？',
    confirmColor: '#EF4444',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync()
        uni.reLaunch({ url: '/pages/index/index' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.mine-page {
  min-height: 100vh;
  background: $color-bg;
  padding: 32rpx;
}

.mine-profile {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, $color-primary 0%, #d97706 100%);
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(245, 158, 11, 0.2);
}

.mine-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 28rpx;
}

.avatar-text {
  font-size: 44rpx;
  font-weight: 900;
  color: #fff;
}

.mine-info {
  flex: 1;
}

.mine-name {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
}

.mine-level {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.mine-stats {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx 16rpx;
  margin-top: 28rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.mine-stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 36rpx;
  font-weight: 800;
  color: #1f2937;

  &.correct { color: $color-correct; }
  &.primary { color: $color-primary; }
}

.stat-label {
  font-size: 22rpx;
  color: #9ca3af;
  margin-top: 6rpx;
}

.mine-stat-divider {
  width: 2rpx;
  height: 48rpx;
  background: #f3f4f6;
}

.mine-section {
  margin-top: 32rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.mine-section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #6b7280;
  margin-bottom: 20rpx;
}

.mine-setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
}

.setting-label {
  font-size: 30rpx;
  color: #1f2937;

  &--danger { color: $color-error; }
}

.setting-arrow {
  font-size: 36rpx;
  color: #d1d5db;
}

.mine-about {
  text-align: center;
  padding: 16rpx 0;
}

.about-text {
  display: block;
  font-size: 28rpx;
  color: #6b7280;

  &--sub {
    font-size: 24rpx;
    color: #9ca3af;
    margin-top: 8rpx;
  }
}
</style>
