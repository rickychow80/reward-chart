'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { themes } from '@/lib/themes'
import type { ThemeKey } from '@/types'

export default function StyleSettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('settings').select('theme').eq('parent_id', user.id).single().then(({ data }) => {
      if (data?.theme) setTheme(data.theme as ThemeKey)
      setFetching(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setError('')
    const { error: err } = await supabase
      .from('settings')
      .upsert({ parent_id: user.id, theme }, { onConflict: 'parent_id' })
    setSaving(false)
    if (err) { setError(err.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading || fetching) {
    return (
      <main className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-5xl animate-spin">🎨</div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh safe-x safe-top safe-bottom" style={{ background: 'var(--color-bg)' }}>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/settings')} className="text-2xl opacity-60" style={{ color: 'var(--color-text)' }}>←</button>
        <h1 className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>{t('style')}</h1>
      </div>

      {/* Theme picker */}
      <section className="mb-8">
        <h2 className="text-sm font-bold uppercase opacity-50 mb-3" style={{ color: 'var(--color-text)' }}>
          {t('app_theme')}
        </h2>
        <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {Object.values(themes).map(th => (
            <button
              key={th.key}
              onClick={() => setTheme(th.key)}
              className="p-4 rounded-2xl text-left border-2 transition-all active:scale-95"
              style={{
                background: th.vars['--color-bg'],
                borderColor: theme === th.key ? th.vars['--color-primary'] : 'transparent',
                boxShadow: theme === th.key ? `0 0 0 2px ${th.vars['--color-primary']}` : '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <div className="text-2xl mb-1">{th.emoji}</div>
              <div className="font-bold text-sm" style={{ color: th.vars['--color-text'] }}>{t(`theme_${th.key}`)}</div>
              <div className="flex gap-1 mt-2">
                {['--color-primary', '--color-accent', '--color-success', '--color-fun'].map(v => (
                  <div key={v} className="w-4 h-4 rounded-full" style={{ background: th.vars[v] }} />
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>

      {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-2xl text-white text-lg font-bold active:scale-95 transition-transform disabled:opacity-50"
        style={{ background: saved ? 'var(--color-success)' : 'var(--color-primary)' }}
      >
        {saved ? t('saved') : saving ? t('saving') : t('save_changes')}
      </button>
    </main>
  )
}
