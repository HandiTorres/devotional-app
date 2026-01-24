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

    // Get user email for greeting (could be enhanced with a name field later)
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

  const mealsProvided = (data?.totalExtensions || 0) * 10

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 pb-24">
      {/* Header */}
      <header className="px-6 py-6">
        <p className="text-stone-500">{getGreeting()}</p>
        <h1 className="text-2xl font-bold text-stone-900">
          {userName ? `Welcome back, ${userName}` : 'Welcome back'}
        </h1>
      </header>

      <div className="px-6 space-y-6 max-w-lg mx-auto">
        {/* Streak Card */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-900">Your Streak</h2>
            <Link
              href="/impact"
              className="text-amber-600 text-sm font-medium hover:text-amber-700"
            >
              View Impact
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">🔥</span>
            </div>
            <div>
              <p className="text-4xl font-bold text-stone-900">{data?.currentStreak || 0}</p>
              <p className="text-stone-500">day streak</p>
            </div>
          </div>
          {data?.longestStreak ? (
            <p className="text-sm text-stone-400 mt-4">
              Personal best: {data.longestStreak} days
            </p>
          ) : null}
        </section>

        {/* Today's Devotional CTA */}
        <section className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📖</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">
                {data?.completedToday ? "Today's Devotional" : "Today's Devotional Awaits"}
              </h3>
              <p className="text-amber-100 text-sm mb-4">
                {data?.completedToday
                  ? "You've completed your reading for today. Great work!"
                  : 'Start your day with Scripture personalized for you'}
              </p>
              <Link
                href="/devotional"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-amber-600 font-medium rounded-lg hover:bg-amber-50 transition-colors"
              >
                {data?.completedToday ? 'Review' : 'Read Now'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Impact Summary */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🍽️</span>
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 mb-1">Your Impact</h3>
              {mealsProvided > 0 ? (
                <p className="text-stone-600 text-sm">
                  Your consistency has provided <span className="font-semibold text-green-600">{mealsProvided} meals</span> to families in need
                </p>
              ) : (
                <p className="text-stone-500 text-sm">
                  Keep your streak going to make an impact. When you extend your streak, 100% feeds families in need.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Ask Pastor Preview */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🎙️</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-stone-900">Ask Pastor Landon</h3>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  Coming Soon
                </span>
              </div>
              <p className="text-stone-500 text-sm mb-3">
                Get biblical wisdom from thousands of sermons and Bible studies
              </p>
              <Link
                href="/ask"
                className="text-amber-600 text-sm font-medium hover:text-amber-700"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  )
}
