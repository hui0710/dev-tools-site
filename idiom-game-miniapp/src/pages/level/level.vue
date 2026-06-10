<template>
  <view class="level-page">
    <!-- 答题模式 -->
    <template v-if="isPlaying">
      <view class="level-header">
        <view class="level-header__left">
          <text class="level-tag">第{{ currentLevel }}关</text>
        </view>
        <view class="level-header__center">
          <text class="level-progress">{{ gameStore.state.currentIndex + 1 }}/{{ gameStore.state.questions.length }}</text>
        </view>
        <view class="level-header__right">
          <text class="level-score">🎯 {{ gameStore.state.totalScore }}</text>
          <text v-if="gameStore.state.combo >= 2" class="level-combo">🔥 x{{ getMultiplier(gameStore.state.combo) }}</text>
        </view>
      </view>

      <view class="level-progress-bar">
        <view class="progress-fill" :style="{ width: levelProgressPercent + '%' }" />
      </view>

      <view v-if="currentQuestion" class="level-body">
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
          <text class="feedback-explanation">{{ lastResult?.explanation }}</text>
        </view>
      </view>

      <AdReward
        :visible="showAdDialog"
        title="继续答题"
        description="观看一段广告视频，即可继续答题闯关"
        @watch="onWatchAd"
        @skip="onSkipAd"
      />
    </template>

    <!-- 关卡选择模式 -->
    <template v-else>
      <view class="level-select-header">
        <text class="level-select-title">闯关模式</text>
        <text class="level-select-sub">当前进度：第{{ userStore.user.currentLevel }}关</text>
      </view>

      <scroll-view scroll-y class="level-grid-scroll">
        <view class="level-grid">
          <view
            v-for="level in totalLevels"
            :key="level"
            class="level-item"
            :class="{
              'level-item--locked': level > userStore.user.currentLevel,
              'level-item--current': level === userStore.user.currentLevel,
              'level-item--completed': level < userStore.user.currentLevel
            }"
            @tap="onLevelTap(level)"
          >
            <text class="level-item__num">{{ level }}</text>
            <view v-if="level < userStore.user.currentLevel" class="level-item__stars">
              <text
                v-for="s in 3"
                :key="s"
                class="mini-star"
                :class="{ 'mini-star--active': s <= (userStore.user.levelStars[level] || 0) }"
              >★</text>
            </view>
            <text v-else-if="level === userStore.user.currentLevel" class="level-item__status">当前</text>
            <text v-else class="level-item__lock">🔒</text>
          </view>
        </view>
      </scroll-view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '@/stores/game'
import { useUserStore } from '@/stores/user'
import { useQuestion } from '@/composables/useQuestion'
import { useScore } from '@/composables/useScore'
import { useAd } from '@/composables/useAd'
import type { Question, FillState, AnswerResult } from '@/types'
import QuestionCard from '@/components/QuestionCard.vue'
import AnswerGrid from '@/components/AnswerGrid.vue'
import AdReward from '@/components/AdReward.vue'

const gameStore = useGameStore()
const userStore = useUserStore()
const questionHelper = useQuestion()
const scoreHelper = useScore()
const ad = useAd()

const totalLevels = 300
const isPlaying = ref(false)
const currentLevel = ref(1)
const fillState = ref<FillState>({ slots: [], selectedIndices: [] })
const selectedChoice = ref('')
const showAnswerResult = ref(false)
const answering = ref(false)
const lastResult = ref<AnswerResult | null>(null)
const showAdDialog = ref(false)

const currentQuestion = computed(() => gameStore.currentQuestion)
const getMultiplier = scoreHelper.getMultiplier

const levelProgressPercent = computed(() => {
  const total = gameStore.state.questions.length
  if (total === 0) return 0
  return (gameStore.state.currentIndex / total) * 100
})

function onLevelTap(level: number) {
  if (level > userStore.user.currentLevel) {
    uni.showToast({ title: '请先通过前面的关卡', icon: 'none' })
    return
  }
  startLevelGame(level)
}

function startLevelGame(level: number) {
  currentLevel.value = level
  isPlaying.value = true
  const questions = questionHelper.getLevelQuestions(level, 5)
  gameStore.initGame('level', questions)
  ad.initAd()

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
    checkFillAnswer()
  }
}

function onSlotTap(idx: number) {
  if (answering.value || !currentQuestion.value) return
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
  processAnswer(userAnswer === currentQuestion.value!.answer)
}

function checkChoiceAnswer(selected: string) {
  processAnswer(selected === currentQuestion.value!.answer)
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
    if (isCorrect) {
      goNext()
    } else {
      if (gameStore.state.reviveCount === 0) {
        // 第一次答错免费复活
        gameStore.revive()
        goNext()
      } else if (gameStore.state.reviveCount === 1) {
        // 第二次答错，显示"看广告复活"选项
        showAdDialog.value = true
      } else {
        goNext()
      }
    }
  }, 1500)
}

function goNext() {
  showAnswerResult.value = false
  answering.value = false
  selectedChoice.value = ''
  lastResult.value = null

  gameStore.nextQuestion()

  if (gameStore.state.isFinished) {
    gameStore.finishGame()
    const stars = scoreHelper.calculateStars(gameStore.correctCount, gameStore.state.questions.length)
    userStore.updateLevelProgress(currentLevel.value, stars)
    uni.redirectTo({
      url: `/pages/result/result?mode=level&score=${gameStore.state.totalScore}&correct=${gameStore.correctCount}&total=${gameStore.state.questions.length}&combo=${gameStore.state.maxCombo}&time=${gameStore.state.elapsedTime}&stars=${stars}&level=${currentLevel.value}`
    })
    return
  }

  if (gameStore.currentQuestion?.type === 'fill') {
    initFillState(gameStore.currentQuestion)
  } else {
    fillState.value = { slots: [], selectedIndices: [] }
  }
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
.level-page {
  height: 100%;
  background: $color-bg;
  box-sizing: border-box;
  overflow: hidden;
}

.level-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.level-tag {
  font-size: 30rpx;
  font-weight: 700;
  color: $color-primary;
  background: #fef3c7;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

.level-progress {
  font-size: 30rpx;
  font-weight: 700;
  color: #1f2937;
}

.level-header__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  .level-score {
    font-size: 30rpx;
    font-weight: 700;
    color: $color-primary;
  }

  .level-combo {
    font-size: 24rpx;
    font-weight: 700;
    color: #ef4444;
    margin-top: 4rpx;
  }
}

.level-progress-bar {
  height: 6rpx;
  background: #f3f4f6;

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, $color-primary, #d97706);
    transition: width 0.3s ease;
    border-radius: 3rpx;
  }
}

.level-body {
  padding: 32rpx;
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
  .feedback-explanation { display: block; font-size: 26rpx; color: #6b7280; margin-top: 8rpx; }
}

/* 关卡选择 */
.level-select-header {
  text-align: center;
  padding: 60rpx 32rpx 32rpx;
}

.level-select-title {
  display: block;
  font-size: 44rpx;
  font-weight: 900;
  color: $color-primary;
}

.level-select-sub {
  display: block;
  font-size: 28rpx;
  color: #92400e;
  margin-top: 12rpx;
}

.level-grid-scroll {
  height: calc(100vh - 200rpx);
}

.level-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 16rpx 24rpx;
  gap: 20rpx;
}

.level-item {
  width: calc(20% - 16rpx);
  aspect-ratio: 1;
  background: #fff;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:active { transform: scale(0.95); }

  &--current {
    border: 3rpx solid $color-primary;
    background: #fffbeb;
  }

  &--completed {
    background: #f0fdf4;
  }

  &--locked {
    opacity: 0.5;
  }
}

.level-item__num {
  font-size: 36rpx;
  font-weight: 800;
  color: #1f2937;
}

.level-item__stars {
  display: flex;
  gap: 2rpx;
  margin-top: 6rpx;
}

.mini-star {
  font-size: 18rpx;
  color: #d1d5db;

  &--active { color: $color-primary; }
}

.level-item__status {
  font-size: 20rpx;
  color: $color-primary;
  font-weight: 600;
  margin-top: 4rpx;
}

.level-item__lock {
  font-size: 28rpx;
  margin-top: 4rpx;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
