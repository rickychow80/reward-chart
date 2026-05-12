'use client'

import { useRef, useState } from 'react'
import type { WheelItem } from '@/types'

const WHEEL_COLORS = [
  '#FF6B35', '#FFD700', '#4CAF50', '#9C27B0',
  '#FF8FAB', '#54A0FF', '#FF9F43', '#10B981',
]

interface SpinWheelProps {
  items: WheelItem[]
  onResult: (item: WheelItem) => void
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function slicePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polarToCartesian(cx, cy, r, startDeg)
  const e = polarToCartesian(cx, cy, r, endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`
}

function pickWinner(items: WheelItem[]): number {
  const total = items.reduce((s, it) => s + it.weight, 0)
  let rand = Math.random() * total
  for (let i = 0; i < items.length; i++) {
    rand -= items[i].weight
    if (rand <= 0) return i
  }
  return items.length - 1
}

export function SpinWheel({ items, onResult }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const winnerRef = useRef<WheelItem | null>(null)

  const cx = 150, cy = 150, r = 138
  const n = items.length
  const sliceDeg = 360 / n

  const handleSpin = () => {
    if (spinning || n === 0) return
    setSpinning(true)

    const winnerIndex = pickWinner(items)
    winnerRef.current = items[winnerIndex]

    const winnerCenter = (winnerIndex + 0.5) * sliceDeg
    // When wheel rotates clockwise by R, the pointer (top) shows what was at (360 - R) % 360
    const targetMod = (360 - winnerCenter + 360) % 360
    const currentMod = rotation % 360
    const diff = (targetMod - currentMod + 360) % 360
    const spinAmount = 8 * 360 + diff

    setRotation(prev => prev + spinAmount)

    setTimeout(() => {
      setSpinning(false)
      if (winnerRef.current) onResult(winnerRef.current)
    }, 4200)
  }

  if (n === 0) {
    return (
      <div className="text-center p-8 text-gray-400">
        No rewards on the wheel yet. Ask a parent to add some in Settings!
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="relative w-full" style={{ maxWidth: 'min(80vw, 80vh, 340px)' }}>
        {/* Pointer */}
        <div
          className="absolute left-1/2 -top-3 z-10"
          style={{ transform: 'translateX(-50%)' }}
        >
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '14px solid transparent',
              borderRight: '14px solid transparent',
              borderTop: '28px solid #EF4444',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
          />
        </div>

        {/* Wheel — shadow on wrapper so it doesn't spin */}
        <div style={{ borderRadius: '50%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', lineHeight: 0 }}>
        <svg
          width="100%"
          viewBox="0 0 300 300"
          style={{
            display: 'block',
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
              : 'none',
            borderRadius: '50%',
          }}
        >
          {items.map((item, i) => {
            const startDeg = i * sliceDeg
            const endDeg = (i + 1) * sliceDeg
            const midDeg = startDeg + sliceDeg / 2
            const color = item.color || WHEEL_COLORS[i % WHEEL_COLORS.length]
            const textPos = polarToCartesian(cx, cy, r * 0.62, midDeg)
            const emojiPos = polarToCartesian(cx, cy, r * 0.82, midDeg)

            return (
              <g key={item.id}>
                <path
                  d={slicePath(cx, cy, r, startDeg, endDeg)}
                  fill={color}
                  stroke="#fff"
                  strokeWidth="2"
                />
                <text
                  x={emojiPos.x}
                  y={emojiPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="18"
                  transform={`rotate(${midDeg}, ${emojiPos.x}, ${emojiPos.y})`}
                  style={{ userSelect: 'none' }}
                >
                  {item.emoji}
                </text>
                <text
                  x={textPos.x}
                  y={textPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#fff"
                  transform={`rotate(${midDeg}, ${textPos.x}, ${textPos.y})`}
                  style={{ userSelect: 'none' }}
                >
                  {item.label.length > 9 ? item.label.slice(0, 9) + '…' : item.label}
                </text>
              </g>
            )
          })}

          {/* Center cap */}
          <circle cx={cx} cy={cy} r="22" fill="#fff" stroke="#e5e7eb" strokeWidth="2" />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="20">
            🎡
          </text>
        </svg>
        </div>
      </div>

      <button
        onClick={handleSpin}
        disabled={spinning}
        className="px-10 py-4 rounded-full text-white text-2xl font-black shadow-lg active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: spinning ? '#9CA3AF' : 'var(--color-primary)' }}
      >
        {spinning ? 'Spinning…' : 'SPIN! 🎡'}
      </button>
    </div>
  )
}
