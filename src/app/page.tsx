'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { AvatarDisplay } from '@/components/AvatarDisplay'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSettings } from '@/contexts/SettingsContext'
import type { Child, Stamp, SpinHistory, Settings } from '@/types'

interface ChildWithProgress extends Child {
  activeStamps: number
}

export default function HomePage() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const { stampGoal } = useSettings()
  const router = useRouter()
  const [children, setChildren] = useState<ChildWithProgress[]>([])
  const [fetching, setFetching] = useState(true)

  const fetchData = useCallback(async () => {
    if (!user) return

    const [childrenRes, stampsRes, spinsRes] = await Promise.all([
      supabase.from('children').select('*').order('display_order'),
      supabase.from('stamps').select('child_id'),
      supabase.from('spin_history').select('child_id, stamps_consumed'),
    ])

    // total stamps per child
    const totalByChild = new Map<string, number>()
    for (const s of (stampsRes.data ?? [])) {
      totalByChild.set(s.child_id, (totalByChild.get(s.child_id) ?? 0) + 1)
    }

    // stamps consumed by past spins per child
    const consumedByChild = new Map<string, number>()
    for (const s of (spinsRes.data ?? [])) {
      consumedByChild.set(s.child_id, (consumedByChild.get(s.child_id) ?? 0) + (s.stamps_consumed ?? goal))
    }

    const withProgress = (childrenRes.data ?? []).map(child => {
      const activeStamps = (totalByChild.get(child.id) ?? 0) - (consumedByChild.get(child.id) ?? 0)
      return { ...child, activeStamps: Math.max(0, activeStamps) }
    })

    setChildren(withProgress)
    setFetching(false)
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading || fetching) {
    return (
      <main className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-5xl animate-spin">⭐</div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh safe-top safe-bottom safe-x" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="relative mb-8">
        <div className="flex items-start justify-between">
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-lg">⭐</span>
              <span className="text-sm font-bold tracking-widest uppercase opacity-50" style={{ color: 'var(--color-text)' }}>
                {t('my_rewards')}
              </span>
            </div>
            <h1
              className="text-5xl font-black leading-none"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-fun) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t('stamp_chart')}
            </h1>
            <p className="mt-2 text-base font-semibold" style={{ color: 'var(--color-text)', opacity: 0.45 }}>
              {t('who_is_earning')}
            </p>
          </div>
          <Link
            href="/settings"
            className="w-11 h-11 rounded-full flex items-center justify-center text-xl mt-1 flex-shrink-0"
            style={{ background: 'rgba(0,0,0,0.06)' }}
          >
            ⚙️
          </Link>
        </div>

        {/* Decorative accent bar */}
        <div
          className="mt-4 h-1 rounded-full w-16"
          style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
        />
      </div>

      {/* Children grid */}
      {children.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
          <p className="text-lg font-semibold opacity-60" style={{ color: 'var(--color-text)' }}>
            {t('no_children')}
          </p>
          <p className="text-sm opacity-40 mt-1 mb-6" style={{ color: 'var(--color-text)' }}>
            {t('add_first_child')}
          </p>
          <Link
            href="/settings/children"
            className="px-6 py-3 rounded-full text-white font-bold"
            style={{ background: 'var(--color-primary)' }}
          >
            {t('add_child')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {children.map(child => {
            const pct = Math.min((child.activeStamps / stampGoal) * 100, 100)
            const ready = child.activeStamps >= stampGoal
            return (
              <button
                key={child.id}
                onClick={() => router.push(`/${child.id}`)}
                className="relative rounded-3xl p-5 text-left shadow-md active:scale-95 transition-transform overflow-hidden"
                style={{ background: child.color }}
              >
                {ready && (
                  <div className="absolute top-3 right-3 text-xl animate-bounce">🎡</div>
                )}
                <AvatarDisplay avatarUrl={child.avatar_url} avatarPosition={child.avatar_position} avatarZoom={child.avatar_zoom} color="rgba(255,255,255,0.25)" className="w-16 h-16 mb-3" />
                <div className="text-white font-black text-lg leading-tight">{child.name}</div>
                <div className="text-white/70 text-xs mt-0.5 mb-3">
                  {t('stamps_progress', { active: String(child.activeStamps), goal: String(stampGoal) })}
                </div>
                {/* Progress bar */}
                <div className="h-2 rounded-full bg-white/30">
                  <div
                    className="h-2 rounded-full bg-white transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </main>
  )
}
