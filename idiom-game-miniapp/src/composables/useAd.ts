import { ref } from 'vue'

export function useAd() {
  const isAdLoading = ref(false)
  const isAdAvailable = ref(true)
  let rewardedVideoAd: WechatMiniprogram.RewardedVideoAd | null = null

  /** 初始化激励视频广告 */
  function initAd(adUnitId: string = 'adunit-placeholder') {
    try {
      // #ifdef MP-WEIXIN
      rewardedVideoAd = uni.createRewardedVideoAd({ adUnitId })
      rewardedVideoAd.onLoad(() => {
        isAdAvailable.value = true
      })
      rewardedVideoAd.onError(() => {
        isAdAvailable.value = false
      })
      // #endif
    } catch (e) {
      console.error('广告初始化失败:', e)
      isAdAvailable.value = false
    }
  }

  /**
   * 展示激励视频广告
   * @returns Promise<boolean> 是否成功看完广告
   */
  function showRewardAd(): Promise<boolean> {
    return new Promise((resolve) => {
      // #ifdef MP-WEIXIN
      if (!rewardedVideoAd) {
        initAd()
      }

      if (!rewardedVideoAd) {
        resolve(false)
        return
      }

      isAdLoading.value = true

      const onClose = (res: { isEnded: boolean }) => {
        rewardedVideoAd?.offClose(onClose)
        rewardedVideoAd?.offError(onError)
        isAdLoading.value = false
        // 用户完整看完广告才给奖励
        resolve(res.isEnded)
      }

      const onError = () => {
        rewardedVideoAd?.offClose(onClose)
        rewardedVideoAd?.offError(onError)
        isAdLoading.value = false
        uni.showToast({ title: '广告加载失败', icon: 'none' })
        resolve(false)
      }

      rewardedVideoAd.onClose(onClose)
      rewardedVideoAd.onError(onError)

      rewardedVideoAd.show().catch(() => {
        // 广告还没加载好，先加载再显示
        rewardedVideoAd?.load().then(() => {
          rewardedVideoAd?.show()
        }).catch(() => {
          isAdLoading.value = false
          uni.showToast({ title: '广告加载失败', icon: 'none' })
          resolve(false)
        })
      })
      // #endif

      // #ifndef MP-WEIXIN
      // 非微信环境模拟广告成功
      setTimeout(() => {
        isAdLoading.value = false
        resolve(true)
      }, 1000)
      // #endif
    })
  }

  return {
    isAdLoading,
    isAdAvailable,
    initAd,
    showRewardAd
  }
}
