<template>
  <view class="question-card">
    <!-- 题目类型标签 -->
    <view class="question-type-tag" :class="`type-${question.type}`">
      {{ typeLabel }}
    </view>

    <!-- fill 填空题 -->
    <view v-if="question.type === 'fill'" class="question-content fill-content">
      <view class="fill-grid">
        <view
          v-for="(char, idx) in fillSlots"
          :key="idx"
          class="fill-cell"
          :class="{
            'fill-cell--blank': blankIndices.includes(idx),
            'fill-cell--filled': blankIndices.includes(idx) && char !== '',
            'fill-cell--correct': showResult && blankIndices.includes(idx) && isCorrectChar(idx),
            'fill-cell--wrong': showResult && blankIndices.includes(idx) && char !== '' && !isCorrectChar(idx)
          }"
          @tap="onSlotTap(idx)"
        >
          <text class="fill-char">{{ char || '' }}</text>
        </view>
      </view>
    </view>

    <!-- meaning 释义题 -->
    <view v-else-if="question.type === 'meaning'" class="question-content meaning-content">
      <text class="meaning-text">{{ question.question }}</text>
      <view class="meaning-hint">请选择正确的成语</view>
    </view>

    <!-- picture 看图猜题 -->
    <view v-else-if="question.type === 'picture'" class="question-content picture-content">
      <view class="picture-scene">
        <text class="picture-desc">{{ question.question }}</text>
      </view>
      <view class="meaning-hint">请根据描述猜成语</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Question, FillState } from '@/types'

const props = defineProps<{
  question: Question
  fillState?: FillState
  showResult?: boolean
  correctAnswer?: string
}>()

const emit = defineEmits<{
  (e: 'slotTap', index: number): void
}>()

const typeLabel = computed(() => {
  switch (props.question.type) {
    case 'fill': return '填空题'
    case 'meaning': return '释义题'
    case 'picture': return '看图猜'
    default: return ''
  }
})

const fillSlots = computed(() => {
  return props.fillState?.slots || []
})

// 计算空白位索引：根据question字符串中___的位置
const blankIndexSet = computed(() => {
  const parts = props.question.question.split('___')
  const indices = new Set<number>()
  let pos = 0
  for (let i = 0; i < parts.length; i++) {
    pos += parts[i].length
    if (i < parts.length - 1) {
      indices.add(pos)
      pos++
    }
  }
  return indices
})

const blankIndices = computed(() => {
  return Array.from(blankIndexSet.value)
})

function isCorrectChar(idx: number): boolean {
  if (!props.correctAnswer) return false
  const char = props.fillState?.slots[idx] || ''
  return char === props.correctAnswer[idx]
}

function onSlotTap(idx: number) {
  if (blankIndexSet.value.has(idx) && props.fillState?.slots[idx] !== '') {
    emit('slotTap', idx)
  }
}
</script>

<style lang="scss" scoped>
.question-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
  position: relative;
}

.question-type-tag {
  position: absolute;
  top: 0;
  right: 32rpx;
  padding: 8rpx 24rpx;
  border-radius: 0 0 12rpx 12rpx;
  font-size: 22rpx;
  color: #fff;
  font-weight: 600;

  &.type-fill { background: $color-primary; }
  &.type-meaning { background: #6366f1; }
  &.type-picture { background: #ec4899; }
}

.question-content {
  margin-top: 16rpx;
}

.fill-content {
  .fill-grid {
    display: flex;
    justify-content: center;
    gap: 16rpx;
    margin-top: 20rpx;
  }

  .fill-cell {
    width: 120rpx;
    height: 120rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16rpx;
    font-size: 44rpx;
    font-weight: 700;
    transition: all 0.2s ease;

    &--blank {
      background: #fef3c7;
      border: 3rpx dashed $color-primary;
    }

    &--filled {
      background: #fef9c3;
      border: 3rpx solid $color-primary;
      transform: scale(1.05);
    }

    &--correct {
      background: #d1fae5 !important;
      border-color: $color-correct !important;
      animation: correctPop 0.3s ease;
    }

    &--wrong {
      background: #fee2e2 !important;
      border-color: $color-error !important;
      animation: wrongShake 0.4s ease;
    }
  }

  .fill-char {
    color: #1f2937;
  }
}

.meaning-content {
  text-align: center;

  .meaning-text {
    font-size: 36rpx;
    line-height: 1.6;
    color: #1f2937;
    font-weight: 600;
  }

  .meaning-hint {
    margin-top: 20rpx;
    font-size: 26rpx;
    color: #9ca3af;
  }
}

.picture-content {
  text-align: center;

  .picture-scene {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border-radius: 16rpx;
    padding: 40rpx 32rpx;
    margin-bottom: 16rpx;
  }

  .picture-desc {
    font-size: 34rpx;
    line-height: 1.8;
    color: #92400e;
    font-weight: 600;
  }

  .meaning-hint {
    font-size: 26rpx;
    color: #9ca3af;
  }
}

@keyframes correctPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1.05); }
}

@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-12rpx); }
  40% { transform: translateX(12rpx); }
  60% { transform: translateX(-8rpx); }
  80% { transform: translateX(8rpx); }
}
</style>
