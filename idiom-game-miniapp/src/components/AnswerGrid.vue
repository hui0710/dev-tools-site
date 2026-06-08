<template>
  <view class="answer-grid">
    <!-- fill类型：单字网格 -->
    <view v-if="type === 'fill'" class="fill-options">
      <view
        v-for="(option, idx) in options"
        :key="idx"
        class="fill-option"
        :class="{
          'fill-option--selected': selectedIndices.includes(idx),
          'fill-option--disabled': disabled
        }"
        @tap="onSelect(idx)"
      >
        <text class="fill-option-char">{{ option }}</text>
      </view>
    </view>

    <!-- meaning/picture类型：长条选项 -->
    <view v-else class="choice-options">
      <view
        v-for="(option, idx) in options"
        :key="idx"
        class="choice-option"
        :class="{
          'choice-option--selected': selectedChoice === option,
          'choice-option--correct': showResult && option === correctAnswer,
          'choice-option--wrong': showResult && selectedChoice === option && option !== correctAnswer,
          'choice-option--disabled': disabled
        }"
        @tap="onChoiceSelect(option)"
      >
        <view class="choice-label">{{ labelChars[idx] }}</view>
        <text class="choice-text">{{ option }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QuestionType } from '@/types'

const props = defineProps<{
  type: QuestionType
  options: string[]
  selectedIndices?: number[]
  selectedChoice?: string
  showResult?: boolean
  correctAnswer?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', index: number): void
  (e: 'choiceSelect', option: string): void
}>()

const labelChars = ['A', 'B', 'C', 'D', 'E', 'F']

function onSelect(idx: number) {
  if (props.disabled || props.selectedIndices?.includes(idx)) return
  emit('select', idx)
}

function onChoiceSelect(option: string) {
  if (props.disabled) return
  emit('choiceSelect', option)
}
</script>

<style lang="scss" scoped>
.answer-grid {
  padding: 24rpx 0;
}

.fill-options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20rpx;
  padding: 0 16rpx;
}

.fill-option {
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 16rpx;
  border: 3rpx solid #e5e7eb;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
  }

  &--selected {
    opacity: 0.4;
    border-color: #d1d5db;
    background: #f3f4f6;
  }

  &--disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .fill-option-char {
    font-size: 40rpx;
    font-weight: 700;
    color: #1f2937;
  }
}

.choice-options {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 0 16rpx;
}

.choice-option {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
  border: 3rpx solid #e5e7eb;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  transition: all 0.25s ease;

  &:active {
    transform: scale(0.98);
  }

  &--selected {
    border-color: $color-primary;
    background: #fffbeb;
  }

  &--correct {
    border-color: $color-correct !important;
    background: #d1fae5 !important;
    animation: correctPop 0.3s ease;
  }

  &--wrong {
    border-color: $color-error !important;
    background: #fee2e2 !important;
    animation: wrongShake 0.4s ease;
  }

  &--disabled {
    pointer-events: none;
  }

  .choice-label {
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26rpx;
    font-weight: 700;
    color: #6b7280;
    margin-right: 20rpx;
    flex-shrink: 0;
  }

  &--correct .choice-label {
    background: $color-correct;
    color: #fff;
  }

  &--wrong .choice-label {
    background: $color-error;
    color: #fff;
  }

  .choice-text {
    font-size: 32rpx;
    color: #1f2937;
    font-weight: 500;
  }
}

@keyframes correctPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8rpx); }
  40% { transform: translateX(8rpx); }
  60% { transform: translateX(-6rpx); }
  80% { transform: translateX(6rpx); }
}
</style>
