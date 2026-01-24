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

  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get user email for greeting
    const email = user.email
    if (email) {
      const name = email.split('@')[0]
      setUserName(name.charAt(0).toUpperCase() + name.slice(1))
    }

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
      <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 pb-28">
      {/* Header */}
      <header className="px-8 pt-12 pb-6">
        <p className="text-stone-400 text-sm tracking-wide uppercase">{formatDate()}</p>
        <h1 className="text-4xl font-bold text-stone-900 tracking-tight mt-1">
          {getGreeting()}{userName ? `, ${userName}` : ''}
        </h1>
      </header>

      <div className="px-8 space-y-6 max-w-lg mx-auto">
        {/* Today's Devotional - Hero Card */}
        <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-amber-500 to-amber-600 rounded-3xl p-8 text-white shadow-lg shadow-amber-200/50">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">📖</span>
              </div>
              {data?.completedToday && (
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                  Completed
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold mb-2">
              {data?.completedToday ? "Today's Devotional" : "Your Daily Bread Awaits"}
            </h2>
            <p className="text-amber-100 mb-6 leading-relaxed">
              {data?.completedToday
                ? "You've nourished your soul today. Well done."
                : 'Start your day with Scripture personalized just for you'}
            </p>

            <Link
              href="/devotional"
              className="inline-flex items-center gap-3 px-6 py-3 bg-white text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {data?.completedToday ? 'Read Again' : 'Begin Reading'}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Current Streak */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">🔥</span>
              <Link href="/impact" className="text-amber-600 text-sm font-medium hover:text-amber-700">
                Details
              </Link>
            </div>
            <p className="text-4xl font-bold text-stone-900 tracking-tight">{data?.currentStreak || 0}</p>
            <p className="text-stone-500 text-sm mt-1">day streak</p>
          </div>

          {/* Personal Best */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">🏆</span>
            </div>
            <p className="text-4xl font-bold text-stone-900 tracking-tight">{data?.longestStreak || 0}</p>
            <p className="text-stone-500 text-sm mt-1">personal best</p>
          </div>
        </div>

        {/* Impact Card */}
        <section className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🍽️</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-stone-900 mb-1">Your Impact</h3>
              {mealsProvided > 0 ? (
                <p className="text-stone-600 leading-relaxed">
                  Your consistency has provided{' '}
                  <span className="font-semibold text-emerald-600">{mealsProvided} meals</span>{' '}
                  to families in need
                </p>
              ) : (
                <p className="text-stone-500 leading-relaxed">
                  Keep your streak going. When you extend, 100% feeds families in need.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Ask Pastor Preview */}
        <section className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
              <span className="text-2xl">🎙️</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">Ask Pastor Landon</h3>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs font-medium rounded-full">
                  Coming Soon
                </span>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed mb-4">
                Get biblical wisdom from thousands of sermons and Bible studies
              </p>
              <Link
                href="/ask"
                className="inline-flex items-center gap-2 text-amber-400 font-medium text-sm hover:text-amber-300 transition-colors"
              >
                Learn More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/impact"
            className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200 group"
          >
            <span className="text-2xl block mb-2">📊</span>
            <p className="font-medium text-stone-900 group-hover:text-amber-700 transition-colors">View Impact</p>
            <p className="text-stone-500 text-sm">See your giving</p>
          </Link>

          <Link
            href="/profile"
            className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200 group"
          >
            <span className="text-2xl block mb-2">⚙️</span>
            <p className="font-medium text-stone-900 group-hover:text-amber-700 transition-colors">Settings</p>
            <p className="text-stone-500 text-sm">Manage profile</p>
          </Link>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
