'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import StreakModal from './streak-modal'
import MilestoneModal from './milestone-modal'
import BottomNav from '@/components/bottom-nav'

const MILESTONE_DAYS = [7, 30, 90]

type DevotionalContent = {
  scripture: string
  scripture_reference: string
  reflection: string
  generated_at: string
}

type StreakData = {
  current_streak: number
  last_completed_date: string | null
}

type CharityType = 'feeding' | 'water' | 'bible' | null

function DevotionalContent() {
  const searchParams = useSearchParams()
  const [devotional, setDevotional] = useState<DevotionalContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [streak, setStreak] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showStreakModal, setShowStreakModal] = useState(false)
  const [showExtendedSuccess, setShowExtendedSuccess] = useState(false)
  const [streakAtRisk, setStreakAtRisk] = useState(0)
  const [preferredCharity, setPreferredCharity] = useState<CharityType>(null)
  const [milestonesShown, setMilestonesShown] = useState<number[]>([])
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [currentMilestone, setCurrentMilestone] = useState<number | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (searchParams.get('extended') === 'true') {
      setShowExtendedSuccess(true)
      window.history.replaceState({}, '', '/devotional')
      setTimeout(() => setShowExtendedSuccess(false), 5000)
    }

    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase
      .from('users')
      .select('preferred_charity, milestones_shown')
      .eq('id', user.id)
      .single()

    const profile = profileData as { preferred_charity: CharityType; milestones_shown: number[] | null } | null
    if (profile?.preferred_charity) {
      setPreferredCharity(profile.preferred_charity)
    }
    if (profile?.milestones_shown) {
      setMilestonesShown(profile.milestones_shown)
    }

    const { data: rawStreakData } = await supabase
      .from('streaks')
      .select('current_streak, last_completed_date')
      .eq('user_id', user.id)
      .single()

    const streakData = rawStreakData as StreakData | null
    if (streakData) {
      setStreak(streakData.current_streak)

      if (shouldShowExtensionModal(streakData)) {
        setStreakAtRisk(streakData.current_streak)
        setShowStreakModal(true)
        setLoading(false)
        return
      }
    }

    await loadDevotional()
  }

  const shouldShowExtensionModal = (streakData: StreakData): boolean => {
    if (streakData.current_streak <= 0) return false
    if (!streakData.last_completed_date) return false

    const lastCompleted = new Date(streakData.last_completed_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    lastCompleted.setHours(0, 0, 0, 0)

    const diffDays = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays > 1
  }

  const loadDevotional = async () => {
    try {
      const response = await fetch('/api/devotional')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load devotional')
      }

      setDevotional(data.devotional)
      setCompleted(data.alreadyCompleted)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: reloadedStreak } = await supabase
          .from('streaks')
          .select('current_streak')
          .eq('user_id', user.id)
          .single()
        const streakResult = reloadedStreak as { current_streak: number } | null
        if (streakResult) {
          setStreak(streakResult.current_streak)
        }
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
      const response = await fetch('/api/devotional', {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete')
      }

      setCompleted(true)
      setStreak(data.streak)

      const newStreak = data.streak
      const milestoneToShow = MILESTONE_DAYS.find(
        (day) => newStreak >= day && !milestonesShown.includes(day)
      )

      if (milestoneToShow) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const updatedMilestones = [...milestonesShown, milestoneToShow]
          await supabase
            .from('users')
            .update({ milestones_shown: updatedMilestones } as never)
            .eq('id', user.id)
          setMilestonesShown(updatedMilestones)
        }

        setCurrentMilestone(milestoneToShow)
        setShowMilestoneModal(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setCompleting(false)
    }
  }

  const handleStartFresh = () => {
    setShowStreakModal(false)
    setStreak(0)
    loadDevotional()
  }

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }

  // Show streak modal
  if (showStreakModal) {
    return (
      <>
        <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50" />
        <StreakModal
          currentStreak={streakAtRisk}
          preferredCharity={preferredCharity}
          onStartFresh={handleStartFresh}
          onDismiss={() => {
            setShowStreakModal(false)
            loadDevotional()
          }}
        />
      </>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <p className="text-xl font-medium text-stone-700">Preparing your devotional</p>
            <p className="text-stone-500 mt-1">Personalizing today&apos;s reading for you...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 flex items-center justify-center px-8">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-20 h-20 bg-red-100 rounded-full mx-auto flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Something went wrong</h1>
            <p className="text-stone-500 mt-2">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50">
      {/* Milestone Modal */}
      {showMilestoneModal && currentMilestone && (
        <MilestoneModal
          milestone={currentMilestone}
          preferredCharity={preferredCharity}
          onDismiss={() => {
            setShowMilestoneModal(false)
            setCurrentMilestone(null)
          }}
        />
      )}

      {/* Success Toast */}
      {showExtendedSuccess && (
        <div className="fixed top-6 left-6 right-6 z-50 flex justify-center animate-fade-in">
          <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">Streak Extended!</p>
              <p className="text-emerald-100 text-sm">10 meals provided to families in need</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-8 pt-12 pb-6 flex items-start justify-between">
        <div>
          <p className="text-stone-400 text-sm tracking-wide uppercase">{formatDate()}</p>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight mt-1">Daily Bread</h1>
        </div>
        <Link
          href="/impact"
          className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
        >
          <span className="text-lg">🔥</span>
          <span className="text-stone-700 font-semibold">{streak}</span>
        </Link>
      </header>

      {/* Content */}
      <div className="px-8 pb-40">
        {devotional && (
          <article className="max-w-2xl mx-auto space-y-10 animate-fade-in">
            {/* Scripture Card */}
            <section className="relative bg-gradient-to-br from-white to-amber-50/50 rounded-3xl p-8 shadow-sm border border-stone-100 overflow-hidden">
              {/* Decorative quote mark */}
              <div className="absolute top-4 left-6 text-amber-200 text-8xl font-serif leading-none select-none opacity-50">
                &ldquo;
              </div>

              <div className="relative">
                <p className="text-2xl md:text-3xl leading-relaxed text-stone-800 font-serif italic pl-8">
                  {devotional.scripture}
                </p>
                <div className="mt-6 flex items-center gap-3 pl-8">
                  <div className="h-px flex-1 bg-gradient-to-r from-amber-300 to-transparent" />
                  <p className="text-amber-700 font-semibold whitespace-nowrap">
                    {devotional.scripture_reference}
                  </p>
                </div>
              </div>
            </section>

            {/* Reflection */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <span className="text-lg">💭</span>
                </div>
                <h2 className="text-xl font-bold text-stone-900">Today&apos;s Reflection</h2>
              </div>

              <div className="prose prose-lg prose-stone max-w-none">
                {devotional.reflection.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-stone-700 leading-relaxed text-lg mb-5 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          </article>
        )}
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-20 left-0 right-0 p-6 bg-gradient-to-t from-stone-50 via-stone-50 to-transparent">
        <div className="max-w-md mx-auto">
          {completed ? (
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-full mx-auto flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-stone-900">Completed for today</p>
              <p className="text-stone-500 text-sm mt-1">Come back tomorrow for your next devotional</p>
            </div>
          ) : (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="w-full py-5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-stone-300 disabled:to-stone-300 text-white font-semibold text-lg rounded-2xl transition-all duration-200 shadow-lg shadow-amber-200/50 hover:shadow-xl hover:shadow-amber-200/50 active:scale-[0.98]"
            >
              {completing ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>I&apos;ve completed today&apos;s reading</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  )
}

export default function DevotionalPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 flex items-center justify-center">
        <div className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <DevotionalContent />
    </Suspense>
  )
}
