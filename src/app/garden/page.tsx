'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import BottomNav from '@/components/bottom-nav'

type GardenData = {
  seed: string
  verse: string
  weeklyTheme: string
  alreadyCompleted: boolean
}

type ProgressStats = {
  totalDays: number
  thisWeek: number
  currentStreak: number
}

export default function GardenPage() {
  const [data, setData] = useState<GardenData | null>(null)
  const [stats, setStats] = useState<ProgressStats>({ totalDays: 0, thisWeek: 0, currentStreak: 0 })
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadGarden()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadGarden = async () => {
    try {
      const response = await fetch('/api/garden/seed')
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to load seed')
      setData(result)
      setCompleted(result.alreadyCompleted)

      // Load stats
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: progressRows } = await supabase
          .from('garden_progress')
          .select('date, completed')
          .eq('user_id', user.id)
          .eq('completed', true)

        const rows = (progressRows || []) as { date: string; completed: boolean }[]
        const totalDays = rows.length

        const now = new Date()
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        const thisWeek = rows.filter(r => new Date(r.date) >= startOfWeek).length

        const { data: streakData } = await supabase
          .from('streaks')
          .select('current_streak')
          .eq('user_id', user.id)
          .maybeSingle()
        const streak = (streakData as { current_streak: number } | null)?.current_streak || 0

        setStats({ totalDays, thisWeek, currentStreak: streak })

        const today = new Date().toISOString().split('T')[0]
        const todayRow = rows.find(r => r.date === today)
        if (todayRow) setCompleted(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    setCompleting(true)
    try {
      const response = await fetch('/api/garden/seed', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to complete')
      setCompleted(true)
      setStats(prev => ({
        ...prev,
        totalDays: prev.totalDays + 1,
        thisWeek: prev.thisWeek + 1,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setCompleting(false)
    }
  }

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50/30 to-stone-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone-500 dark:text-slate-400">Tending your garden...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50/30 to-stone-50 flex items-center justify-center px-8">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-2xl font-bold text-stone-900">Something went wrong</p>
          <p className="text-stone-500">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-rose-400 text-white font-semibold rounded-xl">
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50/30 to-stone-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-28">
      {/* Header */}
      <header className="px-8 pt-12 pb-6">
        <p className="text-stone-400 dark:text-slate-500 text-sm tracking-wide uppercase">{formatDate()}</p>
        <h1 className="text-3xl font-bold text-stone-900 dark:text-white tracking-tight mt-1 flex items-center gap-3">
          <span>&#127807;</span>
          The Garden
        </h1>
        <p className="text-stone-500 dark:text-slate-400 text-sm mt-1">Rooted in Grace</p>
      </header>

      <div className="px-8 space-y-6 max-w-lg mx-auto">
        {/* Today's Seed Card */}
        <section className="bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-800 dark:to-slate-800 rounded-3xl p-8 border border-stone-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-lg">&#127793;</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">Today&apos;s Seed</h2>
          </div>

          {data?.seed ? (
            <p className="text-stone-700 dark:text-slate-300 text-lg leading-relaxed mb-2">{data.seed}</p>
          ) : (
            <p className="text-stone-400 italic">No seed loaded</p>
          )}

          {data?.verse && (
            <p className="text-amber-700 text-sm font-medium mt-4">Inspired by {data.verse}</p>
          )}

          {/* Complete button */}
          <div className="mt-6">
            {completed ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <p className="text-emerald-700 font-semibold">&#10003; Seed planted today</p>
              </div>
            ) : (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="w-full py-4 px-6 bg-gradient-to-r from-rose-400 to-amber-500 hover:from-rose-500 hover:to-amber-600 disabled:from-stone-300 disabled:to-stone-300 text-white font-semibold rounded-xl transition-all"
              >
                {completing ? 'Planting...' : 'I reflected on this today &#10003;'}
              </button>
            )}
          </div>
        </section>

        {/* Growth Season - Weekly Theme */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-stone-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <span className="text-lg">&#127774;</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-white">Growth Season</h3>
              <p className="text-stone-500 dark:text-slate-400 text-sm">Weekly Journey</p>
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-slate-900/50 rounded-xl p-4 mt-2">
            <p className="text-amber-700 dark:text-amber-400 font-semibold text-lg">{data?.weeklyTheme || 'Rest'}</p>
            <p className="text-stone-500 dark:text-slate-400 text-sm mt-1">This week&apos;s season of growth</p>
          </div>
        </section>

        {/* Bloom Tracker */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-stone-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center">
              <span className="text-lg">&#127800;</span>
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-white">Bloom Tracker</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-stone-900 dark:text-white">{stats.totalDays}</p>
              <p className="text-stone-500 dark:text-slate-400 text-xs mt-1">Seeds Planted</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-stone-900 dark:text-white">{stats.thisWeek}</p>
              <p className="text-stone-500 dark:text-slate-400 text-xs mt-1">This Week</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-rose-500">{stats.currentStreak}</p>
              <p className="text-stone-500 text-xs mt-1">Streak &#128293;</p>
            </div>
          </div>
        </section>

        {/* Sisterhood */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-stone-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <span className="text-lg">&#128149;</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-white">Sisterhood</h3>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-medium rounded-full">
                Coming Soon
              </span>
            </div>
          </div>
          <p className="text-stone-500 dark:text-slate-400 text-sm leading-relaxed">
            A safe space to share, pray, and grow together with women who understand your journey.
          </p>
        </section>
      </div>

      <BottomNav />
    </main>
  )
}
