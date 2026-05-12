'use client'

import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { LANGUAGES } from '@/lib/i18n'

export default function LanguageSettingsPage() {
  const router = useRouter()
  const { lang, setLang, t } = useLanguage()

  return (
    <main className="min-h-dvh safe-x safe-top safe-bottom" style={{ background: 'var(--color-bg)' }}>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/settings')} className="text-2xl opacity-60" style={{ color: 'var(--color-text)' }}>←</button>
        <h1 className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>{t('language')}</h1>
      </div>

      <div className="space-y-3">
        {LANGUAGES.map(l => (
          <button
            key={l.key}
            onClick={() => setLang(l.key)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl active:scale-95 transition-transform"
            style={{ background: lang === l.key ? 'var(--color-primary)' : 'rgba(0,0,0,0.05)' }}
          >
            <div className="text-left">
              <div className="font-bold" style={{ color: lang === l.key ? '#fff' : 'var(--color-text)' }}>{l.native}</div>
              <div className="text-sm opacity-60" style={{ color: lang === l.key ? '#fff' : 'var(--color-text)' }}>{l.label}</div>
            </div>
            {lang === l.key && <span className="text-white text-xl">✓</span>}
          </button>
        ))}
      </div>
    </main>
  )
}
