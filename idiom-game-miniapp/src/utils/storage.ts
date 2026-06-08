/**
 * 本地存储封装
 * 微信小程序使用 uni.getStorageSync / uni.setStorageSync
 */

const PREFIX = 'idiom_game_'

function getKey(key: string): string {
  return PREFIX + key
}

export function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const value = uni.getStorageSync(getKey(key))
    return value !== '' ? (value as T) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setStorage<T>(key: string, value: T): void {
  try {
    uni.setStorageSync(getKey(key), value)
  } catch (e) {
    console.error('Storage set error:', e)
  }
}

export function removeStorage(key: string): void {
  try {
    uni.removeStorageSync(getKey(key))
  } catch (e) {
    console.error('Storage remove error:', e)
  }
}

export function clearStorage(): void {
  try {
    uni.clearStorageSync()
  } catch (e) {
    console.error('Storage clear error:', e)
  }
}
