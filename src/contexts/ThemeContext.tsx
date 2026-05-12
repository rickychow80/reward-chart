'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { applyTheme, themes } from '@/lib/themes'
import type { ThemeKey } from '@/types'

interface ThemeContextValue {
  theme: ThemeKey
  setTheme: (key: ThemeKey) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'bright',
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeKey>('bright')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as ThemeKey | null
    const initial = saved && themes[saved] ? saved : 'bright'
    setThemeState(initial)
    applyTheme(initial)
  }, [])

  const setTheme = useCallback((key: ThemeKey) => {
    setThemeState(key)
    applyTheme(key)
    localStorage.setItem('theme', key)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
