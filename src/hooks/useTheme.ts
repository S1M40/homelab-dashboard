import { useState, useEffect, useCallback } from 'react'
import type { Theme } from '../types'

const STORAGE_KEY = 'homelab-theme'
const DEFAULT_THEME: Theme = 'dark'

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  const isDark =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : theme === 'dark'

  if (isDark) {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.add('light')
    root.classList.remove('dark')
  }
  root.setAttribute('data-theme', isDark ? 'dark' : 'light')
  root.style.colorScheme = isDark ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
      if (stored === 'dark' || stored === 'light' || stored === 'system') return stored
    } catch {
      // localStorage not available
    }
    return DEFAULT_THEME
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Listen for system theme changes when theme === 'system'
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
    setThemeState(next)
    applyTheme(next)
  }, [])

  return { theme, setTheme }
}
