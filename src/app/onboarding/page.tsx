'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Step configuration
const TOTAL_STEPS = 9

const AGE_RANGES = [
  { value: '18-24', label: '18-24' },
  { value: '25-34', label: '25-34' },
  { value: '35-44', label: '35-44' },
  { value: '45-54', label: '45-54' },
  { value: '55+', label: '55+' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const FAITH_BACKGROUNDS = [
  { value: 'new', label: 'New to faith', description: 'Just beginning to explore' },
  { value: 'few_years', label: 'A few years in', description: 'Building my foundation' },
  { value: 'lifelong', label: 'Lifelong believer', description: 'Faith has always been part of my life' },
  { value: 'rediscovering', label: 'Rediscovering faith', description: 'Coming back after time away' },
  { value: 'other', label: 'Other', description: 'My journey is unique' },
]

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

const FAMILY_SITUATIONS = [
  { value: 'single', label: 'Single', icon: '🙋' },
  { value: 'dating', label: 'Dating', icon: '💕' },
  { value: 'engaged', label: 'Engaged', icon: '💍' },
  { value: 'married_no_kids', label: 'Married, No Kids', icon: '👫' },
  { value: 'married_with_kids', label: 'Married with Kids', icon: '👨‍👩‍👧‍👦' },
  { value: 'single_parent', label: 'Single Parent', icon: '💪' },
  { value: 'other', label: 'Other', icon: '🌟' },
]

const PRIMARY_GOALS = [
  { value: 'peace', label: 'Inner peace', description: 'Calm amidst the chaos' },
  { value: 'purpose', label: 'Sense of purpose', description: 'Clarity on my direction' },
  { value: 'discipline', label: 'Stronger discipline', description: 'Building consistent habits' },
  { value: 'closer_to_god', label: 'Closer to God', description: 'Deepening my relationship' },
  { value: 'community', label: 'Community connection', description: 'Feeling less alone' },
  { value: 'other', label: 'Other', description: 'Something else entirely' },
]

const CHARITIES = [
  { value: 'feeding', label: 'Feed hungry families', icon: '🍽️', description: '10 meals per $2.99' },
  { value: 'water', label: 'Provide clean water', icon: '💧', description: 'Clean water for communities' },
  { value: 'bible', label: 'Bible translation', icon: '📖', description: 'Scripture for unreached peoples' },
]

type OnboardingData = {
  gender: 'him' | 'her' | null
  ageRange: string | null
  faithBackground: string | null
  faithBackgroundOther: string
  lifeStage: string | null
  lifeStageOther: string
  challenge: string | null
  challengeOther: string
  familySituation: string | null
  familyOther: string
  primaryGoal: string | null
  primaryGoalOther: string
  personalContext: string
  preferredCharity: string | null
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [data, setData] = useState<OnboardingData>({
    gender: null,
    ageRange: null,
    faithBackground: null,
    faithBackgroundOther: '',
    lifeStage: null,
    lifeStageOther: '',
    challenge: null,
    challengeOther: '',
    familySituation: null,
    familyOther: '',
    primaryGoal: null,
    primaryGoalOther: '',
    personalContext: '',
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

  const completeOnboarding = async () => {
    setLoading(true)
    console.log('Starting onboarding completion...')

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('Auth error:', authError)
        setLoading(false)
        return
      }
      if (!user) {
        console.log('No user found, redirecting to home')
        router.push('/')
        return
      }

      console.log('User found:', user.id)

      const payload = {
        id: user.id,
        email: user.email,
        gender: data.gender,
        age_range: data.ageRange,
        faith_background: data.faithBackground,
        faith_background_other: data.faithBackground === 'other' ? data.faithBackgroundOther : null,
        life_stage: data.lifeStage,
        life_stage_other: data.lifeStage === 'other' ? data.lifeStageOther : null,
        current_challenge: data.challenge,
        challenge_other: data.challenge === 'other' ? data.challengeOther : null,
        family_situation: data.familySituation,
        family_other: data.familySituation === 'other' ? data.familyOther : null,
        primary_goal: data.primaryGoal,
        primary_goal_other: data.primaryGoal === 'other' ? data.primaryGoalOther : null,
        personal_context: data.personalContext || null,
        preferred_charity: data.preferredCharity,
        onboarding_complete: true,
      }

      console.log('Saving user profile...')
      const { error: upsertError } = await supabase
        .from('users')
        .upsert(payload as never, { onConflict: 'id' })

      if (upsertError) {
        console.error('Failed to save profile:', upsertError)
        setLoading(false)
        return
      }

      console.log('Profile saved successfully')

      // Ensure streak row exists
      console.log('Creating streak row...')
      const { error: streakError } = await supabase
        .from('streaks')
        .upsert({ user_id: user.id } as never, { onConflict: 'user_id' })

      if (streakError) {
        console.error('Failed to create streak:', streakError)
        // Continue anyway - streak will be created when they complete first devotional
      }

      console.log('Onboarding complete, redirecting to home...')
      // Redirect to home (not devotional) to avoid triggering slow AI generation
      router.push('/home')
    } catch (err) {
      console.error('Unexpected error during onboarding:', err)
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

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 flex items-center justify-center px-8">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <h2 className="text-2xl font-semibold text-stone-800 mb-2">Creating your experience</h2>
            <p className="text-stone-500">Personalizing your daily devotionals...</p>
          </div>
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
                  <span className="text-4xl mb-4 block">👨</span>
                  <span className="text-2xl font-semibold text-stone-900 block mb-2 group-hover:text-amber-700 transition-colors">For Him</span>
                  <span className="text-stone-500 leading-relaxed">Devotionals crafted for men navigating work, purpose, and faith</span>
                </button>

                <button
                  onClick={() => handleGenderSelect('her')}
                  className="w-full p-8 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-white hover:border-amber-300 hover:shadow-md transition-all duration-200 text-left group"
                >
                  <span className="text-4xl mb-4 block">👩</span>
                  <span className="text-2xl font-semibold text-stone-900 block mb-2 group-hover:text-amber-700 transition-colors">For Her</span>
                  <span className="text-stone-500 leading-relaxed">Devotionals crafted for women balancing life, identity, and faith</span>
                </button>
              </div>

              {/* Privacy Notice */}
              <div className="mt-8 flex items-start gap-3 p-4 rounded-xl bg-stone-100/50">
                <span className="text-stone-400 mt-0.5">🔒</span>
                <p className="text-sm text-stone-500 leading-relaxed">
                  Your responses are private and only used to personalize your experience. We never sell or share your personal information.
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Age Range */}
          {step === 1 && (
            <div className="flex-1 flex flex-col animate-fade-in">
              <div className="text-center mb-10 pt-4">
                <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-3">
                  How old are you?
                </h1>
                <p className="text-lg text-stone-500 leading-relaxed">
                  This helps us speak to your season of life
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {AGE_RANGES.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleOptionSelect('ageRange', option.value)}
                    className={`p-5 rounded-2xl border-2 transition-all duration-200 text-center ${
                      data.ageRange === option.value
                        ? 'border-amber-500 bg-amber-50 shadow-sm'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                    }`}
                  >
                    <span className="text-lg font-medium text-stone-800">{option.label}</span>
                  </button>
                ))}
              </div>

              <NavigationButtons onBack={prevStep} showSkip onSkip={nextStep} />
            </div>
          )}

          {/* Step 2: Faith Background */}
          {step === 2 && (
            <div className="flex-1 flex flex-col animate-fade-in">
              <div className="text-center mb-10 pt-4">
                <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-3">
                  Where are you in your faith journey?
                </h1>
                <p className="text-lg text-stone-500 leading-relaxed">
                  We&apos;ll meet you right where you are
                </p>
              </div>

              <div className="space-y-3">
                {FAITH_BACKGROUNDS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleOptionSelect('faithBackground', option.value, true)}
                    className={`w-full p-5 rounded-2xl border-2 transition-all duration-200 text-left ${
                      data.faithBackground === option.value
                        ? 'border-amber-500 bg-amber-50 shadow-sm'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                    }`}
                  >
                    <span className="text-lg font-medium text-stone-800 block">{option.label}</span>
                    <span className="text-stone-500 text-sm">{option.description}</span>
                  </button>
                ))}
              </div>

              {/* Other text input */}
              {data.faithBackground === 'other' && (
                <div className="mt-4 animate-fade-in">
                  <textarea
                    value={data.faithBackgroundOther}
                    onChange={(e) => updateData('faithBackgroundOther', e.target.value)}
                    placeholder="Tell us more about your journey..."
                    className="w-full p-4 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-0 outline-none transition-colors resize-none text-stone-800 placeholder-stone-400"
                    rows={3}
                  />
                  <button
                    onClick={nextStep}
                    disabled={!data.faithBackgroundOther.trim()}
                    className="mt-3 w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold transition-all duration-200"
                  >
                    Continue
                  </button>
                </div>
              )}

              <NavigationButtons onBack={prevStep} showSkip onSkip={nextStep} />
            </div>
          )}

          {/* Step 3: Life Stage */}
          {step === 3 && (
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

              {/* Other text input */}
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

          {/* Step 4: Current Challenge */}
          {step === 4 && (
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

              {/* Other text input */}
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

          {/* Step 5: Family Situation */}
          {step === 5 && (
            <div className="flex-1 flex flex-col animate-fade-in">
              <div className="text-center mb-10 pt-4">
                <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-3">
                  What&apos;s your family situation?
                </h1>
                <p className="text-lg text-stone-500 leading-relaxed">
                  So your devotionals feel relevant to your life
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {FAMILY_SITUATIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleOptionSelect('familySituation', option.value, true)}
                    className={`p-5 rounded-2xl border-2 transition-all duration-200 text-left ${
                      data.familySituation === option.value
                        ? 'border-amber-500 bg-amber-50 shadow-sm'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{option.icon}</span>
                    <span className="font-medium text-stone-800">{option.label}</span>
                  </button>
                ))}
              </div>

              {/* Other text input */}
              {data.familySituation === 'other' && (
                <div className="mt-4 animate-fade-in">
                  <textarea
                    value={data.familyOther}
                    onChange={(e) => updateData('familyOther', e.target.value)}
                    placeholder="Tell us about your situation..."
                    className="w-full p-4 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-0 outline-none transition-colors resize-none text-stone-800 placeholder-stone-400"
                    rows={3}
                  />
                  <button
                    onClick={nextStep}
                    disabled={!data.familyOther.trim()}
                    className="mt-3 w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold transition-all duration-200"
                  >
                    Continue
                  </button>
                </div>
              )}

              <NavigationButtons onBack={prevStep} showSkip onSkip={nextStep} />
            </div>
          )}

          {/* Step 6: Primary Goal */}
          {step === 6 && (
            <div className="flex-1 flex flex-col animate-fade-in">
              <div className="text-center mb-10 pt-4">
                <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-3">
                  What do you most want from this?
                </h1>
                <p className="text-lg text-stone-500 leading-relaxed">
                  Your primary intention guides everything
                </p>
              </div>

              <div className="space-y-3">
                {PRIMARY_GOALS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleOptionSelect('primaryGoal', option.value, true)}
                    className={`w-full p-5 rounded-2xl border-2 transition-all duration-200 text-left ${
                      data.primaryGoal === option.value
                        ? 'border-amber-500 bg-amber-50 shadow-sm'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                    }`}
                  >
                    <span className="text-lg font-medium text-stone-800 block">{option.label}</span>
                    <span className="text-stone-500 text-sm">{option.description}</span>
                  </button>
                ))}
              </div>

              {/* Other text input */}
              {data.primaryGoal === 'other' && (
                <div className="mt-4 animate-fade-in">
                  <textarea
                    value={data.primaryGoalOther}
                    onChange={(e) => updateData('primaryGoalOther', e.target.value)}
                    placeholder="What are you hoping for?"
                    className="w-full p-4 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-0 outline-none transition-colors resize-none text-stone-800 placeholder-stone-400"
                    rows={3}
                  />
                  <button
                    onClick={nextStep}
                    disabled={!data.primaryGoalOther.trim()}
                    className="mt-3 w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold transition-all duration-200"
                  >
                    Continue
                  </button>
                </div>
              )}

              <NavigationButtons onBack={prevStep} showSkip onSkip={nextStep} />
            </div>
          )}

          {/* Step 7: Personal Context (Free-form) */}
          {step === 7 && (
            <div className="flex-1 flex flex-col animate-fade-in">
              <div className="text-center mb-8 pt-4">
                <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-3">
                  Anything else we should know?
                </h1>
                <p className="text-lg text-stone-500 leading-relaxed">
                  The more we know, the more personal your daily experience becomes
                </p>
              </div>

              <div className="flex-1">
                <textarea
                  value={data.personalContext}
                  onChange={(e) => updateData('personalContext', e.target.value)}
                  placeholder="Share whatever feels important — your hopes, struggles, what you're walking through right now, what brings you joy..."
                  className="w-full h-48 p-5 rounded-2xl border-2 border-stone-200 focus:border-amber-500 focus:ring-0 outline-none transition-colors resize-none text-stone-800 placeholder-stone-400 text-lg leading-relaxed"
                />

                <div className="mt-4 flex items-start gap-2 text-sm text-stone-400">
                  <span>🔒</span>
                  <p>This stays between you and God (and the AI that helps write your devotionals)</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={nextStep}
                  className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-all duration-200"
                >
                  Continue
                </button>
                <button
                  onClick={nextStep}
                  className="w-full py-3 text-stone-400 hover:text-stone-600 font-medium transition-colors"
                >
                  Skip for now
                </button>
              </div>

              <NavigationButtons onBack={prevStep} />
            </div>
          )}

          {/* Step 8: Preferred Charity */}
          {step === 8 && (
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
                      setTimeout(completeOnboarding, 200)
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

// Navigation buttons component
function NavigationButtons({
  onBack,
  showSkip = false,
  onSkip,
  skipLabel = "Skip for now"
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
