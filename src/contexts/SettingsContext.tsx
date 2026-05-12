'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface SettingsContextValue {
  stampGoal: number
  updateStampGoal: (goal: number) => void
}

const SettingsContext = createContext<SettingsContextValue>({
  stampGoal: 10,
  updateStampGoal: () => {},
})

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [stampGoal, setStampGoal] = useState(10)

  useEffect(() => {
    const load = async (userId: string) => {
      const { data } = await supabase
        .from('settings')
        .select('stamp_goal')
        .eq('parent_id', userId)
        .single()
      if (data) setStampGoal(data.stamp_goal)
    }

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) load(data.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) load(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <SettingsContext.Provider value={{ stampGoal, updateStampGoal: setStampGoal }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
