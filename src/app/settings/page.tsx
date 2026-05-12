'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()

  const NAV_ITEMS = [
    { href: '/settings/children', emoji: '👦🏻', label: t('children'), desc: t('children_desc') },
    { href: '/settings/rewards', emoji: '🎡', label: t('wheel_rewards'), desc: t('wheel_rewards_desc') },
    { href: '/settings/tasks', emoji: '✅', label: t('tasks'), desc: t('tasks_desc') },
    { href: '/settings/style', emoji: '🎨', label: t('style'), desc: t('style_desc') },
    { href: '/settings/pin', emoji: '🔐', label: t('settings_pin'), desc: t('pin_desc') },
    { href: '/settings/language', emoji: '🌐', label: t('language'), desc: t('language_desc') },
  ]
  const router = useRouter()

  const [pin, setPin] = useState('')
  const [correctPin, setCorrectPin] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const sessionVerified = sessionStorage.getItem('pinVerified') === 'true'
    if (sessionVerified) setVerified(true)
  }, [])

  useEffect(() => {
    if (!user) return
    supabase.from('settings').select('parent_pin').eq('parent_id', user.id).single().then(({ data }) => {
      setCorrectPin(data?.parent_pin ?? '1234')
      setFetching(false)
    })
  }, [user])

  const handlePinDigit = (d: string) => {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    setError(false)

    if (next.length === 4) {
      if (next === correctPin) {
        sessionStorage.setItem('pinVerified', 'true')
        setVerified(true)
      } else {
        setError(true)
        setTimeout(() => setPin(''), 600)
      }
    }
  }

  const handleSignOut = async () => {
    sessionStorage.removeItem('pinVerified')
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading || fetching) {
    return (
      <main className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-5xl animate-spin">⚙️</div>
      </main>
    )
  }

  if (!verified) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center p-6" style={{ background: 'var(--color-bg)' }}>
        <button
          onClick={() => router.push('/')}
          className="absolute top-14 left-6 text-2xl opacity-60"
          style={{ color: 'var(--color-text)' }}
        >
          ←
        </button>

        <div className="text-5xl mb-6">🔐</div>
        <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--color-text)' }}>
          Parent Settings
        </h1>
        <p className="text-sm opacity-50 mb-8" style={{ color: 'var(--color-text)' }}>
          Enter your 4-digit PIN
        </p>

        {/* PIN dots */}
        <div className="flex gap-4 mb-10">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className="w-5 h-5 rounded-full transition-all"
              style={{
                background: i < pin.length
                  ? (error ? '#EF4444' : 'var(--color-primary)')
                  : 'rgba(0,0,0,0.12)',
                transform: error ? 'translateX(4px)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-4 w-64">
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
            <button
              key={i}
              onClick={() => {
                if (d === '⌫') setPin(p => p.slice(0, -1))
                else if (d) handlePinDigit(d)
              }}
              disabled={!d}
              className="h-16 rounded-2xl text-xl font-bold active:scale-90 transition-transform disabled:invisible"
              style={{
                background: d ? 'rgba(0,0,0,0.06)' : 'transparent',
                color: 'var(--color-text)',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh safe-x safe-top safe-bottom" style={{ background: 'var(--color-bg)' }}>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/')} className="text-2xl opacity-60" style={{ color: 'var(--color-text)' }}>
          ←
        </button>
        <h1 className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>{t('settings')}</h1>
      </div>

      <div className="space-y-3">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 px-5 py-4 rounded-2xl active:scale-95 transition-transform"
            style={{ background: 'rgba(0,0,0,0.05)' }}
          >
            <span className="text-3xl">{item.emoji}</span>
            <div className="flex-1">
              <div className="font-bold" style={{ color: 'var(--color-text)' }}>{item.label}</div>
              <div className="text-sm opacity-50" style={{ color: 'var(--color-text)' }}>{item.desc}</div>
            </div>
            <span className="opacity-30 text-xl" style={{ color: 'var(--color-text)' }}>›</span>
          </Link>
        ))}
      </div>

      <button
        onClick={handleSignOut}
        className="w-full mt-6 py-4 rounded-2xl text-red-500 font-semibold"
        style={{ background: 'rgba(239,68,68,0.08)' }}
      >
        {t('sign_out')}
      </button>
    </main>
  )
}
