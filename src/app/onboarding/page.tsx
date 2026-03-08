'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

const TOTAL_STEPS = 4

const LIFE_STAGES = [
  { value: 'student', label: 'Student', icon: '📚' },
  { value: 'early_career', label: 'Early Career', icon: '💼' },
  { value: 'building_career', label: 'Building Career', icon: '📈' },
  { value: 'married', label: 'Married', icon: '💑' },
  { value: 'parent', label: 'Parent', icon: '👨‍👩‍👧' },
  { value: 'empty_nest', label: 'Empty Nest', icon: '🏡' },
  { value: 'retired', label: 'Retired', icon: '🌅' },
  { value: 'other', label: 'Other', icon: '✨' },
]

const CHALLENGES = [
  { value: 'work_stress', label: 'Work Stress', icon: '😤' },
  { value: 'relationship', label: 'Relationships', icon: '💔' },
  { value: 'health', label: 'Health', icon: '🏥' },
  { value: 'purpose', label: 'Finding Purpose', icon: '🧭' },
  { value: 'anxiety', label: 'Anxiety & Worry', icon: '😰' },
  { value: 'faith_doubts', label: 'Faith Questions', icon: '🤔' },
  { value: 'grief', label: 'Grief & Loss', icon: '💙' },
  { value: 'other', label: 'Other', icon: '💭' },
]

const CHARITIES = [
  { value: 'feeding', label: 'Feed hungry families', icon: '🍽️', description: '10 meals per $2.99' },
  { value: 'water', label: 'Provide clean water', icon: '💧', description: 'Clean water for communities' },
  { value: 'bible', label: 'Bible translation', icon: '📖', description: 'Scripture for unreached peoples' },
]

type OnboardingData = {
  gender: 'him' | 'her' | null
  lifeStage: string | null
  lifeStageOther: string
  challenge: string | null
  challengeOther: string
  preferredCharity: string | null
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [data, setData] = useState<OnboardingData>({
    gender: null,
    lifeStage: null,
    lifeStageOther: '',
    challenge: null,
    challengeOther: '',
    preferredCharity: null,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const updateData = (field: keyof OnboardingData, value: string | null) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, TOTAL_STEPS - 1))
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 0))
  }

  const handleGenderSelect = (value: 'him' | 'her') => {
    updateData('gender', value)
    nextStep()
  }

  const handleOptionSelect = (field: keyof OnboardingData, value: string, hasOther: boolean = false) => {
    updateData(field, value)
    if (value !== 'other' || !hasOther) {
      setTimeout(nextStep, 150)
    }
  }

  const completeOnboarding = async (overrides?: Partial<OnboardingData>) => {
    const current = { ...data, ...overrides }

    setLoading(true)
    setError(null)

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        setError('No user found. Please log in again.')
        setLoading(false)
        return
      }

      const payload: Database['public']['Tables']['users']['Update'] = {
        email: user.email ?? null,
        gender: current.gender,
        onboarding_complete: true,
        life_stage: current.lifeStage || null,
        current_challenge: current.challenge || null,
        preferred_charity: current.preferredCharity || null,
        life_stage_other: current.lifeStage === 'other' ? current.lifeStageOther : null,
        challenge_other: current.challenge === 'other' ? current.challengeOther : null,
      }

      const { error: updateError } = await supabase
        .from('users')
        .update(payload as never)
        .eq('id', user.id)

      if (updateError) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({ id: user.id, ...payload } as never)

        if (insertError) {
          setError(`Failed to save profile: ${insertError.message}`)
          setLoading(false)
          return
        }
      }

      router.push('/home')
    } catch (err) {
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  if (loading || error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 flex items-center justify-center px-8">
        <div className="text-center space-y-6 max-w-md">
          {error ? (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center">
                <span className="text-3xl">!</span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-stone-800 mb-2">Something went wrong</h2>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button
                  onClick={() => { setError(null); setLoading(false) }}
                  className="px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h2 className="text-2xl font-semibold text-stone-800 mb-2">Creating your experience</h2>
                <p className="text-stone-500">Personalizing your daily devotionals...</p>
              </div>
            </>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 flex flex-col">
      {/* Progress Bar */}
      <div className="px-8 pt-8 pb-4">
        <div className="max-w-md mx-auto">
          <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          <p className="text-xs text-stone-400 mt-2 text-center">
            {step + 1} of {TOTAL_STEPS}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-8 pb-8">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col">

          {/* Step 0: Gender */}
          {step === 0 && (
            <div className="flex-1 flex flex-col animate-fade-in">
              <div className="text-center mb-10 pt-4">
                <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-3">
                  Start your journey
                </h1>
                <p className="text-lg text-stone-500 leading-relaxed">
                  Personalize your daily devotional experience
                </p>
              </div>

              <div className="space-y-4 flex-1">
                <button
                  onClick={() => handleGenderSelect('him')}
                  className="w-full p-8 rounded-2xl border border-stone-200 bg-white hover:border-stone-300 hover:shadow-md transition-all duration-200 text-left group"
                >
                  <span className="text-4xl mb-4 block">⚒️</span>
                  <span className="text-2xl font-semibold text-stone-900 block mb-2 group-hover:text-amber-700 transition-colors">The Forge</span>
                  <span className="text-stone-500 leading-relaxed">Devotionals crafted for men navigating work, purpose, and faith</span>
                </button>

                <button
                  onClick={() => handleGenderSelect('her')}
                  className="w-full p-8 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-white hover:border-amber-300 hover:shadow-md transition-all duration-200 text-left group"
                >
                  <span className="text-4xl mb-4 block">🌿</span>
                  <span className="text-2xl font-semibold text-stone-900 block mb-2 group-hover:text-amber-700 transition-colors">The Garden</span>
                  <span className="text-stone-500 leading-relaxed">Devotionals crafted for women balancing life, identity, and faith</span>
                </button>
              </div>

              <div className="mt-8 flex items-start gap-3 p-4 rounded-xl bg-stone-100/50">
                <span className="text-stone-400 mt-0.5">🔒</span>
                <p className="text-sm text-stone-500 leading-relaxed">
                  Your responses are private and only used to personalize your experience.
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Life Stage */}
          {step === 1 && (
            <div className="flex-1 flex flex-col animate-fade-in">
              <div className="text-center mb-10 pt-4">
                <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-3">
                  What season of life are you in?
                </h1>
                <p className="text-lg text-stone-500 leading-relaxed">
                  Your devotionals will reflect your context
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {LIFE_STAGES.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleOptionSelect('lifeStage', option.value, true)}
                    className={`p-5 rounded-2xl border-2 transition-all duration-200 text-left ${
                      data.lifeStage === option.value
                        ? 'border-amber-500 bg-amber-50 shadow-sm'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{option.icon}</span>
                    <span className="font-medium text-stone-800">{option.label}</span>
                  </button>
                ))}
              </div>

              {data.lifeStage === 'other' && (
                <div className="mt-4 animate-fade-in">
                  <textarea
                    value={data.lifeStageOther}
                    onChange={(e) => updateData('lifeStageOther', e.target.value)}
                    placeholder="Describe your current season..."
                    className="w-full p-4 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-0 outline-none transition-colors resize-none text-stone-800 placeholder-stone-400"
                    rows={3}
                  />
                  <button
                    onClick={nextStep}
                    disabled={!data.lifeStageOther.trim()}
                    className="mt-3 w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold transition-all duration-200"
                  >
                    Continue
                  </button>
                </div>
              )}

              <NavigationButtons onBack={prevStep} showSkip onSkip={nextStep} />
            </div>
          )}

          {/* Step 2: Current Challenge */}
          {step === 2 && (
            <div className="flex-1 flex flex-col animate-fade-in">
              <div className="text-center mb-10 pt-4">
                <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-3">
                  What&apos;s weighing on you most?
                </h1>
                <p className="text-lg text-stone-500 leading-relaxed">
                  We&apos;ll focus on Scripture that speaks to this
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {CHALLENGES.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleOptionSelect('challenge', option.value, true)}
                    className={`p-5 rounded-2xl border-2 transition-all duration-200 text-left ${
                      data.challenge === option.value
                        ? 'border-amber-500 bg-amber-50 shadow-sm'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{option.icon}</span>
                    <span className="font-medium text-stone-800">{option.label}</span>
                  </button>
                ))}
              </div>

              {data.challenge === 'other' && (
                <div className="mt-4 animate-fade-in">
                  <textarea
                    value={data.challengeOther}
                    onChange={(e) => updateData('challengeOther', e.target.value)}
                    placeholder="What's on your heart?"
                    className="w-full p-4 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-0 outline-none transition-colors resize-none text-stone-800 placeholder-stone-400"
                    rows={3}
                  />
                  <button
                    onClick={nextStep}
                    disabled={!data.challengeOther.trim()}
                    className="mt-3 w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold transition-all duration-200"
                  >
                    Continue
                  </button>
                </div>
              )}

              <NavigationButtons onBack={prevStep} showSkip onSkip={nextStep} />
            </div>
          )}

          {/* Step 3: Preferred Charity */}
          {step === 3 && (
            <div className="flex-1 flex flex-col animate-fade-in">
              <div className="text-center mb-10 pt-4">
                <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-3">
                  When you give, where should it go?
                </h1>
                <p className="text-lg text-stone-500 leading-relaxed">
                  When you extend your streak, 100% goes to charity
                </p>
              </div>

              <div className="space-y-3 flex-1">
                {CHARITIES.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      updateData('preferredCharity', option.value)
                      setTimeout(() => completeOnboarding({ preferredCharity: option.value }), 200)
                    }}
                    className={`w-full p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
                      data.preferredCharity === option.value
                        ? 'border-amber-500 bg-amber-50 shadow-sm'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{option.icon}</span>
                      <div>
                        <span className="text-lg font-medium text-stone-800 block">{option.label}</span>
                        <span className="text-stone-500">{option.description}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <NavigationButtons onBack={prevStep} showSkip onSkip={completeOnboarding} skipLabel="Skip & finish" />
            </div>
          )}

        </div>
      </div>
    </main>
  )
}

function NavigationButtons({
  onBack,
  showSkip = false,
  onSkip,
  skipLabel = 'Skip for now',
}: {
  onBack?: () => void
  showSkip?: boolean
  onSkip?: () => void
  skipLabel?: string
}) {
  return (
    <div className="mt-auto pt-6 flex items-center justify-between">
      {onBack ? (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors py-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back</span>
        </button>
      ) : <div />}

      {showSkip && onSkip && (
        <button
          onClick={onSkip}
          className="text-stone-400 hover:text-stone-600 font-medium py-2 transition-colors"
        >
          {skipLabel}
        </button>
      )}
    </div>
  )
}
