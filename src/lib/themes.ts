import type { ThemeKey } from '@/types'

export interface Theme {
  key: ThemeKey
  name: string
  emoji: string
  vars: Record<string, string>
}

export const themes: Record<ThemeKey, Theme> = {
  bright: {
    key: 'bright',
    name: 'Bright & Playful',
    emoji: '🟠',
    vars: {
      '--color-bg': '#FFFFFF',
      '--color-primary': '#FF6B35',
      '--color-accent': '#FFD700',
      '--color-success': '#4CAF50',
      '--color-fun': '#9C27B0',
      '--color-text': '#1A1A2E',
    },
  },
  pastel: {
    key: 'pastel',
    name: 'Soft Pastel',
    emoji: '🩷',
    vars: {
      '--color-bg': '#FFF9F0',
      '--color-primary': '#FF8FAB',
      '--color-accent': '#FFCA7A',
      '--color-success': '#90DBB5',
      '--color-fun': '#B5ADFF',
      '--color-text': '#3D3D3D',
    },
  },
  space: {
    key: 'space',
    name: 'Space Adventure',
    emoji: '🚀',
    vars: {
      '--color-bg': '#0D1117',
      '--color-primary': '#7C3AED',
      '--color-accent': '#FBBF24',
      '--color-success': '#10B981',
      '--color-fun': '#EC4899',
      '--color-text': '#F0F0FF',
    },
  },
  nature: {
    key: 'nature',
    name: 'Nature & Animals',
    emoji: '🌿',
    vars: {
      '--color-bg': '#FAFFF4',
      '--color-primary': '#5CB85C',
      '--color-accent': '#FF9F43',
      '--color-success': '#54A0FF',
      '--color-fun': '#FF6B9D',
      '--color-text': '#2D3436',
    },
  },
  ocean: {
    key: 'ocean',
    name: 'Ocean & Sea',
    emoji: '🌊',
    vars: {
      '--color-bg': '#F0F9FF',
      '--color-primary': '#0EA5E9',
      '--color-accent': '#06B6D4',
      '--color-success': '#10B981',
      '--color-fun': '#F97316',
      '--color-text': '#0C4A6E',
    },
  },
  candy: {
    key: 'candy',
    name: 'Candy Land',
    emoji: '🍬',
    vars: {
      '--color-bg': '#FFF0F8',
      '--color-primary': '#EC4899',
      '--color-accent': '#A855F7',
      '--color-success': '#F472B6',
      '--color-fun': '#FB923C',
      '--color-text': '#500724',
    },
  },
  sunset: {
    key: 'sunset',
    name: 'Sunset',
    emoji: '🌅',
    vars: {
      '--color-bg': '#FFF8F0',
      '--color-primary': '#F97316',
      '--color-accent': '#EC4899',
      '--color-success': '#EAB308',
      '--color-fun': '#8B5CF6',
      '--color-text': '#431407',
    },
  },
  midnight: {
    key: 'midnight',
    name: 'Midnight',
    emoji: '🌙',
    vars: {
      '--color-bg': '#0F0A1E',
      '--color-primary': '#818CF8',
      '--color-accent': '#C084FC',
      '--color-success': '#34D399',
      '--color-fun': '#F472B6',
      '--color-text': '#E2E8F0',
    },
  },
}

export function applyTheme(key: ThemeKey) {
  const theme = themes[key]
  const root = document.documentElement
  Object.entries(theme.vars).forEach(([prop, value]) => {
    root.style.setProperty(prop, value)
  })
}
