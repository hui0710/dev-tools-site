<template>
  <view class="pk-page">
    <view class="pk-header">
      <text class="pk-title">🎯 好友PK</text>
      <text class="pk-subtitle">挑战好友，比拼成语知识</text>
    </view>

    <!-- 发起挑战 -->
    <view v-if="!isChallenging && !isResult" class="pk-actions">
      <view class="pk-action-card" @tap="createChallenge">
        <text class="pk-action-icon">⚔️</text>
        <text class="pk-action-title">发起挑战</text>
        <text class="pk-action-desc">随机出10题，生成挑战链接</text>
      </view>

      <view class="pk-action-card" @tap="showJoinInput = true">
        <text class="pk-action-icon">🤝</text>
        <text class="pk-action-title">应战好友</text>
        <text class="pk-action-desc">输入挑战码，接受好友挑战</text>
      </view>
    </view>

    <!-- 应战输入 -->
    <view v-if="showJoinInput && !isChallenging" class="pk-join">
      <input
        v-model="challengeCode"
        class="pk-input"
        placeholder="输入挑战码"
        maxlength="20"
      />
      <view class="pk-join-btn" @tap="joinChallenge">
        <text class="pk-join-btn-text">开始应战</text>
      </view>
    </view>

    <!-- 答题中 -->
    <template v-if="isChallenging">
      <view class="pk-game-header">
        <text class="pk-game-progress">{{ gameStore.state.currentIndex + 1 }}/{{ gameStore.state.questions.length }}</text>
        <text class="pk-game-score">🎯 {{ gameStore.state.totalScore }}</text>
        <text v-if="gameStore.state.combo >= 2" class="pk-game-combo">🔥 x{{ getMultiplier(gameStore.state.combo) }}</text>
      </view>

      <view v-if="currentQuestion" class="pk-body">
        <QuestionCard
          :question="currentQuestion"
          :fill-state="fillState"
          :show-result="showAnswerResult"
          :correct-answer="currentQuestion.answer"
          @slot-tap="onSlotTap"
        />

        <AnswerGrid
          :type="currentQuestion.type"
          :options="currentQuestion.options"
          :selected-indices="fillState?.selectedIndices"
          :selected-choice="selectedChoice"
          :show-result="showAnswerResult"
          :correct-answer="currentQuestion.answer"
          :disabled="answering"
          @select="onFillSelect"
          @choice-select="onChoiceSelect"
        />

        <view v-if="showAnswerResult" class="answer-feedback" :class="{ 'answer-feedback--correct': lastResult?.isCorrect }">
          <text class="feedback-icon">{{ lastResult?.isCorrect ? '✅' : '❌' }}</text>
          <text class="feedback-text">{{ lastResult?.isCorrect ? `+${lastResult?.score}分` : lastResult?.correctAnswer }}</text>
        </view>
      </view>
    </template>

    <!-- PK结果 -->
    <view v-if="isResult" class="pk-result">
      <ScoreCard
        title="PK结果"
        :score="gameStore.state.totalScore"
        :correct-count="gameStore.correctCount"
        :total-count="gameStore.state.questions.length"
        :max-combo="gameStore.state.maxCombo"
        :elapsed-time="gameStore.state.elapsedTime"
      />

      <view class="pk-result-actions">
        <view class="pk-btn pk-btn--share" @tap="shareResult">
          <text class="pk-btn-text">分享结果</text>
        </view>
        <view class="pk-btn pk-btn--back" @tap="goBack">
          <text class="pk-btn-text pk-btn-text--back">返回首页</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useGameStore } from '@/stores/game'
import { useQuestion } from '@/composables/useQuestion'
import { useScore } from '@/composables/useScore'
import type { Question, FillState, AnswerResult } from '@/types'
import QuestionCard from '@/components/QuestionCard.vue'
import AnswerGrid from '@/components/AnswerGrid.vue'
import ScoreCard from '@/components/ScoreCard.vue'

const gameStore = useGameStore()
const questionHelper = useQuestion()
const scoreHelper = useScore()

const isChallenging = ref(false)
const isResult = ref(false)
const showJoinInput = ref(false)
const challengeCode = ref('')

const fillState = ref<FillState>({ slots: [], selectedIndices: [] })
const selectedChoice = ref('')
const showAnswerResult = ref(false)
const answering = ref(false)
const lastResult = ref<AnswerResult | null>(null)

const currentQuestion = computed(() => gameStore.currentQuestion)
const getMultiplier = scoreHelper.getMultiplier

onLoad((options: Record<string, string | undefined>) => {
  if (options?.code) {
    challengeCode.value = options.code
    joinChallenge()
  }
})

function createChallenge() {
  const questions = questionHelper.getPKQuestions(10)
  gameStore.initGame('pk', questions)
  isChallenging.value = true

  if (questions[0]?.type === 'fill') {
    initFillState(questions[0])
  }

  // 生成挑战码（简化：用时间戳+随机数）
  const code = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  challengeCode.value = code
}

function joinChallenge() {
  if (!challengeCode.value) {
    uni.showToast({ title: '请输入挑战码', icon: 'none' })
    return
  }
  // 简化实现：直接生成新的一套PK题
  const questions = questionHelper.getPKQuestions(10)
  gameStore.initGame('pk', questions)
  isChallenging.value = true

  if (questions[0]?.type === 'fill') {
    initFillState(questions[0])
  }
}

function initFillState(question: Question) {
  const { slots } = questionHelper.parseFillQuestion(question.question)
  fillState.value = { slots: [...slots], selectedIndices: [] }
}

function onFillSelect(index: number) {
  if (answering.value || !currentQuestion.value) return
  const char = currentQuestion.value.options[index]
  const blankIdx = fillState.value.slots.findIndex(s => s === '')
  if (blankIdx === -1) return

  fillState.value.slots[blankIdx] = char
  fillState.value.selectedIndices.push(index)
  fillState.value = { ...fillState.value, slots: [...fillState.value.slots], selectedIndices: [...fillState.value.selectedIndices] }

  if (fillState.value.slots.every(s => s !== '')) {
    processAnswer(fillState.value.slots.join('') === currentQuestion.value!.answer)
  }
}

function onSlotTap(idx: number) {
  if (answering.value || !currentQuestion.value) return
  const char = fillState.value.slots[idx]
  if (!char) return
  const optIdx = fillState.value.selectedIndices.find(i => currentQuestion.value!.options[i] === char)
  if (optIdx !== undefined) {
    fillState.value.selectedIndices = fillState.value.selectedIndices.filter(i => i !== optIdx)
  }
  fillState.value.slots[idx] = ''
  fillState.value = { ...fillState.value, slots: [...fillState.value.slots], selectedIndices: [...fillState.value.selectedIndices] }
}

function onChoiceSelect(option: string) {
  if (answering.value || !currentQuestion.value) return
  selectedChoice.value = option
  processAnswer(option === currentQuestion.value!.answer)
}

function processAnswer(isCorrect: boolean) {
  answering.value = true
  gameStore.recordAnswer(currentQuestion.value!.id, isCorrect)

  let score = 0
  let multiplier = 1
  if (isCorrect) {
    multiplier = scoreHelper.getMultiplier(gameStore.state.combo)
    score = scoreHelper.calculateScore(gameStore.state.combo)
    gameStore.addScore(score)
    uni.vibrateShort({ type: 'medium' })
  } else {
    uni.vibrateLong()
  }

  lastResult.value = {
    isCorrect, score, combo: gameStore.state.combo, multiplier,
    correctAnswer: currentQuestion.value!.answer,
    explanation: currentQuestion.value!.explanation
  }
  showAnswerResult.value = true

  setTimeout(() => {
    goNext()
  }, 1200)
}

function goNext() {
  showAnswerResult.value = false
  answering.value = false
  selectedChoice.value = ''
  lastResult.value = null
  gameStore.nextQuestion()

  if (gameStore.state.isFinished) {
    gameStore.finishGame()
    isChallenging.value = false
    isResult.value = true
    return
  }

  if (gameStore.currentQuestion?.type === 'fill') {
    initFillState(gameStore.currentQuestion)
  } else {
    fillState.value = { slots: [], selectedIndices: [] }
  }
}

function shareResult() {
  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession',
    type: 0,
    title: '成语大挑战 - 好友PK',
    summary: `我在PK中获得了${gameStore.state.totalScore}分！你能超过我吗？`,
    href: ''
  })
}

function goBack() {
  uni.reLaunch({ url: '/pages/index/index' })
}
</script>

<style lang="scss" scoped>
.pk-page {
  min-height: 100vh;
  background: $color-bg;
  padding: 32rpx;
}

.pk-header {
  text-align: center;
  padding: 60rpx 0 40rpx;
}

.pk-title {
  display: block;
  font-size: 48rpx;
  font-weight: 900;
  color: #6366f1;
}

.pk-subtitle {
  display: block;
  font-size: 28rpx;
  color: #9ca3af;
  margin-top: 12rpx;
}

.pk-actions {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  margin-top: 40rpx;
}

.pk-action-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
  text-align: center;

  &:active { transform: scale(0.98); }
}

.pk-action-icon {
  font-size: 64rpx;
  display: block;
}

.pk-action-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #1f2937;
  margin-top: 16rpx;
}

.pk-action-desc {
  display: block;
  font-size: 26rpx;
  color: #9ca3af;
  margin-top: 8rpx;
}

.pk-join {
  margin-top: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.pk-input {
  height: 88rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 0 32rpx;
  font-size: 32rpx;
  border: 2rpx solid #e5e7eb;
}

.pk-join-btn {
  height: 88rpx;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pk-join-btn-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
}

.pk-game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
}

.pk-game-progress {
  font-size: 30rpx;
  font-weight: 700;
  color: #1f2937;
}

.pk-game-score {
  font-size: 30rpx;
  font-weight: 700;
  color: $color-primary;
}

.pk-game-combo {
  font-size: 24rpx;
  font-weight: 700;
  color: #ef4444;
}

.pk-body {
  margin-top: 16rpx;
}

.answer-feedback {
  margin-top: 24rpx;
  padding: 24rpx 32rpx;
  border-radius: 16rpx;
  text-align: center;
  animation: fadeIn 0.3s ease;

  &--correct { background: #d1fae5; }
  &:not(&--correct) { background: #fee2e2; }

  .feedback-icon { font-size: 48rpx; }
  .feedback-text { display: block; font-size: 32rpx; font-weight: 700; color: #1f2937; margin-top: 8rpx; }
}

.pk-result {
  margin-top: 40rpx;
}

.pk-result-actions {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.pk-btn {
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &--share {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    box-shadow: 0 4rpx 16rpx rgba(99, 102, 241, 0.3);
  }

  &--back {
    background: transparent;
    border: 2rpx solid #e5e7eb;
  }
}

.pk-btn-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;

  &--back { color: #6b7280; font-weight: 400; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
