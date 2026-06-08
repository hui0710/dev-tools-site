import { ref, computed } from 'vue'

export function useScore() {
  const baseScore = 100

  /**
   * 根据连击数计算分数倍率
   * 2连击x1.5，3连击x2，5连击x3
   */
  function getMultiplier(combo: number): number {
    if (combo >= 5) return 3
    if (combo >= 3) return 2
    if (combo >= 2) return 1.5
    return 1
  }

  /**
   * 计算单题得分
   */
  function calculateScore(combo: number): number {
    const multiplier = getMultiplier(combo)
    return Math.floor(baseScore * multiplier)
  }

  /**
   * 根据答对数和总题数计算星级
   * 全对3星，80%以上2星，50%以上1星
   */
  function calculateStars(correct: number, total: number): number {
    const ratio = correct / total
    if (ratio >= 1) return 3
    if (ratio >= 0.8) return 2
    if (ratio >= 0.5) return 1
    return 0
  }

  /**
   * 格式化分数显示
   */
  function formatScore(score: number): string {
    if (score >= 10000) {
      return (score / 10000).toFixed(1) + '万'
    }
    return score.toString()
  }

  return {
    baseScore,
    getMultiplier,
    calculateScore,
    calculateStars,
    formatScore
  }
}
