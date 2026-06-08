/**
 * Fisher-Yates 随机打乱算法
 */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * 基于种子的伪随机数生成器（用于每日挑战同一天出相同题目）
 */
export function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

/**
 * 基于种子的Fisher-Yates打乱（保证同一天题目顺序一致）
 */
export function seededShuffle<T>(array: T[], seed: number): T[] {
  const arr = [...array]
  const random = seededRandom(seed)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * 将日期转为数字seed（YYYYMMDD格式）
 */
export function dateToSeed(date: Date = new Date()): number {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return Number(`${y}${m}${d}`)
}
