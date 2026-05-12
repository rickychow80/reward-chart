'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { AvatarDisplay } from '@/components/AvatarDisplay'
import { AvatarEditModal } from '@/components/AvatarEditModal'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Child } from '@/types'

const COLOR_OPTIONS = ['#FF6B35', '#FF8FAB', '#FFD700', '#4CAF50', '#54A0FF', '#9C27B0', '#FF9F43', '#10B981', '#EC4899', '#F59E0B']

const emptyForm = {
  name: '',
  color: '#FF6B35',
  avatar_url: null as string | null,
  avatar_position: '50% 50%',
  avatar_zoom: 1,
}

export default function ChildrenSettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef(emptyForm)

  const [children, setChildren] = useState<Child[]>([])
  const [fetching, setFetching] = useState(true)
  const [editing, setEditing] = useState<Child | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => { formRef.current = form }, [form])

  const fetchChildren = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.from('children').select('*').order('display_order')
    setChildren(data ?? [])
    setFetching(false)
  }, [user])

  useEffect(() => { fetchChildren() }, [fetchChildren])

  const openAdd = () => {
    setForm(emptyForm)
    setAdding(true)
    setEditing(null)
    setSaveError('')
  }

  const openEdit = (child: Child) => {
    const f = {
      name: child.name,
      color: child.color,
      avatar_url: child.avatar_url,
      avatar_position: child.avatar_position ?? '50% 50%',
      avatar_zoom: child.avatar_zoom ?? 1,
    }
    setForm(f)
    setEditing(child)
    setAdding(false)
    setSaveError('')
  }


  // ── Photo upload ────────────────────────────────────────────
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) { alert('Upload failed: ' + error.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    setForm(f => ({ ...f, avatar_url: publicUrl, avatar_position: '50% 50%', avatar_zoom: 1 }))
    setUploading(false)
  }

  // ── Save ────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user || !form.name.trim()) return
    setSaving(true)
    setSaveError('')

    const payload = {
      name: form.name.trim(),
      color: form.color,
      avatar_url: form.avatar_url,
      avatar_position: form.avatar_position,
      avatar_zoom: form.avatar_zoom,
      avatar_emoji: '👤',
    }

    const { error } = editing
      ? await supabase.from('children').update(payload).eq('id', editing.id)
      : await supabase.from('children').insert({ ...payload, parent_id: user.id, display_order: children.length })

    setSaving(false)
    if (error) { setSaveError(error.message); return }

    setEditing(null)
    setAdding(false)
    fetchChildren()
    router.refresh()
  }

  const handleDelete = async (childId: string) => {
    if (!confirm(t('delete_child_confirm'))) return
    await supabase.from('children').delete().eq('id', childId)
    fetchChildren()
  }

  if (loading || fetching) {
    return (
      <main className="h-dvh flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-5xl animate-spin">👦</div>
      </main>
    )
  }

  const showForm = adding || !!editing

  return (
  <>
    <main className="min-h-dvh safe-x safe-top safe-bottom" style={{ background: 'var(--color-bg)' }}>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/settings')} className="text-2xl opacity-60" style={{ color: 'var(--color-text)' }}>←</button>
        <h1 className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>{t('children')}</h1>
      </div>

      {/* List */}
      {!showForm && (
        <>
          <div className="space-y-3 mb-6">
            {children.map(child => (
              <div key={child.id} className="flex items-center gap-4 px-4 py-3 rounded-2xl" style={{ background: 'rgba(0,0,0,0.05)' }}>
                <AvatarDisplay avatarUrl={child.avatar_url} avatarPosition={child.avatar_position} avatarZoom={child.avatar_zoom} color={child.color} className="w-12 h-12" />
                <div className="flex-1 font-bold" style={{ color: 'var(--color-text)' }}>{child.name}</div>
                <button onClick={() => openEdit(child)} className="text-xl opacity-50 px-2">✏️</button>
                <button onClick={() => handleDelete(child.id)} className="text-xl opacity-50 px-2">🗑️</button>
              </div>
            ))}
          </div>
          <button onClick={openAdd} className="w-full py-4 rounded-2xl text-white font-bold text-lg active:scale-95 transition-transform" style={{ background: 'var(--color-primary)' }}>
            {t('add_child_btn')}
          </button>
        </>
      )}

      {/* Form */}
      {showForm && (
        <div className="space-y-6">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <button
              className="relative active:scale-95 transition-transform"
              onClick={() => form.avatar_url && setShowEditModal(true)}
              style={{ cursor: form.avatar_url ? 'pointer' : 'default' }}
            >
              <AvatarDisplay avatarUrl={form.avatar_url} avatarPosition={form.avatar_position} avatarZoom={form.avatar_zoom} color={form.color} className="w-32 h-32" />
              {form.avatar_url && (
                <div className="absolute inset-0 rounded-full flex items-end justify-center pb-2 pointer-events-none">
                  <span className="text-white/80 text-[10px] font-semibold bg-black/30 px-2 py-0.5 rounded-full">
                    {t('tap_to_adjust')}
                  </span>
                </div>
              )}
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-5 py-2.5 rounded-full text-sm font-bold text-white active:scale-95 transition-transform"
                style={{ background: 'var(--color-primary)' }}
              >
                {uploading ? t('uploading') : t('upload_photo')}
              </button>
              {form.avatar_url && (
                <button
                  onClick={() => setForm(f => ({ ...f, avatar_url: null, avatar_position: '50% 50%', avatar_zoom: 1 }))}
                  className="px-5 py-2.5 rounded-full text-sm font-bold"
                  style={{ background: 'rgba(0,0,0,0.07)', color: 'var(--color-text)' }}
                >
                  {t('remove')}
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-bold opacity-50 mb-2 block" style={{ color: 'var(--color-text)' }}>{t('name')}</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={t('childs_name')}
              className="w-full px-4 py-4 rounded-2xl text-base outline-none border-2 border-transparent focus:border-[var(--color-primary)] transition-colors"
              style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--color-text)' }}
            />
          </div>

          {/* Color */}
          <div>
            <label className="text-sm font-bold opacity-50 mb-2 block" style={{ color: 'var(--color-text)' }}>{t('color')}</label>
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

          {saveError && (
            <p className="text-red-500 text-sm text-center">{saveError}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => { setEditing(null); setAdding(false) }}
              className="flex-1 py-4 rounded-2xl font-bold"
              style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--color-text)' }}
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim() || uploading}
              className="flex-1 py-4 rounded-2xl text-white font-bold active:scale-95 transition-transform disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}
            >
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </div>
      )}
    </main>

    {/* Avatar edit modal */}
    {showEditModal && form.avatar_url && (
      <AvatarEditModal
        avatarUrl={form.avatar_url}
        initialPosition={form.avatar_position}
        initialZoom={form.avatar_zoom}
        onSave={(position, zoom) => {
          setForm(f => ({ ...f, avatar_position: position, avatar_zoom: zoom }))
          setShowEditModal(false)
        }}
        onClose={() => setShowEditModal(false)}
      />
    )}
  </>
  )
}
