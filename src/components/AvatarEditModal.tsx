'use client'

import { useState, useRef } from 'react'

interface AvatarEditModalProps {
  avatarUrl: string
  initialPosition: string
  initialZoom: number
  onSave: (position: string, zoom: number) => void
  onClose: () => void
}

export function AvatarEditModal({ avatarUrl, initialPosition, initialZoom, onSave, onClose }: AvatarEditModalProps) {
  const [position, setPosition] = useState(initialPosition)
  const [zoom, setZoom] = useState(initialZoom)

  // Always-current values — used in Done click to avoid stale closure
  const stateRef = useRef({ position: initialPosition, zoom: initialZoom })
  const dragRef = useRef<{ startX: number; startY: number; px: number; py: number } | null>(null)
  const pinchRef = useRef<{ startDist: number; startZoom: number } | null>(null)

  const parsePos = (pos: string) => {
    const [x, y] = pos.split(' ').map(parseFloat)
    return { x: isNaN(x) ? 50 : x, y: isNaN(y) ? 50 : y }
  }

  const commit = (pos: string, z: number) => {
    stateRef.current = { position: pos, zoom: z }
    setPosition(pos)
    setZoom(z)
  }

  const pinchDist = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // ── Touch handlers ─────────────────────────────────────────
  // NOTE: no e.preventDefault() in touchStart — it cancels click events on buttons
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length >= 2) {
      pinchRef.current = { startDist: pinchDist(e.touches), startZoom: stateRef.current.zoom }
      dragRef.current = null
    } else {
      pinchRef.current = null
      const { x, y } = parsePos(stateRef.current.position)
      dragRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, px: x, py: y }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault() // prevent scroll — safe here, doesn't affect clicks
    if (e.touches.length >= 2 && pinchRef.current) {
      const scale = pinchDist(e.touches) / pinchRef.current.startDist
      const newZoom = Math.max(1, Math.min(5, pinchRef.current.startZoom * scale))
      commit(stateRef.current.position, newZoom)
    } else if (e.touches.length === 1 && dragRef.current) {
      const { startX, startY, px, py } = dragRef.current
      const newX = Math.max(0, Math.min(100, px - (e.touches[0].clientX - startX) * 0.2))
      const newY = Math.max(0, Math.min(100, py - (e.touches[0].clientY - startY) * 0.2))
      commit(`${newX}% ${newY}%`, stateRef.current.zoom)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) pinchRef.current = null
    if (e.touches.length === 0) dragRef.current = null
  }

  // ── Mouse (desktop) ────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = parsePos(stateRef.current.position)
    dragRef.current = { startX: e.clientX, startY: e.clientY, px: x, py: y }
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current || e.buttons !== 1) return
    const { startX, startY, px, py } = dragRef.current
    const newX = Math.max(0, Math.min(100, px - (e.clientX - startX) * 0.2))
    const newY = Math.max(0, Math.min(100, py - (e.clientY - startY) * 0.2))
    commit(`${newX}% ${newY}%`, stateRef.current.zoom)
  }
  const handleMouseUp = () => { dragRef.current = null }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>

      {/* Touch/drag capture — covers full screen, touchAction:none prevents scroll */}
      <div
        className="absolute inset-0"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ touchAction: 'none', cursor: 'grab' }}
      />

      {/* Hint */}
      <div
        className="absolute text-white/75 text-sm px-4 py-1.5 rounded-full pointer-events-none"
        style={{ top: 'max(3.5rem, env(safe-area-inset-top) + 1rem)', background: 'rgba(0,0,0,0.4)' }}
      >
        Drag to pan · Pinch to zoom
      </div>

      {/* Circle preview — what you see = what the avatar looks like */}
      <div
        className="relative pointer-events-none"
        style={{
          width: 'min(72vw, 48vh)',
          height: 'min(72vw, 48vh)',
          borderRadius: '50%',
          border: '2.5px solid rgba(255,255,255,0.8)',
          backgroundImage: `url(${avatarUrl})`,
          backgroundSize: `${zoom * 100}%`,
          backgroundPosition: position,
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#111',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.15), 0 8px 40px rgba(0,0,0,0.6)',
        }}
      />

      {/* Buttons — pointer-events-auto so they receive clicks above the capture div */}
      <div
        className="absolute inset-x-0 bottom-0 flex gap-4 px-6 pointer-events-none"
        style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={onClose}
          className="flex-1 py-4 rounded-2xl font-bold text-white text-lg active:scale-95 transition-transform pointer-events-auto"
          style={{ background: 'rgba(255,255,255,0.15)' }}
        >
          Cancel
        </button>
        <button
          onClick={() => {
            // Use stateRef for guaranteed up-to-date values
            onSave(stateRef.current.position, stateRef.current.zoom)
          }}
          className="flex-1 py-4 rounded-2xl font-bold text-white text-lg active:scale-95 transition-transform pointer-events-auto"
          style={{ background: 'var(--color-primary)' }}
        >
          Done
        </button>
      </div>
    </div>
  )
}
