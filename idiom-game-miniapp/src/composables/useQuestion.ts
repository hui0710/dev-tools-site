import type { Question, QuestionBank, GameMode, Difficulty } from '@/types'
import { shuffle, seededShuffle, dateToSeed } from '@/utils/shuffle'

import easyData from '@/data/idioms-easy.json'
import mediumData from '@/data/idioms-medium.json'
import hardData from '@/data/idioms-hard.json'

const easyBank = (easyData as unknown as QuestionBank).questions
const mediumBank = (mediumData as unknown as QuestionBank).questions
const hardBank = (hardData as unknown as QuestionBank).questions

/** 所有题目按难度分组 */
const questionsByDifficulty: Record<Difficulty, Question[]> = {
  1: easyBank,
  2: mediumBank,
  3: hardBank
}

/** 所有题目合集 */
const allQuestions: Question[] = [...easyBank, ...mediumBank, ...hardBank]

export function useQuestion() {
  /**
   * 每日挑战：用当天日期做seed，保证同一天题目相同
   */
  function getDailyQuestions(count: number = 10): Question[] {
    const seed = dateToSeed()
    const shuffled = seededShuffle(allQuestions, seed)
    return shuffled.slice(0, count)
  }

  /**
   * 闯关模式：根据关卡号选取对应难度的题目
   * 关卡1-100用简单题，101-200用中等题，201-300用困难题
   */
  function getLevelQuestions(level: number, count: number = 5): Question[] {
    let difficulty: Difficulty = 1
    if (level > 200) difficulty = 3
    else if (level > 100) difficulty = 2

    const pool = questionsByDifficulty[difficulty]
    // 用关卡号做seed保证同一关题目固定
    const seed = level * 1000 + difficulty
    const shuffled = seededShuffle(pool, seed)
    return shuffled.slice(0, count)
  }

  /**
   * PK模式：随机抽取一套题
   */
  function getPKQuestions(count: number = 10): Question[] {
    const shuffled = shuffle(allQuestions)
    return shuffled.slice(0, count)
  }

  /**
   * 根据游戏模式获取题目
   */
  function getQuestions(mode: GameMode, level?: number): Question[] {
    switch (mode) {
      case 'daily':
        return getDailyQuestions()
      case 'level':
        return getLevelQuestions(level || 1)
      case 'pk':
        return getPKQuestions()
      default:
        return getDailyQuestions()
    }
  }

  /**
   * 根据ID列表获取题目
   */
  function getQuestionsByIds(ids: number[]): Question[] {
    const map = new Map(allQuestions.map(q => [q.id, q]))
    return ids.map(id => map.get(id)).filter(Boolean) as Question[]
  }

  /**
   * 解析fill类型的题目，返回空位信息
   * "画___添___" -> { slots: ["画", "", "添", ""], blankIndices: [1, 3] }
   */
  function parseFillQuestion(question: string) {
    const parts = question.split('___')
    const slots: string[] = []
    const blankIndices: number[] = []
    let pos = 0
    for (let i = 0; i < parts.length; i++) {
      for (const char of parts[i]) {
        slots.push(char)
        pos++
      }
      if (i < parts.length - 1) {
        blankIndices.push(pos)
        slots.push('')
        pos++
      }
    }
    return { slots, blankIndices }
  }

  return {
    getDailyQuestions,
    getLevelQuestions,
    getPKQuestions,
    getQuestions,
    getQuestionsByIds,
    parseFillQuestion,
    allQuestions
  }
}
