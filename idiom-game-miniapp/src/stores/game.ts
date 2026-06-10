import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameState, GameMode, Question } from '@/types'
import { getStorage, setStorage } from '@/utils/storage'

function createDefaultState(): GameState {
  return {
    mode: 'daily',
    currentIndex: 0,
    questions: [],
    answers: {},
    combo: 0,
    maxCombo: 0,
    totalScore: 0,
    reviveCount: 0,
    isFinished: false,
    startTime: 0,
    elapsedTime: 0
  }
}

export const useGameStore = defineStore('game', () => {
  const state = ref<GameState>(createDefaultState())

  const currentQuestion = computed<Question | null>(() => {
    if (state.value.currentIndex < state.value.questions.length) {
      return state.value.questions[state.value.currentIndex]
    }
    return null
  })

  const correctCount = computed(() => {
    return Object.values(state.value.answers).filter(Boolean).length
  })

  const totalAnswered = computed(() => {
    return Object.keys(state.value.answers).length
  })

  /** 初始化游戏 */
  function initGame(mode: GameMode, questions: Question[]) {
    state.value = {
      ...createDefaultState(),
      mode,
      questions,
      startTime: Date.now()
    }
    // 持久化当前游戏进度
    saveState()
  }

  /** 记录答题 */
  function recordAnswer(questionId: number, isCorrect: boolean) {
    state.value.answers[questionId] = isCorrect
    if (isCorrect) {
      state.value.combo++
      if (state.value.combo > state.value.maxCombo) {
        state.value.maxCombo = state.value.combo
      }
    } else {
      state.value.combo = 0
    }
    saveState()
  }

  /** 增加分数 */
  function addScore(score: number) {
    state.value.totalScore += score
    saveState()
  }

  /** 下一题 */
  function nextQuestion() {
    state.value.currentIndex++
    if (state.value.currentIndex >= state.value.questions.length) {
      state.value.isFinished = true
    }
    saveState()
  }

  /** 复活（答错后看广告继续） */
  function revive() {
    state.value.reviveCount++
    // 答错的题不算，移除最后一题的记录
    saveState()
  }

  /** 设置用时 */
  function setElapsedTime(seconds: number) {
    state.value.elapsedTime = seconds
    saveState()
  }

  /** 标记游戏结束 */
  function finishGame() {
    state.value.isFinished = true
    state.value.elapsedTime = Math.floor((Date.now() - state.value.startTime) / 1000)
    saveState()
  }

  /** 重置游戏 */
  function resetGame() {
    state.value = createDefaultState()
    removeState()
  }

  function saveState() {
    setStorage('game_state', state.value)
  }

  function removeState() {
    try {
      uni.removeStorageSync('idiom_game_game_state')
    } catch { /* ignore */ }
  }

  /** 恢复游戏进度 */
  function restoreState() {
    const saved = getStorage<GameState | null>('game_state', null)
    if (saved) {
      state.value = saved
    }
  }

  return {
    state,
    currentQuestion,
    correctCount,
    totalAnswered,
    initGame,
    recordAnswer,
    addScore,
    nextQuestion,
    revive,
    setElapsedTime,
    finishGame,
    resetGame,
    restoreState
  }
})
