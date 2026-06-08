import { ref, watch, onMounted } from 'vue'

const isDark = ref(false)

export function useTheme() {
  onMounted(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      isDark.value = true
    }
    applyTheme()
  })

  function applyTheme() {
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    applyTheme()
  }

  watch(isDark, applyTheme)

  return { isDark, toggleTheme }
}
