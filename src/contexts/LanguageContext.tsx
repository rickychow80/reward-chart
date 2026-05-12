'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { type Language, translate } from '@/lib/i18n'

interface LanguageContextValue {
  lang: Language
  setLang: (l: Language) => void
  t: (key: string, vars?: Record<string, string>) => string
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Language | null
    if (saved === 'en' || saved === 'zh-TW') {
      setLangState(saved)
    } else {
      const browser = navigator.language
      setLangState(browser.startsWith('zh') ? 'zh-TW' : 'en')
    }
  }, [])

  const setLang = (l: Language) => {
    setLangState(l)
    localStorage.setItem('lang', l)
  }

  const t = (key: string, vars?: Record<string, string>) => translate(lang, key, vars)

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
