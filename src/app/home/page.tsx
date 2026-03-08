'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import BottomNav from '@/components/bottom-nav'

type DashboardData = {
  currentStreak: number
  longestStreak: number
  totalExtensions: number
  completedToday: boolean
}

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string | null>(null)
  const [gender, setGender] = useState<'him' | 'her'>('him')

  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get user profile for greeting and gender
    const email = user.email
    if (email) {
      const name = email.split('@')[0]
      setUserName(name.charAt(0).toUpperCase() + name.slice(1))
    }

    const { data: profileData } = await supabase
      .from('users')
      .select('gender')
      .eq('id', user.id)
      .single()

    const profile = profileData as { gender: 'him' | 'her' | null } | null
    if (profile?.gender) setGender(profile.gender)

    type StreakRow = {
      current_streak: number
      longest_streak: number
      total_extensions: number
      last_completed_date: string | null
    }

    // Get streak data
    const { data: streakRaw } = await supabase
      .from('streaks')
      .select('current_streak, longest_streak, total_extensions, last_completed_date')
      .eq('user_id', user.id)
      .single()

    const streak = streakRaw as StreakRow | null

    // Check if completed today
    const today = new Date().toISOString().split('T')[0]
    const completedToday = streak?.last_completed_date === today

    setData({
      currentStreak: streak?.current_streak || 0,
      longestStreak: streak?.longest_streak || 0,
      totalExtensions: streak?.total_extensions || 0,
      completedToday,
    })
    setLoading(false)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }

  const mealsProvided = (data?.totalExtensions || 0) * 10

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 pb-28">
      {/* Header */}
      <header className="px-8 pt-12 pb-6">
        <p className="text-stone-400 text-sm tracking-wide uppercase">{formatDate()}</p>
        <h1 className="text-4xl font-bold text-stone-900 dark:text-white tracking-tight mt-1">
          {getGreeting()}{userName ? `, ${userName}` : ''}
        </h1>
      </header>

      <div className="px-8 space-y-6 max-w-lg mx-auto">
        {/* Today's Devotional - Hero Card */}
        <section className={`relative overflow-hidden rounded-3xl p-8 text-white shadow-lg ${
          gender === 'him'
            ? 'bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 shadow-stone-400/20'
            : 'bg-gradient-to-br from-amber-500 via-rose-400 to-amber-500 shadow-rose-200/50'
        }`}>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">{gender === 'him' ? '⚒️' : '🌿'}</span>
              </div>
              {data?.completedToday && (
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  Completed
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold mb-2">
              {gender === 'him' ? 'The Forge' : 'The Garden'}
            </h2>
            <p className={`mb-6 leading-relaxed ${gender === 'him' ? 'text-stone-400' : 'text-amber-100'}`}>
              {data?.completedToday
                ? (gender === 'him' ? "Iron sharpened today. Well done." : "You've nourished your soul today. Well done.")
                : (gender === 'him' ? 'Your daily challenge awaits' : 'Start your day rooted in grace')}
            </p>

            <Link
              href="/devotional"
              className={`inline-flex items-center gap-3 px-6 py-3 font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
                gender === 'him'
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-white text-amber-600 hover:bg-amber-50'
              }`}
            >
              {data?.completedToday ? 'Read Again' : 'Begin Reading'}
              <span>→</span>
            </Link>
          </div>
        </section>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Current Streak */}
          <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 border border-stone-200 dark:border-stone-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">🔥</span>
              <Link href="/impact" className="text-amber-600 text-sm font-medium hover:text-amber-700">
                Details
              </Link>
            </div>
            <p className="text-4xl font-bold text-stone-900 dark:text-white tracking-tight">{data?.currentStreak || 0}</p>
            <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">day streak</p>
          </div>

          {/* Personal Best */}
          <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 border border-stone-200 dark:border-stone-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">🏆</span>
            </div>
            <p className="text-4xl font-bold text-stone-900 dark:text-white tracking-tight">{data?.longestStreak || 0}</p>
            <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">personal best</p>
          </div>
        </div>

        {/* Impact Card */}
        <section className="bg-white dark:bg-stone-800 rounded-2xl p-6 border border-stone-200 dark:border-stone-700 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🍽️</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-1">Your Impact</h3>
              {mealsProvided > 0 ? (
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                  Your consistency has provided{' '}
                  <span className="font-semibold text-emerald-600">{mealsProvided} meals</span>{' '}
                  to families in need
                </p>
              ) : (
                <p className="text-stone-500 dark:text-stone-400 leading-relaxed">
                  Keep your streak going. When you extend, 100% feeds families in need.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Forge / Garden Card */}
        {gender === 'him' ? (
          <section className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⚒️</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">The Forge</h3>
                <p className="text-stone-400 text-sm leading-relaxed mb-4">
                  Daily challenges to sharpen your character. Iron sharpens iron.
                </p>
                <Link
                  href="/forge"
                  className="inline-flex items-center gap-2 text-amber-400 font-medium text-sm hover:text-amber-300 transition-colors"
                >
                  Enter The Forge
                  <span>→</span>
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-gradient-to-br from-rose-50 to-amber-50 dark:from-stone-800 dark:to-stone-800 rounded-2xl p-6 border border-rose-100 dark:border-stone-700">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🌿</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-stone-900 dark:text-white">The Garden</h3>
                <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-4">
                  Daily reflections to nurture your soul. Rooted in grace.
                </p>
                <Link
                  href="/garden"
                  className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium text-sm hover:text-rose-700 transition-colors"
                >
                  Visit The Garden
                  <span>→</span>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/impact"
            className="bg-white dark:bg-stone-800 rounded-2xl p-5 border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200 group"
          >
            <span className="text-2xl block mb-2">📊</span>
            <p className="font-medium text-stone-900 dark:text-white group-hover:text-amber-700 transition-colors">View Impact</p>
            <p className="text-stone-500 dark:text-stone-400 text-sm">See your giving</p>
          </Link>

          <Link
            href="/profile"
            className="bg-white dark:bg-stone-800 rounded-2xl p-5 border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200 group"
          >
            <span className="text-2xl block mb-2">⚙️</span>
            <p className="font-medium text-stone-900 dark:text-white group-hover:text-amber-700 transition-colors">Settings</p>
            <p className="text-stone-500 dark:text-stone-400 text-sm">Manage profile</p>
          </Link>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
