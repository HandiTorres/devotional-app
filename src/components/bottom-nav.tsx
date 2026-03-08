'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type NavItem = {
  label: string
  href: string
  emoji: string
}

export default function BottomNav() {
  const pathname = usePathname()
  const [gender, setGender] = useState<'him' | 'her' | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('users')
        .select('gender')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          const profile = data as { gender: 'him' | 'her' | null } | null
          if (profile?.gender) setGender(profile.gender)
        })
    })
  }, [])

  const thirdTab: NavItem = gender === 'her'
    ? { label: 'Garden', href: '/garden', emoji: '🌿' }
    : { label: 'Forge', href: '/forge', emoji: '⚒️' }

  const navItems: NavItem[] = [
    { label: 'Home', href: '/home', emoji: '🏠' },
    { label: 'Today', href: '/devotional', emoji: '📖' },
    thirdTab,
    { label: 'Profile', href: '/profile', emoji: '👤' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 pb-safe dark:bg-stone-900 dark:border-stone-700">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href === '/home' && pathname === '/') ||
            (item.href !== '/home' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive ? 'text-amber-600' : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300'
              }`}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
