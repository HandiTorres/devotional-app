'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Home', href: '/home', emoji: '🏠' },
  { label: 'Today', href: '/devotional', emoji: '📖' },
  { label: 'Ask', href: '/ask', emoji: '💬' },
  { label: 'Profile', href: '/profile', emoji: '👤' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 pb-safe">
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
                isActive ? 'text-amber-600' : 'text-stone-400 hover:text-stone-600'
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
