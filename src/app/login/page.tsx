'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LoginPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push('/')
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (isSignUp) {
      // Create default settings row
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('settings').insert({ parent_id: user.id, stamp_goal: 10 })
        await supabase.from('tasks').insert([
          { parent_id: user.id, name: 'Made bed', icon: '🛏️', display_order: 0 },
          { parent_id: user.id, name: 'Did homework', icon: '📚', display_order: 1 },
          { parent_id: user.id, name: 'Ate vegetables', icon: '🥦', display_order: 2 },
          { parent_id: user.id, name: 'Brushed teeth', icon: '🦷', display_order: 3 },
          { parent_id: user.id, name: 'Helped at home', icon: '🏠', display_order: 4 },
        ])
        await supabase.from('wheel_items').insert([
          { parent_id: user.id, label: 'Ice Cream', emoji: '🍦', color: '#FF8FAB', weight: 2, display_order: 0 },
          { parent_id: user.id, label: 'Movie Night', emoji: '🎬', color: '#54A0FF', weight: 1, display_order: 1 },
          { parent_id: user.id, label: 'Extra Screen', emoji: '📱', color: '#FF9F43', weight: 3, display_order: 2 },
          { parent_id: user.id, label: 'Stay Up Late', emoji: '🌙', color: '#9C27B0', weight: 1, display_order: 3 },
          { parent_id: user.id, label: 'Pick Dinner', emoji: '🍕', color: '#4CAF50', weight: 2, display_order: 4 },
          { parent_id: user.id, label: 'Toy Store', emoji: '🎁', color: '#FFD700', weight: 1, display_order: 5 },
        ])
      }
    }

    router.push('/')
  }

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center p-6"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-7xl mb-4">⭐</div>
          <h1 className="text-3xl font-black" style={{ color: 'var(--color-primary)' }}>
            Reward Chart
          </h1>
          <p className="text-sm mt-2 opacity-60" style={{ color: 'var(--color-text)' }}>
            {isSignUp ? t('create_account_desc') : t('welcome_back')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t('email')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-4 rounded-2xl text-base outline-none border-2 border-transparent focus:border-[var(--color-primary)] transition-colors"
            style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--color-text)' }}
          />
          <input
            type="password"
            placeholder={t('password')}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-4 py-4 rounded-2xl text-base outline-none border-2 border-transparent focus:border-[var(--color-primary)] transition-colors"
            style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--color-text)' }}
          />

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl text-white text-lg font-bold disabled:opacity-60 active:scale-95 transition-transform"
            style={{ background: 'var(--color-primary)' }}
          >
            {loading ? '…' : isSignUp ? t('create_account') : t('sign_in')}
          </button>
        </form>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setError('') }}
          className="w-full mt-4 py-3 text-sm opacity-60"
          style={{ color: 'var(--color-text)' }}
        >
          {isSignUp ? t('already_have_account') : t('new_here')}
        </button>
      </div>
    </main>
  )
}
