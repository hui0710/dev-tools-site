import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserData } from '@/types'
import { getStorage, setStorage } from '@/utils/storage'

function createDefaultUser(): UserData {
  return {
    nickname: '成语达人',
    avatar: '',
    totalAnswered: 0,
    totalCorrect: 0,
    totalScore: 0,
    currentLevel: 1,
    levelStars: {},
    lastDailyDate: '',
    dailyBestScore: 0,
    soundEnabled: true,
    vibrationEnabled: true
  }
}

export const useUserStore = defineStore('user', () => {
  const user = ref<UserData>(getStorage<UserData>('user_data', createDefaultUser()))

  const accuracy = computed(() => {
    if (user.value.totalAnswered === 0) return 0
    return Math.round((user.value.totalCorrect / user.value.totalAnswered) * 100)
  })

  /** 记录答题统计 */
  function recordAnswerStats(correct: boolean, score: number) {
    user.value.totalAnswered++
    if (correct) {
      user.value.totalCorrect++
    }
    user.value.totalScore += score
    saveUser()
  }

  /** 更新闯关进度 */
  function updateLevelProgress(level: number, stars: number) {
    user.value.currentLevel = Math.max(user.value.currentLevel, level + 1)
    const oldStars = user.value.levelStars[level] || 0
    user.value.levelStars[level] = Math.max(oldStars, stars)
    saveUser()
  }

  /** 更新每日挑战记录 */
  function updateDailyRecord(date: string, score: number) {
    if (user.value.lastDailyDate === date) {
      user.value.dailyBestScore = Math.max(user.value.dailyBestScore, score)
    } else {
      user.value.lastDailyDate = date
      user.value.dailyBestScore = score
    }
    saveUser()
  }

  /** 切换音效 */
  function toggleSound() {
    user.value.soundEnabled = !user.value.soundEnabled
    saveUser()
  }

  /** 切换震动 */
  function toggleVibration() {
    user.value.vibrationEnabled = !user.value.vibrationEnabled
    saveUser()
  }

  /** 设置用户信息 */
  function setUserInfo(info: Partial<UserData>) {
    Object.assign(user.value, info)
    saveUser()
  }

  function saveUser() {
    setStorage('user_data', user.value)
  }

  return {
    user,
    accuracy,
    recordAnswerStats,
    updateLevelProgress,
    updateDailyRecord,
    toggleSound,
    toggleVibration,
    setUserInfo
  }
})
