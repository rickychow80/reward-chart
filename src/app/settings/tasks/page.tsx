'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Task } from '@/types'

const ICON_OPTIONS = ['✅', '🛏️', '📚', '🦷', '🥦', '🏠', '🐾', '🎯', '🧹', '🍽️', '🏃', '🎨', '🧩', '🌱', '🤝']

const emptyForm = { name: '', icon: '✅' }

export default function TasksSettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const [tasks, setTasks] = useState<Task[]>([])
  const [fetching, setFetching] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchTasks = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.from('tasks').select('*').order('display_order')
    setTasks(data ?? [])
    setFetching(false)
  }, [user])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const openAdd = () => { setForm(emptyForm); setEditing(null); setShowForm(true) }
  const openEdit = (task: Task) => { setForm({ name: task.name, icon: task.icon }); setEditing(task); setShowForm(true) }

  const handleSave = async () => {
    if (!user || !form.name.trim()) return
    setSaving(true)
    if (editing) {
      await supabase.from('tasks').update({ name: form.name.trim(), icon: form.icon }).eq('id', editing.id)
    } else {
      await supabase.from('tasks').insert({ name: form.name.trim(), icon: form.icon, parent_id: user.id, display_order: tasks.length })
    }
    setSaving(false)
    setShowForm(false)
    setEditing(null)
    fetchTasks()
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('delete_task_confirm'))) return
    await supabase.from('tasks').delete().eq('id', id)
    fetchTasks()
  }

  if (loading || fetching) {
    return (
      <main className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-5xl animate-spin">✅</div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh safe-x safe-top safe-bottom" style={{ background: 'var(--color-bg)' }}>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/settings')} className="text-2xl opacity-60" style={{ color: 'var(--color-text)' }}>←</button>
        <h1 className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>{t('tasks')}</h1>
      </div>

      {!showForm && (
        <>
          <div className="space-y-3 mb-6">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-4 px-4 py-4 rounded-2xl" style={{ background: 'rgba(0,0,0,0.05)' }}>
                <span className="text-3xl">{task.icon}</span>
                <div className="flex-1 font-semibold" style={{ color: 'var(--color-text)' }}>{task.name}</div>
                <button onClick={() => openEdit(task)} className="text-xl opacity-50 px-2">✏️</button>
                <button onClick={() => handleDelete(task.id)} className="text-xl opacity-50 px-2">🗑️</button>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-center opacity-40 py-8" style={{ color: 'var(--color-text)' }}>{t('no_tasks_yet')}</p>
            )}
          </div>
          <button onClick={openAdd} className="w-full py-4 rounded-2xl text-white font-bold text-lg active:scale-95 transition-transform" style={{ background: 'var(--color-primary)' }}>
            {t('add_task_btn')}
          </button>
        </>
      )}

      {showForm && (
        <div className="space-y-6">
          <div className="text-center text-6xl">{form.icon}</div>

          <div>
            <label className="text-sm font-bold opacity-50 mb-2 block" style={{ color: 'var(--color-text)' }}>{t('task_name')}</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={t('eg_made_bed')}
              className="w-full px-4 py-4 rounded-2xl outline-none border-2 border-transparent focus:border-[var(--color-primary)] transition-colors"
              style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--color-text)' }}
            />
          </div>

          <div>
            <label className="text-sm font-bold opacity-50 mb-2 block" style={{ color: 'var(--color-text)' }}>Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(e => (
                <button
                  key={e}
                  onClick={() => setForm(f => ({ ...f, icon: e }))}
                  className="w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all"
                  style={{
                    background: form.icon === e ? 'var(--color-primary)' : 'rgba(0,0,0,0.06)',
                    transform: form.icon === e ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setShowForm(false); setEditing(null) }} className="flex-1 py-4 rounded-2xl font-bold" style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--color-text)' }}>
              {t('cancel')}
            </button>
            <button onClick={handleSave} disabled={saving || !form.name.trim()} className="flex-1 py-4 rounded-2xl text-white font-bold active:scale-95 transition-transform disabled:opacity-50" style={{ background: 'var(--color-primary)' }}>
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
