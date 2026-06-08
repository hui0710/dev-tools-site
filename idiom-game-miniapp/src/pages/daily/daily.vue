<template>
  <view class="daily-page">
    <!-- 顶部状态栏 -->
    <view class="daily-header">
      <view class="daily-header__left">
        <text class="daily-progress">{{ gameStore.state.currentIndex + 1 }}/{{ gameStore.state.questions.length }}</text>
      </view>
      <view class="daily-header__center">
        <Timer :remaining="timer.remaining.value" :total="timer.total.value" />
      </view>
      <view class="daily-header__right">
        <text class="daily-score">🎯 {{ gameStore.state.totalScore }}</text>
        <text v-if="gameStore.state.combo >= 2" class="daily-combo">🔥 x{{ getMultiplier(gameStore.state.combo) }}</text>
      </view>
    </view>

    <!-- 进度条 -->
    <view class="daily-progress-bar">
      <view class="progress-fill" :style="{ width: progressPercent + '%' }" />
    </view>

    <!-- 题目区域 -->
    <view v-if="currentQuestion" class="daily-body">
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

      <!-- 答题结果反馈 -->
      <view v-if="showAnswerResult" class="answer-feedback" :class="{ 'answer-feedback--correct': lastResult?.isCorrect }">
        <text class="feedback-icon">{{ lastResult?.isCorrect ? '✅' : '❌' }}</text>
        <text class="feedback-text">{{ lastResult?.isCorrect ? `+${lastResult?.score}分` : lastResult?.correctAnswer }}</text>
        <text class="feedback-explanation">{{ lastResult?.explanation }}</text>
      </view>
    </view>

    <!-- 广告复活弹窗 -->
    <AdReward
      :visible="showAdDialog"
      title="继续答题"
      description="观看一段广告视频，即可继续答题"
      @watch="onWatchAd"
      @skip="onSkipAd"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/game'
import { useQuestion } from '@/composables/useQuestion'
import { useScore } from '@/composables/useScore'
import { useTimer } from '@/composables/useTimer'
import { useAd } from '@/composables/useAd'
import type { Question, FillState, AnswerResult } from '@/types'
import QuestionCard from '@/components/QuestionCard.vue'
import AnswerGrid from '@/components/AnswerGrid.vue'
import Timer from '@/components/Timer.vue'
import AdReward from '@/components/AdReward.vue'

const gameStore = useGameStore()
const questionHelper = useQuestion()
const scoreHelper = useScore()
const timer = useTimer()
const ad = useAd()

const fillState = ref<FillState>({ slots: [], selectedIndices: [] })
const selectedChoice = ref('')
const showAnswerResult = ref(false)
const answering = ref(false)
const lastResult = ref<AnswerResult | null>(null)
const showAdDialog = ref(false)

const currentQuestion = computed(() => gameStore.currentQuestion)
const getMultiplier = scoreHelper.getMultiplier

const progressPercent = computed(() => {
  const total = gameStore.state.questions.length
  if (total === 0) return 0
  return ((gameStore.state.currentIndex) / total) * 100
})

onMounted(() => {
  startDailyGame()
})

onUnmounted(() => {
  timer.stop()
})

function startDailyGame() {
  const questions = questionHelper.getDailyQuestions(10)
  gameStore.initGame('daily', questions)
  ad.initAd()

  if (questions[0]?.type === 'fill') {
    initFillState(questions[0])
  }

  startQuestionTimer()
}

function startQuestionTimer() {
  timer.start(60, () => {
    handleTimeout()
  })
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

  // 检查是否填完
  if (fillState.value.slots.every(s => s !== '')) {
    checkFillAnswer()
  }
}

function onSlotTap(idx: number) {
  if (answering.value || !currentQuestion.value) return
  // 移除已填的字
  const char = fillState.value.slots[idx]
  if (!char) return

  const optIdx = fillState.value.selectedIndices.find(
    i => currentQuestion.value!.options[i] === char
  )
  if (optIdx !== undefined) {
    fillState.value.selectedIndices = fillState.value.selectedIndices.filter(i => i !== optIdx)
  }
  fillState.value.slots[idx] = ''
  fillState.value = { ...fillState.value, slots: [...fillState.value.slots], selectedIndices: [...fillState.value.selectedIndices] }
}

function onChoiceSelect(option: string) {
  if (answering.value || !currentQuestion.value) return
  selectedChoice.value = option
  checkChoiceAnswer(option)
}

function checkFillAnswer() {
  const userAnswer = fillState.value.slots.join('')
  const isCorrect = userAnswer === currentQuestion.value!.answer
  processAnswer(isCorrect)
}

function checkChoiceAnswer(selected: string) {
  const isCorrect = selected === currentQuestion.value!.answer
  processAnswer(isCorrect)
}

function processAnswer(isCorrect: boolean) {
  answering.value = true
  timer.pause()

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
    isCorrect,
    score,
    combo: gameStore.state.combo,
    multiplier,
    correctAnswer: currentQuestion.value!.answer,
    explanation: currentQuestion.value!.explanation
  }
  showAnswerResult.value = true

  // 延迟进入下一题
  setTimeout(() => {
    if (isCorrect) {
      goNext()
    } else {
      // 答错，检查是否可以复活
      if (!gameStore.state.hasRevived) {
        showAdDialog.value = true
      } else {
        goNext()
      }
    }
  }, 1500)
}

function handleTimeout() {
  processAnswer(false)
}

function goNext() {
  showAnswerResult.value = false
  answering.value = false
  selectedChoice.value = ''
  lastResult.value = null

  gameStore.nextQuestion()

  if (gameStore.state.isFinished) {
    gameStore.finishGame()
    uni.redirectTo({ url: `/pages/result/result?mode=daily&score=${gameStore.state.totalScore}&correct=${gameStore.correctCount}&total=${gameStore.state.questions.length}&combo=${gameStore.state.maxCombo}&time=${gameStore.state.elapsedTime}` })
    return
  }

  // 初始化下一题
  if (gameStore.currentQuestion?.type === 'fill') {
    initFillState(gameStore.currentQuestion)
  } else {
    fillState.value = { slots: [], selectedIndices: [] }
  }

  startQuestionTimer()
}

async function onWatchAd() {
  showAdDialog.value = false
  const success = await ad.showRewardAd()
  if (success) {
    gameStore.revive()
    goNext()
  } else {
    goNext()
  }
}

function onSkipAd() {
  showAdDialog.value = false
  goNext()
}
</script>

<style lang="scss" scoped>
.daily-page {
  min-height: 100vh;
  background: $color-bg;
  padding-bottom: 40rpx;
}

.daily-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.daily-header__left {
  .daily-progress {
    font-size: 30rpx;
    font-weight: 700;
    color: #1f2937;
  }
}

.daily-header__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  .daily-score {
    font-size: 30rpx;
    font-weight: 700;
    color: $color-primary;
  }

  .daily-combo {
    font-size: 24rpx;
    font-weight: 700;
    color: #ef4444;
    margin-top: 4rpx;
  }
}

.daily-progress-bar {
  height: 6rpx;
  background: #f3f4f6;

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, $color-primary, #d97706);
    transition: width 0.3s ease;
    border-radius: 3rpx;
  }
}

.daily-body {
  padding: 32rpx;
}

.answer-feedback {
  margin-top: 24rpx;
  padding: 24rpx 32rpx;
  border-radius: 16rpx;
  text-align: center;
  animation: fadeIn 0.3s ease;

  &--correct {
    background: #d1fae5;
  }

  &:not(&--correct) {
    background: #fee2e2;
  }

  .feedback-icon {
    font-size: 48rpx;
  }

  .feedback-text {
    display: block;
    font-size: 32rpx;
    font-weight: 700;
    color: #1f2937;
    margin-top: 8rpx;
  }

  .feedback-explanation {
    display: block;
    font-size: 26rpx;
    color: #6b7280;
    margin-top: 8rpx;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
