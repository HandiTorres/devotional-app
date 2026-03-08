'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import BottomNav from '@/components/bottom-nav'

type ForgeData = {
  challenge: string
  verse: string
  weeklyTheme: string
  alreadyCompleted: boolean
}

type ProgressStats = {
  totalDays: number
  thisWeek: number
  currentStreak: number
}

export default function ForgePage() {
  const [data, setData] = useState<ForgeData | null>(null)
  const [stats, setStats] = useState<ProgressStats>({ totalDays: 0, thisWeek: 0, currentStreak: 0 })
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadForge()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadForge = async () => {
    try {
      const response = await fetch('/api/forge/challenge')
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to load challenge')
      setData(result)
      setCompleted(result.alreadyCompleted)

      // Load stats
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: progressRows } = await supabase
          .from('forge_progress')
          .select('date, completed')
          .eq('user_id', user.id)
          .eq('completed', true)

        const rows = (progressRows || []) as { date: string; completed: boolean }[]
        const totalDays = rows.length

        // This week count
        const now = new Date()
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        const thisWeek = rows.filter(r => new Date(r.date) >= startOfWeek).length

        // Simple streak calc
        const { data: streakData } = await supabase
          .from('streaks')
          .select('current_streak')
          .eq('user_id', user.id)
          .maybeSingle()
        const streak = (streakData as { current_streak: number } | null)?.current_streak || 0

        setStats({ totalDays, thisWeek, currentStreak: streak })

        // Check if today is already completed
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
      const response = await fetch('/api/forge/challenge', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to complete challenge')
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
      <main className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone-400">Heating the forge...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center px-8">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-2xl font-bold text-white">Something went wrong</p>
          <p className="text-stone-400">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl">
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 pb-28">
      {/* Header */}
      <header className="px-8 pt-12 pb-6">
        <p className="text-stone-500 text-sm tracking-wide uppercase">{formatDate()}</p>
        <h1 className="text-3xl font-bold text-white tracking-tight mt-1 flex items-center gap-3">
          <span>&#9874;&#65039;</span>
          The Forge
        </h1>
        <p className="text-stone-500 text-sm mt-1">Forged in the Word</p>
      </header>

      <div className="px-8 space-y-6 max-w-lg mx-auto">
        {/* Daily Challenge Card */}
        <section className="bg-gradient-to-br from-stone-800 to-stone-750 rounded-3xl p-8 border border-stone-700 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <span className="text-lg">&#9876;&#65039;</span>
            </div>
            <h2 className="text-xl font-bold text-white">Daily Challenge</h2>
          </div>

          {data?.challenge ? (
            <p className="text-stone-300 text-lg leading-relaxed mb-2">{data.challenge}</p>
          ) : (
            <p className="text-stone-500 italic">No challenge loaded</p>
          )}

          {data?.verse && (
            <p className="text-amber-400 text-sm font-medium mt-4">Based on {data.verse}</p>
          )}

          {/* Complete button */}
          <div className="mt-6">
            {completed ? (
              <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4 text-center">
                <p className="text-emerald-400 font-semibold">&#10003; Challenge completed</p>
              </div>
            ) : (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-stone-600 disabled:to-stone-600 text-white font-semibold rounded-xl transition-all"
              >
                {completing ? 'Marking...' : 'Challenge Accepted &#10003;'}
              </button>
            )}
          </div>
        </section>

        {/* The Anvil - Weekly Focus */}
        <section className="bg-stone-800/50 rounded-2xl p-6 border border-stone-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <span className="text-lg">&#128296;</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">The Anvil</h3>
              <p className="text-stone-500 text-sm">Weekly Focus</p>
            </div>
          </div>
          <div className="bg-stone-900/50 rounded-xl p-4 mt-2">
            <p className="text-amber-400 font-semibold text-lg">{data?.weeklyTheme || 'Discipline'}</p>
            <p className="text-stone-400 text-sm mt-1">This week&apos;s area of growth</p>
          </div>
        </section>

        {/* Iron Stats */}
        <section className="bg-stone-800/50 rounded-2xl p-6 border border-stone-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <span className="text-lg">&#128200;</span>
            </div>
            <h3 className="text-lg font-bold text-white">Iron Stats</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{stats.totalDays}</p>
              <p className="text-stone-500 text-xs mt-1">Total Days</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{stats.thisWeek}</p>
              <p className="text-stone-500 text-xs mt-1">This Week</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-400">{stats.currentStreak}</p>
              <p className="text-stone-500 text-xs mt-1">Streak &#128293;</p>
            </div>
          </div>
        </section>

        {/* Brotherhood */}
        <section className="bg-stone-800/50 rounded-2xl p-6 border border-stone-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <span className="text-lg">&#129309;</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Brotherhood</h3>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs font-medium rounded-full">
                Coming Soon
              </span>
            </div>
          </div>
          <p className="text-stone-400 text-sm leading-relaxed">
            Connect with other men on the same journey. Accountability, encouragement, and iron sharpening iron.
          </p>
        </section>
      </div>

      <BottomNav />
    </main>
  )
}
