<template>
  <view class="timer-ring">
    <view class="timer-svg">
      <view class="timer-circle-bg" />
      <view
        class="timer-circle-progress"
        :style="{ transform: `rotate(${rotation}deg)` }"
      />
      <view class="timer-inner">
        <text class="timer-number" :class="{ 'timer-number--warning': remaining <= 10 }">
          {{ remaining }}
        </text>
        <text class="timer-unit">秒</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  remaining: number
  total: number
}>()

const rotation = computed(() => {
  const progress = props.total > 0 ? props.remaining / props.total : 0
  return progress * 360
})
</script>

<style lang="scss" scoped>
.timer-ring {
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-svg {
  width: 120rpx;
  height: 120rpx;
  position: relative;
  border-radius: 50%;
}

.timer-circle-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 8rpx solid #f3f4f6;
  box-sizing: border-box;
}

.timer-circle-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 8rpx solid transparent;
  border-top-color: $color-primary;
  border-right-color: $color-primary;
  box-sizing: border-box;
  transform-origin: center center;
  transition: transform 1s linear;
}

.timer-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.timer-number {
  font-size: 36rpx;
  font-weight: 800;
  color: $color-primary;
  line-height: 1;

  &--warning {
    color: $color-error;
    animation: timerPulse 0.5s ease infinite alternate;
  }
}

.timer-unit {
  font-size: 18rpx;
  color: #9ca3af;
  margin-top: 2rpx;
}

@keyframes timerPulse {
  from { transform: scale(1); }
  to { transform: scale(1.15); }
}
</style>
