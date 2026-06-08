<template>
  <view v-if="visible" class="ad-reward-overlay">
    <view class="ad-reward-modal">
      <view class="ad-reward-icon">
        <text class="icon-text">🎬</text>
      </view>
      <text class="ad-reward-title">{{ title }}</text>
      <text class="ad-reward-desc">{{ description }}</text>
      <view class="ad-reward-actions">
        <view class="ad-btn ad-btn--watch" @tap="onWatchAd">
          <text class="ad-btn-text">观看广告</text>
        </view>
        <view class="ad-btn ad-btn--skip" @tap="onSkip">
          <text class="ad-btn-text ad-btn-text--skip">不了，谢谢</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  visible: boolean
  title?: string
  description?: string
}>()

const emit = defineEmits<{
  (e: 'watch'): void
  (e: 'skip'): void
}>()

function onWatchAd() {
  emit('watch')
}

function onSkip() {
  emit('skip')
}
</script>

<style lang="scss" scoped>
.ad-reward-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.ad-reward-modal {
  width: 560rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 40rpx;
  text-align: center;
  animation: modalIn 0.3s ease;
}

.ad-reward-icon {
  margin-bottom: 24rpx;
}

.icon-text {
  font-size: 80rpx;
}

.ad-reward-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12rpx;
}

.ad-reward-desc {
  display: block;
  font-size: 28rpx;
  color: #6b7280;
  margin-bottom: 40rpx;
  line-height: 1.5;
}

.ad-reward-actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.ad-btn {
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.97);
  }

  &--watch {
    background: linear-gradient(135deg, $color-primary 0%, #d97706 100%);
    box-shadow: 0 4rpx 16rpx rgba(245, 158, 11, 0.3);
  }

  &--skip {
    background: transparent;
  }
}

.ad-btn-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;

  &--skip {
    color: #9ca3af;
    font-weight: 400;
    font-size: 28rpx;
  }
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
