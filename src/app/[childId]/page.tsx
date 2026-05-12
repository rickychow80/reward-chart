'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { StampGrid } from '@/components/StampGrid'
import { AvatarDisplay } from '@/components/AvatarDisplay'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSettings } from '@/contexts/SettingsContext'
import type { Child, Task, Stamp } from '@/types'

const STAMP_ICONS = ['⭐', '🌟', '❤️', '👍🏻', '🏆', '🦄', '🎯', '🍭', '🚀', '💎', '🌸', '🔥', '🎉', '👑', '🌈', '💫', '🐱', '🐶', '🦁', '🎠', '🍦', '👸🏻']

const HEADER_ICONS = [
  { icon: '☀️', x: '6%',  y: '8%',  size: '1.6rem', rot: 10  },
  { icon: '🌈', x: '75%', y: '5%',  size: '1.5rem', rot: -8  },
  { icon: '🌸', x: '55%', y: '60%', size: '1.2rem', rot: 15  },
  { icon: '🦋', x: '88%', y: '50%', size: '1.3rem', rot: -12 },
  { icon: '🍒', x: '18%', y: '65%', size: '1.2rem', rot: 5   },
  { icon: '🐝', x: '82%', y: '18%', size: '1.1rem', rot: 20  },
  { icon: '🌼', x: '3%',  y: '45%', size: '1.4rem', rot: -5  },
  { icon: '🍉', x: '65%', y: '75%', size: '1.2rem', rot: 8   },
  { icon: '🌧️', x: '40%', y: '5%',  size: '1.1rem', rot: 0   },
  { icon: '🍦', x: '90%', y: '72%', size: '1.2rem', rot: -10 },
  { icon: '☀️', x: '48%', y: '80%', size: '1rem',   rot: -15 },
  { icon: '🌈', x: '8%',  y: '82%', size: '1.1rem', rot: 6   },
]

export default function StampChartPage() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const { stampGoal } = useSettings()
  const router = useRouter()
  const params = useParams()
  const childId = params.childId as string

  const [child, setChild] = useState<Child | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [stamps, setStamps] = useState<{ icon: string; taskName: string | null; awardedAt: string; id: string }[]>([])
  const [bubble, setBubble] = useState<{ id: string; icon: string; taskName: string | null; awardedAt: string; x: number; y: number; above: boolean } | null>(null)
  const [bubbleClosing, setBubbleClosing] = useState(false)
  const [deletePin, setDeletePin] = useState<{ stampId: string; pin: string; error: boolean } | null>(null)
  const [correctPin, setCorrectPin] = useState('1234')
  const tapRef = useRef<{ id: string; count: number; timer: ReturnType<typeof setTimeout> | null }>({ id: '', count: 0, timer: null })

  const closeBubble = () => {
    setBubbleClosing(true)
    setTimeout(() => { setBubble(null); setBubbleClosing(false) }, 150)
  }
  const [fetching, setFetching] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [awardingTask, setAwardingTask] = useState<string | null>(null)
  const [selectedIcon, setSelectedIcon] = useState('⭐')

  const fetchData = useCallback(async () => {
    if (!user) return

    const [childRes, tasksRes, stampsRes, spinsRes, settingsRes] = await Promise.all([
      supabase.from('children').select('*').eq('id', childId).single(),
      supabase.from('tasks').select('*').order('display_order'),
      supabase.from('stamps').select('id, stamp_icon, task_name, awarded_at').eq('child_id', childId).order('awarded_at'),
      supabase.from('spin_history').select('stamps_consumed').eq('child_id', childId),
      supabase.from('settings').select('parent_pin').eq('parent_id', user.id).single(),
    ])

    const fetchedChild = childRes.data as Child
    setChild(fetchedChild)
    setTasks(tasksRes.data ?? [])
    setCorrectPin(settingsRes.data?.parent_pin ?? '1234')
    setSelectedIcon(fetchedChild?.stamp_logo_value ?? '⭐')

    // active stamps = total stamps minus stamps consumed by past spins
    const totalConsumed = (spinsRes.data ?? []).reduce(
      (sum, s) => sum + (s.stamps_consumed ?? goal), 0
    )
    const allStamps = stampsRes.data ?? []
    const activeStampData = allStamps.slice(totalConsumed)
    setStamps(activeStampData.map((s: Stamp) => ({
      id: s.id,
      icon: s.stamp_icon ?? fetchedChild?.stamp_logo_value ?? '⭐',
      taskName: s.task_name,
      awardedAt: s.awarded_at,
    })))
    setFetching(false)
  }, [user, childId])

  useEffect(() => { fetchData() }, [fetchData])

  // Auto-dismiss bubble after 3 s
  useEffect(() => {
    if (!bubble) return
    const id = setTimeout(closeBubble, 3000)
    return () => clearTimeout(id)
  }, [bubble])

  const openModal = () => {
    setSelectedIcon(child?.stamp_logo_value ?? '⭐')
    setShowTaskModal(true)
  }

  const awardStamp = async (task: Task) => {
    setAwardingTask(task.id)
    await supabase.from('stamps').insert({
      child_id: childId,
      task_id: task.id,
      task_name: task.name,
      stamp_icon: selectedIcon,
    })
    setStamps(prev => [...prev, { id: '', icon: selectedIcon, taskName: task.name, awardedAt: new Date().toISOString() }].slice(0, 25))
    setShowTaskModal(false)
    setAwardingTask(null)
  }

  const activeStamps = stamps.length
  const canSpin = activeStamps >= stampGoal

  if (loading || fetching || !child) {
    return (
      <main className="h-dvh flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-5xl animate-spin">{child?.stamp_logo_value ?? '⭐'}</div>
      </main>
    )
  }

  return (
    <main className="h-dvh flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="safe-x pb-6 relative overflow-hidden" style={{ background: '#FEFAE8', paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}>
        {/* Scattered background icons */}
        {HEADER_ICONS.map((item, i) => (
          <span
            key={i}
            className="absolute select-none pointer-events-none"
            style={{
              left: item.x,
              top: item.y,
              fontSize: item.size,
              opacity: 0.55,
              transform: `rotate(${item.rot}deg)`,
            }}
          >
            {item.icon}
          </span>
        ))}
        <div className="relative z-10">
          <button onClick={() => router.push('/')} className="text-2xl mb-4 block" style={{ color: child.color }}>←</button>
          <div className="text-center flex flex-col items-center">
            <AvatarDisplay avatarUrl={child.avatar_url} avatarPosition={child.avatar_position} avatarZoom={child.avatar_zoom} color={child.color} className="w-28 h-28 mb-3" />
            <h1 className="text-2xl font-black" style={{ color: child.color }}>{child.name}</h1>
            <p className="text-sm mt-1 font-semibold" style={{ color: child.color, opacity: 0.7 }}>{t('stamps_progress', { active: String(activeStamps), goal: String(stampGoal) })}</p>
          </div>
        </div>
      </div>

      {/* Stamp grid — scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="safe-x py-4">
          <StampGrid
            stamps={stamps}
            color={child.color}
            onTap={(stamp, rect) => {
              // Close any open bubble immediately so overlay never blocks stamp taps
              setBubble(null)
              setBubbleClosing(false)

              // Hidden: count taps on same stamp
              const t = tapRef.current
              if (t.id === stamp.id) { t.count++ } else { t.id = stamp.id; t.count = 1 }
              if (t.timer) clearTimeout(t.timer)
              t.timer = setTimeout(() => { tapRef.current = { id: '', count: 0, timer: null } }, 3000)

              if (t.count >= 10) {
                tapRef.current = { id: '', count: 0, timer: null }
                setDeletePin({ stampId: stamp.id, pin: '', error: false })
                return
              }

              // Normal: show bubble
              const above = rect.top > 180
              setBubble({ ...stamp, x: rect.left + rect.width / 2, y: above ? rect.top - 12 : rect.bottom + 12, above })
            }}
          />
        </div>
      </div>

      {/* Bottom actions — pinned */}
      <div className="safe-x safe-bottom space-y-3 pt-2 border-t border-black/5" style={{ background: 'var(--color-bg)' }}>
        <button
          onClick={() => router.push(`/${childId}/spin?goal=${stampGoal}`)}
          disabled={!canSpin}
          className="w-full py-5 rounded-3xl text-white text-xl font-black shadow-lg active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: canSpin ? 'var(--color-primary)' : '#9CA3AF' }}
        >
          {canSpin ? t('spin_wheel') : t('more_stamps', { count: String(stampGoal - activeStamps) })}
        </button>
        <button
          onClick={openModal}
          className="w-full py-4 rounded-3xl text-white text-lg font-bold active:scale-95 transition-transform"
          style={{ background: 'var(--color-success)' }}
        >
          {t('award_stamp')}
        </button>
      </div>

      {/* Stamp bubble */}
      {bubble && (() => {
        const HALF_W = 110   // half of max-width 220px
        const MARGIN = 16
        const screenW = typeof window !== 'undefined' ? window.innerWidth : 390
        const clampedX = Math.max(HALF_W + MARGIN, Math.min(screenW - HALF_W - MARGIN, bubble.x))
        const arrowShift = bubble.x - clampedX   // keep arrow pointing at stamp
        return (
          <>
            <div
              className={`fixed z-50 rounded-2xl shadow-2xl px-4 py-3 min-w-[160px] max-w-[220px] ${bubbleClosing ? 'bubble-exit' : 'bubble-enter'}`}
              style={{
                left: clampedX,
                transform: 'translateX(-50%)',
                background: 'var(--color-bg)',
                border: `2px solid ${child.color}`,
                ...(bubble.above ? { top: bubble.y - 90 } : { top: bubble.y }),
              }}
            >
              {/* Arrow — shifted to still point at stamp */}
              <div
                className="absolute"
                style={{
                  left: `calc(50% + ${arrowShift}px)`,
                  transform: 'translateX(-50%)',
                  width: 0, height: 0,
                  ...(bubble.above ? {
                    bottom: -10,
                    borderLeft: '9px solid transparent',
                    borderRight: '9px solid transparent',
                    borderTop: `9px solid ${child.color}`,
                  } : {
                    top: -10,
                    borderLeft: '9px solid transparent',
                    borderRight: '9px solid transparent',
                    borderBottom: `9px solid ${child.color}`,
                  }),
                }}
              />
              <div className="text-2xl text-center mb-1">{bubble.icon}</div>
              <p className="font-bold text-sm text-center" style={{ color: 'var(--color-text)' }}>
                {bubble.taskName ?? 'Great job!'}
              </p>
              <p className="text-xs text-center mt-0.5 opacity-50" style={{ color: 'var(--color-text)' }}>
                {new Date(bubble.awardedAt).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' })}
                {' · '}
                {new Date(bubble.awardedAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </>
        )
      })()}

      {/* Hidden PIN delete modal — no explanatory text */}
      {deletePin && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: 'var(--color-bg)' }}
          onClick={() => setDeletePin(null)}>
          <div onClick={e => e.stopPropagation()} className="flex flex-col items-center gap-8">
            {/* 4 dots */}
            <div className="flex gap-4">
              {[0,1,2,3].map(i => (
                <div key={i} className="w-4 h-4 rounded-full transition-all"
                  style={{ background: i < deletePin.pin.length ? (deletePin.error ? '#EF4444' : 'var(--color-primary)') : 'rgba(0,0,0,0.12)' }} />
              ))}
            </div>
            {/* Numpad */}
            <div className="grid grid-cols-3 gap-4 w-64">
              {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
                <button key={i} disabled={!d}
                  onClick={() => {
                    if (!deletePin) return
                    if (d === '⌫') { setDeletePin(p => p ? { ...p, pin: p.pin.slice(0,-1), error: false } : null); return }
                    const next = deletePin.pin + d
                    setDeletePin(p => p ? { ...p, pin: next } : null)
                    if (next.length === 4) {
                      if (next === correctPin) {
                        supabase.from('stamps').delete().eq('id', deletePin.stampId).then(() => {
                          setDeletePin(null)
                          fetchData()
                        })
                      } else {
                        setDeletePin(p => p ? { ...p, error: true } : null)
                        setTimeout(() => setDeletePin(p => p ? { ...p, pin: '', error: false } : null), 600)
                      }
                    }
                  }}
                  className="h-16 rounded-2xl text-xl font-bold active:scale-90 transition-transform disabled:invisible"
                  style={{ background: d ? 'rgba(0,0,0,0.06)' : 'transparent', color: 'var(--color-text)' }}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Award modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setShowTaskModal(false)}>
          <div
            className="w-full rounded-t-3xl p-6 safe-bottom max-h-[80dvh] overflow-y-auto"
            style={{ background: 'var(--color-bg)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 rounded-full bg-gray-300 mx-auto mb-5" />

            {/* Icon picker */}
            <p className="text-sm font-bold opacity-50 mb-2" style={{ color: 'var(--color-text)' }}>
              {t('pick_stamp_icon')}
            </p>
            <div className="flex gap-2 overflow-x-auto pb-3 mb-5 -mx-1 px-1">
              {STAMP_ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className="w-12 h-12 flex-shrink-0 rounded-xl text-2xl flex items-center justify-center transition-all"
                  style={{
                    background: selectedIcon === icon ? 'var(--color-accent)' : 'rgba(0,0,0,0.06)',
                    transform: selectedIcon === icon ? 'scale(1.2)' : 'scale(1)',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>

            {/* Task list */}
            <h2 className="text-xl font-black mb-3" style={{ color: 'var(--color-text)' }}>
              {t('what_did_do', { name: child.name })} {selectedIcon}
            </h2>
            <div className="space-y-3">
              {tasks.length === 0 && (
                <p className="text-center opacity-50 py-4" style={{ color: 'var(--color-text)' }}>
                  {t('no_tasks_hint')}
                </p>
              )}
              {tasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => awardStamp(task)}
                  disabled={!!awardingTask}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left active:scale-95 transition-transform disabled:opacity-60"
                  style={{ background: 'rgba(0,0,0,0.06)' }}
                >
                  <span className="text-3xl">{task.icon}</span>
                  <span className="font-semibold flex-1" style={{ color: 'var(--color-text)' }}>{task.name}</span>
                  <span className="text-xl">{selectedIcon}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
