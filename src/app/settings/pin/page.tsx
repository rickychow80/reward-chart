'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'

export default function PinSettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const [pin, setPin] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!user) return
    setFetching(false)
  }, [user])

  const handleSave = async () => {
    if (!user || pin.length !== 4) return
    setSaving(true)
    await supabase.from('settings').update({ parent_pin: pin, updated_at: new Date().toISOString() }).eq('parent_id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading || fetching) {
    return (
      <main className="h-dvh flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-5xl animate-spin">🔐</div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh safe-x safe-top safe-bottom" style={{ background: 'var(--color-bg)' }}>
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => router.push('/settings')} className="text-2xl opacity-60" style={{ color: 'var(--color-text)' }}>←</button>
        <h1 className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>{t('settings_pin')}</h1>
      </div>

      <div className="flex flex-col items-center gap-8">
        {/* PIN preview dots */}
        <div className="flex gap-4">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className="w-5 h-5 rounded-full transition-all"
              style={{ background: i < pin.length ? 'var(--color-primary)' : 'rgba(0,0,0,0.12)' }}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-4 w-64">
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
            <button
              key={i}
              disabled={!d}
              onClick={() => {
                if (d === '⌫') { setPin(p => p.slice(0, -1)); return }
                if (pin.length < 4) setPin(p => p + d)
              }}
              className="h-16 rounded-2xl text-xl font-bold active:scale-90 transition-transform disabled:invisible"
              style={{ background: d ? 'rgba(0,0,0,0.06)' : 'transparent', color: 'var(--color-text)' }}
            >
              {d}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving || pin.length !== 4}
          className="w-64 py-4 rounded-2xl text-white text-lg font-bold active:scale-95 transition-transform disabled:opacity-50"
          style={{ background: saved ? 'var(--color-success)' : 'var(--color-primary)' }}
        >
          {saved ? t('saved') : saving ? t('saving') : t('save_changes')}
        </button>
      </div>
    </main>
  )
}
