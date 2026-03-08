'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type DarkModeContextType = {
  isDark: boolean
  toggle: () => void
  loading: boolean
}

const DarkModeContext = createContext<DarkModeContextType>({
  isDark: false,
  toggle: () => {},
  loading: true,
})

export function useDarkMode() {
  return useContext(DarkModeContext)
}

export default function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // 1. Check system preference as default
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(systemDark)

    // 2. Load user preference from Supabase (overrides system)
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false)
        return
      }
      setUserId(user.id)
      supabase
        .from('users')
        .select('dark_mode')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          const profile = data as { dark_mode: boolean | null } | null
          if (profile?.dark_mode !== null && profile?.dark_mode !== undefined) {
            setIsDark(profile.dark_mode)
          }
          setLoading(false)
        })
    })
  }, [])

  // Apply dark class to html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const toggle = async () => {
    const newValue = !isDark
    setIsDark(newValue)

    if (userId) {
      const supabase = createClient()
      await supabase
        .from('users')
        .update({ dark_mode: newValue } as never)
        .eq('id', userId)
    }
  }

  return (
    <DarkModeContext.Provider value={{ isDark, toggle, loading }}>
      {children}
    </DarkModeContext.Provider>
  )
}
