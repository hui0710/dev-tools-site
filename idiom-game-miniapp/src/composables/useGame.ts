import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { useUserStore } from '@/stores/user'
import { useQuestion } from './useQuestion'
import { useScore } from './useScore'
import { useTimer } from './useTimer'
import { useAd } from './useAd'
import type { GameMode, Question, AnswerResult, FillState } from '@/types'

export function useGame() {
  const gameStore = useGameStore()
  const userStore = useUserStore()
  const questionHelper = useQuestion()
  const scoreHelper = useScore()
  const timer = useTimer()
  const ad = useAd()

  const currentQuestion = computed(() => gameStore.currentQuestion)
  const gameState = computed(() => gameStore.state)
  const isFinished = computed(() => gameStore.state.isFinished)

  /** fill类型填字状态 */
  let fillState: FillState = { slots: [], selectedIndices: [] }

  /** 初始化fill状态 */
  function initFillState(question: Question) {
    const { slots } = questionHelper.parseFillQuestion(question.question)
    fillState = {
      slots,
      selectedIndices: []
    }
  }

  /** 获取当前fill状态 */
  function getFillState(): FillState {
    return fillState
  }

  /** fill类型选择一个候选字 */
  function selectFillOption(optionIndex: number, question: Question): FillState {
    const char = question.options[optionIndex]
    // 找到第一个空位填入
    const blankIndex = fillState.slots.findIndex(s => s === '')
    if (blankIndex === -1) return fillState

    fillState.slots[blankIndex] = char
    fillState.selectedIndices.push(optionIndex)
    return { ...fillState, slots: [...fillState.slots], selectedIndices: [...fillState.selectedIndices] }
  }

  /** fill类型移除一个已填的字（点击已填位置） */
  function removeFillSlot(slotIndex: number, question: Question): FillState {
    const char = fillState.slots[slotIndex]
    if (!char) return fillState

    // 找到对应的optionIndex
    const optionIdx = fillState.selectedIndices.find(
      idx => question.options[idx] === char
    )
    if (optionIdx !== undefined) {
      fillState.selectedIndices = fillState.selectedIndices.filter(i => i !== optionIdx)
    }
    fillState.slots[slotIndex] = ''
    return { ...fillState, slots: [...fillState.slots], selectedIndices: [...fillState.selectedIndices] }
  }

  /** 检查fill类型是否填完 */
  function isFillComplete(): boolean {
    return fillState.slots.every(s => s !== '')
  }

  /** 判定fill类型答案 */
  function checkFillAnswer(question: Question): boolean {
    const userAnswer = fillState.slots.join('')
    return userAnswer === question.answer
  }

  /** 判定meaning/picture类型答案 */
  function checkChoiceAnswer(selectedOption: string, question: Question): boolean {
    return selectedOption === question.answer
  }

  /**
   * 提交答案并计算结果
   */
  function submitAnswer(isCorrect: boolean): AnswerResult {
    const question = gameStore.currentQuestion
    if (!question) {
      return {
        isCorrect: false,
        score: 0,
        combo: 0,
        multiplier: 1,
        correctAnswer: '',
        explanation: ''
      }
    }

    // 记录答题
    gameStore.recordAnswer(question.id, isCorrect)

    // 计算得分
    let score = 0
    let multiplier = 1
    if (isCorrect) {
      multiplier = scoreHelper.getMultiplier(gameStore.state.combo)
      score = scoreHelper.calculateScore(gameStore.state.combo)
      gameStore.addScore(score)
    }

    // 震动反馈
    if (isCorrect) {
      uni.vibrateShort({ type: 'medium' })
    } else {
      uni.vibrateLong()
    }

    return {
      isCorrect,
      score,
      combo: gameStore.state.combo,
      multiplier,
      correctAnswer: question.answer,
      explanation: question.explanation
    }
  }

  /** 进入下一题 */
  function goToNext(): boolean {
    gameStore.nextQuestion()
    if (gameStore.state.isFinished) {
      timer.stop()
      gameStore.finishGame()
      // 更新用户统计
      saveGameResult()
      return false
    }
    // 初始化新题的fill状态
    if (gameStore.currentQuestion?.type === 'fill') {
      initFillState(gameStore.currentQuestion)
    }
    return true
  }

  /** 开始游戏 */
  function startGame(mode: GameMode, level?: number) {
    const questions = questionHelper.getQuestions(mode, level)
    gameStore.initGame(mode, questions)
    ad.initAd()

    // 初始化fill状态
    if (questions[0]?.type === 'fill') {
      initFillState(questions[0])
    }

    // 每日挑战限时
    if (mode === 'daily') {
      timer.start(60, () => {
        // 单题超时，当作答错
        const result = submitAnswer(false)
        handleTimeout(result)
      })
    }
  }

  /** 处理超时 */
  function handleTimeout(_result: AnswerResult) {
    // 超时等于答错，继续下一题
    setTimeout(() => {
      const hasNext = goToNext()
      if (hasNext && gameStore.state.mode === 'daily') {
        timer.start(60, () => {
          const r = submitAnswer(false)
          handleTimeout(r)
        })
      }
    }, 800)
  }

  /** 复活（看广告） */
  async function revive(): Promise<boolean> {
    const watched = await ad.showRewardAd()
    if (watched) {
      gameStore.revive()
      return true
    }
    return false
  }

  /** 保存游戏结果到用户数据 */
  function saveGameResult() {
    const state = gameStore.state
    const correctCount = Object.values(state.answers).filter(Boolean).length
    const totalQ = state.questions.length

    // 更新用户统计
    state.questions.forEach(q => {
      const correct = state.answers[q.id]
      const score = correct ? scoreHelper.calculateScore(0) : 0
      userStore.recordAnswerStats(correct, score)
    })

    // 根据模式更新进度
    if (state.mode === 'level') {
      const stars = scoreHelper.calculateStars(correctCount, totalQ)
      // 推断当前关卡号
      const currentLevel = Math.floor(gameStore.state.currentIndex / 5) + 1
      userStore.updateLevelProgress(currentLevel, stars)
    } else if (state.mode === 'daily') {
      const today = new Date()
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      userStore.updateDailyRecord(dateStr, state.totalScore)
    }
  }

  /** 重置游戏 */
  function resetGame() {
    timer.stop()
    gameStore.resetGame()
  }

  return {
    // 状态
    currentQuestion,
    gameState,
    isFinished,
    timer,
    ad,

    // fill操作
    getFillState,
    initFillState,
    selectFillOption,
    removeFillSlot,
    isFillComplete,
    checkFillAnswer,

    // 答题
    checkChoiceAnswer,
    submitAnswer,
    goToNext,

    // 游戏流程
    startGame,
    revive,
    resetGame,
    saveGameResult,

    // 辅助
    parseFillQuestion: questionHelper.parseFillQuestion,
    calculateStars: scoreHelper.calculateStars,
    formatScore: scoreHelper.formatScore,
    getMultiplier: scoreHelper.getMultiplier
  }
}
