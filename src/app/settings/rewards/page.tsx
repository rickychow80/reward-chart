'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSettings } from '@/contexts/SettingsContext'
import type { WheelItem } from '@/types'

const EMOJI_OPTIONS = ['🍦', '🎬', '📱', '🌙', '🍕', '🎁', '🎮', '🎨', '⚽', '🧁', '🎪', '🚀', '🏖️', '🎠', '🦁']
const COLOR_OPTIONS = ['#FF6B35', '#FF8FAB', '#FFD700', '#4CAF50', '#54A0FF', '#9C27B0', '#FF9F43', '#10B981', '#EC4899', '#F59E0B']

const emptyForm = { label: '', emoji: '🎁', color: '#FF6B35', weight: 1 }

export default function RewardsSettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const { updateStampGoal } = useSettings()
  const [stampGoal, setStampGoal] = useState(10)
  const [goalSaving, setGoalSaving] = useState(false)
  const [goalSaved, setGoalSaved] = useState(false)
  const [goalError, setGoalError] = useState('')
  const [items, setItems] = useState<WheelItem[]>([])
  const [fetching, setFetching] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<WheelItem | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchItems = useCallback(async () => {
    if (!user) return
    const [itemsRes, settingsRes] = await Promise.all([
      supabase.from('wheel_items').select('*').order('display_order'),
      supabase.from('settings').select('stamp_goal').eq('parent_id', user.id).single(),
    ])
    setItems(itemsRes.data ?? [])
    if (settingsRes.data) setStampGoal(settingsRes.data.stamp_goal)
    setFetching(false)
  }, [user])

  const saveGoal = async () => {
    if (!user) return
    setGoalSaving(true)
    setGoalError('')
    const { error } = await supabase
      .from('settings')
      .upsert({ parent_id: user.id, stamp_goal: stampGoal }, { onConflict: 'parent_id' })
    if (error) {
      setGoalError(error.message)
      setGoalSaving(false)
      return
    }
    updateStampGoal(stampGoal)
    setGoalSaving(false)
    setGoalSaved(true)
    setTimeout(() => setGoalSaved(false), 2000)
  }

  useEffect(() => { fetchItems() }, [fetchItems])

  const openAdd = () => {
    setForm(emptyForm)
    setEditing(null)
    setShowForm(true)
  }

  const openEdit = (item: WheelItem) => {
    setForm({ label: item.label, emoji: item.emoji, color: item.color, weight: item.weight })
    setEditing(item)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!user || !form.label.trim()) return
    setSaving(true)
    if (editing) {
      await supabase.from('wheel_items').update({ ...form, label: form.label.trim() }).eq('id', editing.id)
    } else {
      await supabase.from('wheel_items').insert({
        ...form,
        label: form.label.trim(),
        parent_id: user.id,
        display_order: items.length,
      })
    }
    setSaving(false)
    setShowForm(false)
    setEditing(null)
    fetchItems()
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('delete_reward_confirm'))) return
    await supabase.from('wheel_items').delete().eq('id', id)
    fetchItems()
  }

  const RARITY = ['', t('rarity_very_rare'), t('rarity_rare'), t('rarity_common'), t('rarity_likely'), t('rarity_very_likely')]

  if (loading || fetching) {
    return (
      <main className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-5xl animate-spin">🎡</div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh safe-x safe-top safe-bottom" style={{ background: 'var(--color-bg)' }}>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/settings')} className="text-2xl opacity-60" style={{ color: 'var(--color-text)' }}>←</button>
        <h1 className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>{t('wheel_rewards')}</h1>
      </div>

      {!showForm && (
        <>
          {/* Stamp goal */}
          <section className="mb-6">
            <h2 className="text-sm font-bold uppercase opacity-50 mb-3" style={{ color: 'var(--color-text)' }}>
              {t('stamp_goal_label')}
            </h2>
            <div className="flex items-center gap-4 p-4 rounded-2xl mb-3" style={{ background: 'rgba(0,0,0,0.05)' }}>
              <button
                onClick={() => setStampGoal(g => Math.max(1, g - 1))}
                className="w-12 h-12 rounded-full text-2xl font-bold flex items-center justify-center active:scale-90 transition-transform"
                style={{ background: 'var(--color-primary)', color: '#fff' }}
              >−</button>
              <div className="flex-1 text-center">
                <div className="text-4xl font-black" style={{ color: 'var(--color-primary)' }}>{stampGoal}</div>
                <div className="text-xs opacity-50 mt-0.5" style={{ color: 'var(--color-text)' }}>{t('stamps_to_spin')}</div>
              </div>
              <button
                onClick={() => setStampGoal(g => Math.min(50, g + 1))}
                className="w-12 h-12 rounded-full text-2xl font-bold flex items-center justify-center active:scale-90 transition-transform"
                style={{ background: 'var(--color-primary)', color: '#fff' }}
              >＋</button>
            </div>
            {goalError && <p className="text-red-500 text-xs text-center">{goalError}</p>}
            <button
              onClick={saveGoal}
              disabled={goalSaving}
              className="w-full py-3 rounded-2xl text-white font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
              style={{ background: goalSaved ? 'var(--color-success)' : 'var(--color-primary)' }}
            >
              {goalSaved ? t('saved') : goalSaving ? t('saving') : t('save_changes')}
            </button>
          </section>

          <div className="w-full h-px opacity-10 mb-6" style={{ background: 'var(--color-text)' }} />

          <div className="space-y-3 mb-6">
            {items.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-4 px-4 py-3 rounded-2xl"
                style={{ background: 'rgba(0,0,0,0.05)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: item.color }}
                >
                  {item.emoji}
                </div>
                <div className="flex-1">
                  <div className="font-bold" style={{ color: 'var(--color-text)' }}>{item.label}</div>
                  <div className="text-xs opacity-50" style={{ color: 'var(--color-text)' }}>
                    {RARITY[item.weight] || t('rarity_custom')}
                  </div>
                </div>
                <button onClick={() => openEdit(item)} className="text-xl opacity-50 px-2">✏️</button>
                <button onClick={() => handleDelete(item.id)} className="text-xl opacity-50 px-2">🗑️</button>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-center opacity-40 py-8" style={{ color: 'var(--color-text)' }}>
                {t('no_rewards_yet')}
              </p>
            )}
          </div>
          <button
            onClick={openAdd}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg active:scale-95 transition-transform"
            style={{ background: 'var(--color-primary)' }}
          >
            {t('add_reward_btn')}
          </button>
        </>
      )}

      {showForm && (
        <div className="space-y-6">
          <div className="text-center text-6xl">{form.emoji}</div>

          <div>
            <label className="text-sm font-bold opacity-50 mb-2 block" style={{ color: 'var(--color-text)' }}>{t('reward_name')}</label>
            <input
              type="text"
              value={form.label}
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              placeholder={t('eg_ice_cream')}
              className="w-full px-4 py-4 rounded-2xl outline-none border-2 border-transparent focus:border-[var(--color-primary)] transition-colors"
              style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--color-text)' }}
            />
          </div>

          <div>
            <label className="text-sm font-bold opacity-50 mb-2 block" style={{ color: 'var(--color-text)' }}>Emoji 🎨</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map(e => (
                <button
                  key={e}
                  onClick={() => setForm(f => ({ ...f, emoji: e }))}
                  className="w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all"
                  style={{
                    background: form.emoji === e ? 'var(--color-primary)' : 'rgba(0,0,0,0.06)',
                    transform: form.emoji === e ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold opacity-50 mb-2 block" style={{ color: 'var(--color-text)' }}>{t('slice_color')}</label>
            <div className="flex flex-wrap gap-3">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className="w-10 h-10 rounded-full transition-all"
                  style={{
                    background: c,
                    transform: form.color === c ? 'scale(1.2)' : 'scale(1)',
                    boxShadow: form.color === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold opacity-50 mb-2 block" style={{ color: 'var(--color-text)' }}>
              {t('rarity')} — {RARITY[form.weight] || t('rarity_custom')}
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={form.weight}
              onChange={e => setForm(f => ({ ...f, weight: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs opacity-40 mt-1" style={{ color: 'var(--color-text)' }}>
              <span>{t('rare')}</span><span>{t('common')}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setShowForm(false); setEditing(null) }}
              className="flex-1 py-4 rounded-2xl font-bold"
              style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--color-text)' }}
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.label.trim()}
              className="flex-1 py-4 rounded-2xl text-white font-bold active:scale-95 transition-transform disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}
            >
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
