'use client'

import { useState } from 'react'

type CharityType = 'feeding' | 'water' | 'bible' | null

type StreakModalProps = {
  currentStreak: number
  preferredCharity: CharityType
  onStartFresh: () => void
  onDismiss: () => void
}

const CHARITY_MESSAGES: Record<string, string> = {
  feeding: 'Your $2.99 provides 10 meals for families in need',
  water: 'Your $2.99 provides clean water for one person for a month',
  bible: "Your $2.99 helps translate Scripture for people who've never had it",
}

export default function StreakModal({
  currentStreak,
  preferredCharity,
  onStartFresh,
  onDismiss,
}: StreakModalProps) {
  const [loading, setLoading] = useState(false)
  const [resetting, setResetting] = useState(false)

  const charityMessage = preferredCharity
    ? CHARITY_MESSAGES[preferredCharity]
    : 'Your $2.99 goes 100% to charity'

  const handleExtend = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout session')
      window.location.href = data.url
    } catch (error) {
      console.error('Checkout error:', error)
      setLoading(false)
    }
  }

  const handleStartFresh = async () => {
    setResetting(true)
    try {
      const response = await fetch('/api/streak/reset', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to reset streak')
      onStartFresh()
    } catch (error) {
      console.error('Reset error:', error)
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onDismiss} />

      <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <div className="w-16 h-16 bg-amber-100 rounded-full mx-auto flex items-center justify-center mb-4">
          <span className="text-3xl">🔥</span>
        </div>

        <div className="text-center mb-6">
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-wide mb-2">Streak at risk</p>
          <p className="text-3xl font-bold text-stone-900 mb-1">{currentStreak}-day streak</p>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-stone-900 mb-2">
            You missed yesterday, but your impact doesn&apos;t have to stop
          </h2>
          <p className="text-stone-600">{charityMessage}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleExtend}
            disabled={loading}
            className="w-full py-4 px-6 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-semibold rounded-xl transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Redirecting...
              </span>
            ) : (
              'Extend My Impact'
            )}
          </button>

          <button
            onClick={handleStartFresh}
            disabled={resetting}
            className="w-full py-3 px-6 text-stone-500 hover:text-stone-700 font-medium transition-colors"
          >
            {resetting ? 'Resetting...' : 'Start Fresh'}
          </button>
        </div>

        <p className="text-center text-stone-400 text-xs mt-4">
          Secure payment via Stripe. 100% goes to charity.
        </p>
      </div>
    </div>
  )
}
