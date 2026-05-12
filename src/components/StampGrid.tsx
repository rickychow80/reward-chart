'use client'

const COLS = 5
const PAGE_SIZE = 25

interface StampData {
  id: string
  icon: string
  taskName: string | null
  awardedAt: string
}

interface StampGridProps {
  stamps: StampData[]
  color: string
  onTap: (stamp: StampData, rect: DOMRect) => void
}

export function StampGrid({ stamps, color, onTap }: StampGridProps) {
  return (
    <div
      className="grid gap-2 w-full"
      style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: PAGE_SIZE }, (_, i) => {
        const stamp = stamps[i]
        const filled = !!stamp
        return (
          <div
            key={i}
            className="stamp-cell aspect-square rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              background: filled ? color : 'rgba(0,0,0,0.06)',
              boxShadow: filled ? `0 4px 12px ${color}60` : 'none',
              transform: filled ? 'scale(1.05)' : 'scale(1)',
              cursor: filled ? 'pointer' : 'default',
            }}
            onClick={e => {
              if (!filled) return
              onTap(stamp, e.currentTarget.getBoundingClientRect())
            }}
          >
            {filled
              ? <span className="select-none leading-none" style={{ fontSize: '70cqi' }}>{stamp.icon}</span>
              : <span className="select-none leading-none text-gray-300" style={{ fontSize: '45cqi' }}>○</span>
            }
          </div>
        )
      })}
    </div>
  )
}
