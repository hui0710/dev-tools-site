/** 题目类型 */
export type QuestionType = 'fill' | 'meaning' | 'picture'

/** 难度等级 */
export type Difficulty = 1 | 2 | 3

/** 游戏模式 */
export type GameMode = 'daily' | 'level' | 'pk'

/** 题目数据结构 */
export interface Question {
  id: number
  type: QuestionType
  difficulty: Difficulty
  question: string
  options: string[]
  answer: string
  explanation: string
}

/** 题库数据结构 */
export interface QuestionBank {
  questions: Question[]
}

/** 游戏状态 */
export interface GameState {
  /** 当前游戏模式 */
  mode: GameMode
  /** 当前题目索引 */
  currentIndex: number
  /** 当前模式的题目列表 */
  questions: Question[]
  /** 答题记录：题目id -> 是否正确 */
  answers: Record<number, boolean>
  /** 连击数 */
  combo: number
  /** 最高连击数 */
  maxCombo: number
  /** 总得分 */
  totalScore: number
  /** 答错是否已复活（每关/每局一次） */
  hasRevived: boolean
  /** 游戏是否结束 */
  isFinished: boolean
  /** 开始时间戳 */
  startTime: number
  /** 用时(秒) */
  elapsedTime: number
}

/** 每日挑战配置 */
export interface DailyConfig {
  /** 每天题目数 */
  questionCount: number
  /** 每题限时(秒) */
  timePerQuestion: number
}

/** 闯关模式配置 */
export interface LevelConfig {
  /** 每关题目数 */
  questionsPerLevel: number
  /** 总关卡数 */
  totalLevels: number
}

/** 用户数据 */
export interface UserData {
  /** 用户昵称 */
  nickname: string
  /** 头像 */
  avatar: string
  /** 总答题数 */
  totalAnswered: number
  /** 总答对数 */
  totalCorrect: number
  /** 总得分 */
  totalScore: number
  /** 闯关进度（当前关卡，从1开始） */
  currentLevel: number
  /** 每关星级评价：关卡号 -> 星数(1-3) */
  levelStars: Record<number, number>
  /** 每日挑战最近完成日期(YYYY-MM-DD) */
  lastDailyDate: string
  /** 每日挑战今日最佳分数 */
  dailyBestScore: number
  /** 是否开启音效 */
  soundEnabled: boolean
  /** 是否开启震动 */
  vibrationEnabled: boolean
}

/** 排行榜条目 */
export interface RankItem {
  rank: number
  nickname: string
  avatar: string
  score: number
  combo: number
}

/** 排行榜类型 */
export type RankType = 'daily' | 'weekly'

/** PK挑战数据 */
export interface PKChallenge {
  /** 挑战ID */
  id: string
  /** 出题者昵称 */
  challengerName: string
  /** 题目ID列表 */
  questionIds: number[]
  /** 出题者分数 */
  challengerScore: number
  /** 出题者连击 */
  challengerCombo: number
  /** 应战者昵称 */
  opponentName: string
  /** 应战者分数 */
  opponentScore: number
  /** 应战者连击 */
  opponentCombo: number
  /** 创建时间 */
  createdAt: number
}

/** fill题型用户填字状态 */
export interface FillState {
  /** 成语4个字，每个位置当前填入的字，空字符串表示未填 */
  slots: string[]
  /** 已选中的选项索引 */
  selectedIndices: number[]
}

/** 答题结果 */
export interface AnswerResult {
  isCorrect: boolean
  score: number
  combo: number
  multiplier: number
  correctAnswer: string
  explanation: string
}
