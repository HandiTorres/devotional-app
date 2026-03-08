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

// Gender-branded experience config
const BRAND = {
  him: {
    name: 'The Forge',
    icon: '⚒️',
    tagline: 'Forged in the Word',
    headerGradient: 'from-stone-800 via-stone-900 to-stone-950',
    headerText: 'text-white',
    headerSubtext: 'text-stone-400',
    accentBg: 'bg-amber-500',
    accentText: 'text-amber-400',
    scriptureGradient: 'from-stone-900 to-stone-800',
    scriptureBorder: 'border-stone-700',
    scriptureText: 'text-stone-100',
    scriptureRef: 'text-amber-400',
    quoteMark: 'text-amber-500/30',
    divider: 'from-amber-500 to-transparent',
    reflectionIcon: '⚔️',
    reflectionLabel: "Today's Challenge",
    ctaGradient: 'from-amber-500 to-amber-600',
    ctaHover: 'hover:from-amber-600 hover:to-amber-700',
    ctaShadow: 'shadow-amber-200/50',
    completedBg: 'bg-emerald-900/20',
    completedBorder: 'border-emerald-700/30',
  },
  her: {
    name: 'The Garden',
    icon: '🌿',
    tagline: 'Rooted in Grace',
    headerGradient: 'from-amber-50 via-rose-50/30 to-stone-50',
    headerText: 'text-stone-900',
    headerSubtext: 'text-stone-500',
    accentBg: 'bg-rose-400',
    accentText: 'text-rose-600',
    scriptureGradient: 'from-white to-amber-50/50',
    scriptureBorder: 'border-stone-100',
    scriptureText: 'text-stone-800',
    scriptureRef: 'text-amber-700',
    quoteMark: 'text-amber-200',
    divider: 'from-amber-300 to-transparent',
    reflectionIcon: '💭',
    reflectionLabel: "Today's Reflection",
    ctaGradient: 'from-rose-400 to-amber-500',
    ctaHover: 'hover:from-rose-500 hover:to-amber-600',
    ctaShadow: 'shadow-rose-200/50',
    completedBg: 'bg-emerald-50',
    completedBorder: 'border-emerald-200',
  },
}

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
  const [gender, setGender] = useState<'him' | 'her'>('him')

  const supabase = createClient()
  const brand = BRAND[gender]

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
      .select('preferred_charity, milestones_shown, gender')
      .eq('id', user.id)
      .single()

    const profile = profileData as { preferred_charity: CharityType; milestones_shown: number[] | null; gender: 'him' | 'her' | null } | null
    if (profile?.preferred_charity) setPreferredCharity(profile.preferred_charity)
    if (profile?.milestones_shown) setMilestonesShown(profile.milestones_shown)
    if (profile?.gender) setGender(profile.gender)

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
    if (streakData.current_streak <= 0 || !streakData.last_completed_date) return false
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
      if (!response.ok) throw new Error(data.error || 'Failed to load devotional')

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
        if (streakResult) setStreak(streakResult.current_streak)
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
      const response = await fetch('/api/devotional', { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to complete')

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

  // Streak modal
  if (showStreakModal) {
    return (
      <>
        <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50" />
        <StreakModal
          currentStreak={streakAtRisk}
          preferredCharity={preferredCharity}
          onStartFresh={handleStartFresh}
          onDismiss={() => { setShowStreakModal(false); loadDevotional() }}
        />
      </>
    )
  }

  if (loading) {
    return (
      <main className={`min-h-screen bg-gradient-to-b ${gender === 'him' ? 'from-stone-900 to-stone-800' : 'from-stone-50 via-amber-50/30 to-stone-50'} flex items-center justify-center`}>
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <p className={`text-xl font-medium ${gender === 'him' ? 'text-stone-200' : 'text-stone-700'}`}>
              {gender === 'him' ? 'Heating the forge' : 'Tending your garden'}
            </p>
            <p className={gender === 'him' ? 'text-stone-500 mt-1' : 'text-stone-500 mt-1'}>
              Personalizing today&apos;s reading for you...
            </p>
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
            <span className="text-4xl">&#9888;&#65039;</span>
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

  const pageBg = gender === 'him'
    ? 'bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900'
    : 'bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50'

  return (
    <main className={`min-h-screen ${pageBg}`}>
      {/* Milestone Modal */}
      {showMilestoneModal && currentMilestone && (
        <MilestoneModal
          milestone={currentMilestone}
          preferredCharity={preferredCharity}
          onDismiss={() => { setShowMilestoneModal(false); setCurrentMilestone(null) }}
        />
      )}

      {/* Success Toast */}
      {showExtendedSuccess && (
        <div className="fixed top-6 left-6 right-6 z-50 flex justify-center animate-fade-in">
          <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xl">&#10003;</span>
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
          <p className={`text-sm tracking-wide uppercase ${gender === 'him' ? 'text-stone-500' : 'text-stone-400'}`}>
            {formatDate()}
          </p>
          <h1 className={`text-3xl font-bold tracking-tight mt-1 flex items-center gap-3 ${gender === 'him' ? 'text-white' : 'text-stone-900'}`}>
            <span>{brand.icon}</span>
            {brand.name}
          </h1>
          <p className={`text-sm mt-1 ${gender === 'him' ? 'text-stone-500' : 'text-stone-500'}`}>
            {brand.tagline}
          </p>
        </div>
        <Link
          href="/impact"
          className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-200 ${
            gender === 'him'
              ? 'bg-stone-800 border border-stone-700'
              : 'bg-white border border-stone-200'
          }`}
        >
          <span className="text-lg">🔥</span>
          <span className={`font-semibold ${gender === 'him' ? 'text-white' : 'text-stone-700'}`}>{streak}</span>
        </Link>
      </header>

      {/* Content */}
      <div className="px-8 pb-40">
        {devotional && (
          <article className="max-w-2xl mx-auto space-y-10 animate-fade-in">
            {/* Scripture Card */}
            <section className={`relative bg-gradient-to-br ${brand.scriptureGradient} rounded-3xl p-8 shadow-sm border ${brand.scriptureBorder} overflow-hidden`}>
              <div className={`absolute top-4 left-6 text-8xl font-serif leading-none select-none opacity-50 ${brand.quoteMark}`}>
                &ldquo;
              </div>
              <div className="relative">
                <p className={`text-2xl md:text-3xl leading-relaxed font-serif italic pl-8 ${brand.scriptureText}`}>
                  {devotional.scripture}
                </p>
                <div className="mt-6 flex items-center gap-3 pl-8">
                  <div className={`h-px flex-1 bg-gradient-to-r ${brand.divider}`} />
                  <p className={`font-semibold whitespace-nowrap ${brand.scriptureRef}`}>
                    {devotional.scripture_reference}
                  </p>
                </div>
              </div>
            </section>

            {/* Reflection */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gender === 'him' ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                  <span className="text-lg">{brand.reflectionIcon}</span>
                </div>
                <h2 className={`text-xl font-bold ${gender === 'him' ? 'text-white' : 'text-stone-900'}`}>
                  {brand.reflectionLabel}
                </h2>
              </div>
              <div className="prose prose-lg max-w-none">
                {devotional.reflection.split('\n\n').map((paragraph, index) => (
                  <p key={index} className={`leading-relaxed text-lg mb-5 last:mb-0 ${gender === 'him' ? 'text-stone-300' : 'text-stone-700'}`}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          </article>
        )}
      </div>

      {/* Fixed Bottom CTA */}
      <div className={`fixed bottom-20 left-0 right-0 p-6 ${
        gender === 'him'
          ? 'bg-gradient-to-t from-stone-900 via-stone-900 to-transparent'
          : 'bg-gradient-to-t from-stone-50 via-stone-50 to-transparent'
      }`}>
        <div className="max-w-md mx-auto">
          {completed ? (
            <div className={`rounded-2xl p-6 border shadow-sm text-center ${brand.completedBg} ${brand.completedBorder}`}>
              <div className="w-14 h-14 bg-emerald-100 rounded-full mx-auto flex items-center justify-center mb-3">
                <span className="text-2xl">&#10003;</span>
              </div>
              <p className={`text-lg font-semibold ${gender === 'him' ? 'text-white' : 'text-stone-900'}`}>
                {gender === 'him' ? 'Iron sharpened today' : 'Completed for today'}
              </p>
              <p className={`text-sm mt-1 ${gender === 'him' ? 'text-stone-400' : 'text-stone-500'}`}>
                Come back tomorrow for your next devotional
              </p>
            </div>
          ) : (
            <button
              onClick={handleComplete}
              disabled={completing}
              className={`w-full py-5 px-6 bg-gradient-to-r ${brand.ctaGradient} ${brand.ctaHover} disabled:from-stone-300 disabled:to-stone-300 text-white font-semibold text-lg rounded-2xl transition-all duration-200 shadow-lg ${brand.ctaShadow} hover:shadow-xl active:scale-[0.98]`}
            >
              {completing ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>{gender === 'him' ? "Today's iron is forged" : "I've completed today's reading"}</span>
                  <span>&#10003;</span>
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
