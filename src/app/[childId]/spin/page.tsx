'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { SpinWheel } from '@/components/SpinWheel'
import { AvatarDisplay } from '@/components/AvatarDisplay'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Child, WheelItem } from '@/types'

const CONFETTI = ['🎉', '⭐', '🎊', '🌟', '✨', '🎈', '🏆', '💫']

interface ConfettiPiece {
  id: number
  emoji: string
  left: number
  duration: number
  delay: number
}

export default function SpinPage() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const childId = params.childId as string
  const stampGoal = parseInt(searchParams.get('goal') ?? '10')

  const [child, setChild] = useState<Child | null>(null)
  const [wheelItems, setWheelItems] = useState<WheelItem[]>([])
  const [fetching, setFetching] = useState(true)
  const [winner, setWinner] = useState<WheelItem | null>(null)
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    if (!user) return
    const [childRes, itemsRes] = await Promise.all([
      supabase.from('children').select('*').eq('id', childId).single(),
      supabase.from('wheel_items').select('*').order('display_order'),
    ])
    setChild(childRes.data)
    setWheelItems(itemsRes.data ?? [])
    setFetching(false)
  }, [user, childId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const launchConfetti = () => {
    const pieces: ConfettiPiece[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      emoji: CONFETTI[Math.floor(Math.random() * CONFETTI.length)],
      left: Math.random() * 100,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 0.5,
    }))
    setConfetti(pieces)
    setTimeout(() => setConfetti([]), 5000)
  }

  const handleResult = async (item: WheelItem) => {
    setWinner(item)
    launchConfetti()

    setSaving(true)
    await supabase.from('spin_history').insert({
      child_id: childId,
      wheel_item_id: item.id,
      wheel_item_label: item.label,
      wheel_item_emoji: item.emoji,
      stamps_consumed: stampGoal,
    })
    setSaving(false)
  }

  const handleClaim = () => {
    router.push('/')
  }

  if (loading || fetching || !child) {
    return (
      <main className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-5xl animate-spin">🎡</div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Confetti */}
      {confetti.map(piece => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            top: '-40px',
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
          }}
        >
          {piece.emoji}
        </span>
      ))}

      {/* Header */}
      <div className="safe-x safe-top pb-4 flex items-center gap-4" style={{ background: child.color }}>
        <button
          onClick={() => router.push(`/${childId}`)}
          className="text-white/80 text-2xl"
        >
          ←
        </button>
        <AvatarDisplay avatarUrl={child.avatar_url} avatarPosition={child.avatar_position} avatarZoom={child.avatar_zoom} color="rgba(255,255,255,0.25)" className="w-10 h-10" />
        <div>
          <h1 className="text-xl font-black text-white">{t('spin_the_wheel')}</h1>
          <p className="text-white/70 text-sm">{child.name}</p>
        </div>
      </div>

      {/* Wheel area */}
      <div className="flex-1 flex flex-col items-center justify-center safe-x safe-bottom">
        {!winner ? (
          <SpinWheel items={wheelItems} onResult={handleResult} />
        ) : (
          <div className="flex flex-col items-center gap-6 animate-bounce-in text-center">
            <div className="text-8xl">{winner.emoji}</div>
            <div>
              <p className="text-2xl font-black" style={{ color: 'var(--color-primary)' }}>
                {t('you_won')}
              </p>
              <p className="text-4xl font-black mt-2" style={{ color: 'var(--color-text)' }}>
                {winner.label}
              </p>
            </div>
            <p className="text-base opacity-60" style={{ color: 'var(--color-text)' }}>
              {t('claim_hint')}
            </p>
            <button
              onClick={handleClaim}
              disabled={saving}
              className="mt-4 px-10 py-4 rounded-full text-white text-xl font-black active:scale-95 transition-transform"
              style={{ background: 'var(--color-primary)' }}
            >
              {saving ? '…' : t('awesome')}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
