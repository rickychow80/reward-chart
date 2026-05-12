'use client'

interface AvatarDisplayProps {
  avatarUrl?: string | null
  avatarPosition?: string | null
  avatarZoom?: number | null
  color: string
  className?: string
}

function PersonSVG() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-3/5 h-3/5">
      <circle cx="40" cy="27" r="17" fill="white" fillOpacity="0.92" />
      <path d="M6 75 C6 50 74 50 74 75" fill="white" fillOpacity="0.92" />
    </svg>
  )
}

export function AvatarDisplay({ avatarUrl, avatarPosition, avatarZoom, color, className = '' }: AvatarDisplayProps) {
  return (
    <div
      className={`rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}
      style={avatarUrl ? {
        backgroundImage: `url(${avatarUrl})`,
        backgroundSize: `${(avatarZoom ?? 1) * 100}%`,
        backgroundPosition: avatarPosition ?? '50% 50%',
        backgroundRepeat: 'no-repeat',
        backgroundColor: color,
      } : {
        backgroundColor: color,
      }}
    >
      {!avatarUrl && <PersonSVG />}
    </div>
  )
}
