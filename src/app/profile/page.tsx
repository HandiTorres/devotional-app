'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import BottomNav from '@/components/bottom-nav'

type UserProfile = {
  email: string | null
  gender: 'him' | 'her' | null
  life_stage: string | null
  current_challenge: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('users')
      .select('email, gender, life_stage, current_challenge')
      .eq('id', user.id)
      .single()

    setProfile(data as UserProfile | null)
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const formatLifeStage = (stage: string | null) => {
    if (!stage) return 'Not set'
    const stages: Record<string, string> = {
      student: 'Student',
      young_adult: 'Young Adult',
      married: 'Married',
      parent: 'Parent',
      empty_nester: 'Empty Nester',
      retired: 'Retired',
    }
    return stages[stage] || stage
  }

  const formatChallenge = (challenge: string | null) => {
    if (!challenge) return 'Not set'
    const challenges: Record<string, string> = {
      anxiety: 'Anxiety & Stress',
      relationships: 'Relationships',
      faith: 'Growing in Faith',
      purpose: 'Finding Purpose',
      grief: 'Grief & Loss',
      health: 'Health Challenges',
    }
    return challenges[challenge] || challenge
  }

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
        <h1 className="text-2xl font-bold text-stone-900">Profile</h1>
        <p className="text-stone-500 mt-1">Manage your account and preferences</p>
      </header>

      <div className="px-6 space-y-6 max-w-lg mx-auto">
        {/* Account Info */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-stone-500">Email</p>
              <p className="text-stone-900">{profile?.email || 'Not available'}</p>
            </div>
          </div>
        </section>

        {/* Personalization */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Personalization</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-stone-100">
              <div>
                <p className="text-sm text-stone-500">Life Stage</p>
                <p className="text-stone-900">{formatLifeStage(profile?.life_stage ?? null)}</p>
              </div>
              <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-stone-100">
              <div>
                <p className="text-sm text-stone-500">Current Focus</p>
                <p className="text-stone-900">{formatChallenge(profile?.current_challenge ?? null)}</p>
              </div>
              <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-stone-900">Notifications</p>
                <p className="text-sm text-stone-500">Daily reminders</p>
              </div>
              <span className="px-2 py-1 bg-stone-100 text-stone-500 text-xs rounded-full">
                Coming Soon
              </span>
            </div>
          </div>
        </section>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full py-4 px-6 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl transition-colors"
        >
          Sign Out
        </button>

        {/* App Version */}
        <p className="text-center text-stone-400 text-sm">
          Daily Bread v1.0
        </p>
      </div>

      <BottomNav />
    </main>
  )
}
