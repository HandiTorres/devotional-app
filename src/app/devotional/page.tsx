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
    // Check for extension success
    if (searchParams.get('extended') === 'true') {
      setShowExtendedSuccess(true)
      // Clear the query param from URL
      window.history.replaceState({}, '', '/devotional')
      // Auto-hide after 5 seconds
      setTimeout(() => setShowExtendedSuccess(false), 5000)
    }

    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Load user profile for preferred charity and milestones
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

    // Load streak data
    const { data: rawStreakData } = await supabase
      .from('streaks')
      .select('current_streak, last_completed_date')
      .eq('user_id', user.id)
      .single()

    const streakData = rawStreakData as StreakData | null
    if (streakData) {
      setStreak(streakData.current_streak)

      // Check if they missed a day
      if (shouldShowExtensionModal(streakData)) {
        setStreakAtRisk(streakData.current_streak)
        setShowStreakModal(true)
        setLoading(false)
        return // Don't load devotional yet
      }
    }

    // Load devotional
    await loadDevotional()
  }

  const shouldShowExtensionModal = (streakData: StreakData): boolean => {
    // No streak to protect
    if (streakData.current_streak <= 0) return false

    // No last completed date
    if (!streakData.last_completed_date) return false

    const lastCompleted = new Date(streakData.last_completed_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    lastCompleted.setHours(0, 0, 0, 0)

    const diffDays = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24))

    // Show modal if missed more than 1 day (didn't complete yesterday or today)
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

      // Reload streak after loading devotional
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

      // Check for milestone
      const newStreak = data.streak
      const milestoneToShow = MILESTONE_DAYS.find(
        (day) => newStreak >= day && !milestonesShown.includes(day)
      )

      if (milestoneToShow) {
        // Update milestones shown in database
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const updatedMilestones = [...milestonesShown, milestoneToShow]
          await supabase
            .from('users')
            .update({ milestones_shown: updatedMilestones } as never)
            .eq('id', user.id)
          setMilestonesShown(updatedMilestones)
        }

        // Show milestone modal
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
        <main className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50" />
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
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone-600">Preparing your devotional...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-stone-900">Something went wrong</h1>
          <p className="text-stone-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50">
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
        <div className="fixed top-4 left-4 right-4 z-50 flex justify-center">
          <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Your streak continues! 10 meals provided.</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-stone-500 text-sm">{formatDate()}</p>
          <h1 className="text-xl font-bold text-stone-900">Daily Bread</h1>
        </div>
        <Link
          href="/impact"
          className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 rounded-full"
        >
          <span className="text-amber-700 text-sm font-medium">{streak} day streak</span>
          <span className="text-lg">🔥</span>
        </Link>
      </header>

      {/* Content */}
      <div className="px-6 pb-32">
        {devotional && (
          <article className="max-w-2xl mx-auto space-y-8">
            {/* Scripture */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <p className="text-xl leading-relaxed text-stone-800 font-serif italic">
                &ldquo;{devotional.scripture}&rdquo;
              </p>
              <p className="mt-3 text-amber-700 font-medium">
                — {devotional.scripture_reference}
              </p>
            </section>

            {/* Reflection */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-stone-900">Today&apos;s Reflection</h2>
              <div className="prose prose-stone max-w-none">
                {devotional.reflection.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-stone-700 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          </article>
        )}
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 p-6 bg-gradient-to-t from-amber-50 via-amber-50 to-transparent">
        <div className="max-w-md mx-auto">
          {completed ? (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">Completed for today!</span>
              </div>
              <p className="text-stone-500 text-sm">Come back tomorrow for your next devotional</p>
            </div>
          ) : (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="w-full py-4 px-6 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-amber-200"
            >
              {completing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                "I've completed today's reading"
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
      <main className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <DevotionalContent />
    </Suspense>
  )
}
