export interface Child {
  id: string
  parent_id: string
  name: string
  avatar_emoji: string
  avatar_url: string | null
  avatar_position: string | null
  avatar_zoom: number | null
  color: string
  stamp_logo_type: 'emoji' | 'upload'
  stamp_logo_value: string
  display_order: number
  created_at: string
}

export interface Task {
  id: string
  parent_id: string
  name: string
  icon: string
  display_order: number
  created_at: string
}

export interface Stamp {
  id: string
  child_id: string
  task_id: string | null
  task_name: string | null
  stamp_icon: string
  awarded_at: string
}

export interface WheelItem {
  id: string
  parent_id: string
  label: string
  emoji: string
  color: string
  weight: number
  display_order: number
  created_at: string
}

export interface SpinHistory {
  id: string
  child_id: string
  wheel_item_id: string | null
  wheel_item_label: string
  wheel_item_emoji: string
  spun_at: string
  redeemed_at: string | null
}

export interface Settings {
  id: string
  parent_id: string
  stamp_goal: number
  theme: ThemeKey
  parent_pin: string
  created_at: string
  updated_at: string
}

export type ThemeKey = 'bright' | 'pastel' | 'space' | 'nature' | 'ocean' | 'candy' | 'sunset' | 'midnight'
