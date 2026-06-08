import { ref, onUnmounted } from 'vue'

export function useTimer() {
  const remaining = ref(0)
  const total = ref(0)
  const isRunning = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  /** 开始倒计时 */
  function start(seconds: number, onTimeout?: () => void) {
    stop()
    remaining.value = seconds
    total.value = seconds
    isRunning.value = true

    timer = setInterval(() => {
      remaining.value--
      if (remaining.value <= 0) {
        remaining.value = 0
        isRunning.value = false
        stop()
        onTimeout?.()
      }
    }, 1000)
  }

  /** 停止计时 */
  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    isRunning.value = false
  }

  /** 暂停 */
  function pause() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    isRunning.value = false
  }

  /** 继续 */
  function resume(onTimeout?: () => void) {
    if (remaining.value <= 0) return
    isRunning.value = true
    timer = setInterval(() => {
      remaining.value--
      if (remaining.value <= 0) {
        remaining.value = 0
        isRunning.value = false
        stop()
        onTimeout?.()
      }
    }, 1000)
  }

  /** 进度百分比（0-1） */
  function progress(): number {
    if (total.value === 0) return 1
    return remaining.value / total.value
  }

  onUnmounted(() => {
    stop()
  })

  return {
    remaining,
    total,
    isRunning,
    start,
    stop,
    pause,
    resume,
    progress
  }
}
