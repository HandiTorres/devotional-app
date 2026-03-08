'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import BottomNav from '@/components/bottom-nav'
import { useDarkMode } from '@/components/dark-mode-provider'

type UserProfile = {
  email: string | null
  gender: 'him' | 'her' | null
  life_stage: string | null
  current_challenge: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const router = useRouter()
  const { isDark, toggle: toggleDark } = useDarkMode()

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
      .maybeSingle()

    setProfile(data as UserProfile | null)
    setLoading(false)
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const formatValue = (value: string | null, type: string): string => {
    if (!value) return 'Not set'

    const mappings: Record<string, Record<string, string>> = {
      gender: {
        him: 'The Forge',
        her: 'The Garden',
      },
      life_stage: {
        'student': 'Student',
        'early_career': 'Early Career',
        'building_career': 'Building Career',
        'married': 'Married',
        'parent': 'Parent',
        'empty_nest': 'Empty Nest',
        'retired': 'Retired',
        'other': 'Other',
      },
      current_challenge: {
        'work_stress': 'Work Stress',
        'relationship': 'Relationships',
        'health': 'Health',
        'purpose': 'Finding Purpose',
        'anxiety': 'Anxiety & Worry',
        'faith_doubts': 'Faith Questions',
        'grief': 'Grief & Loss',
        'other': 'Other',
      },
    }

    return mappings[type]?.[value] || value
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 pb-28">
      {/* Header */}
      <header className="px-8 pt-12 pb-8">
        <h1 className="text-3xl font-bold text-stone-900 dark:text-white tracking-tight">Profile</h1>
        <p className="text-lg text-stone-500 dark:text-stone-400 mt-1">Manage your account and preferences</p>
      </header>

      <div className="px-8 space-y-6 max-w-lg mx-auto">
        {/* Account Card */}
        <section className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm border border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">{profile?.gender === 'her' ? '👩' : '👨'}</span>
            </div>
            <div>
              <p className="font-semibold text-stone-900 dark:text-white text-lg">{profile?.email?.split('@')[0] || 'User'}</p>
              <p className="text-stone-500 dark:text-stone-400 text-sm">{profile?.email}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 dark:border-stone-700">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Account</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-stone-600 dark:text-stone-400">Email</span>
                <span className="text-stone-900 dark:text-white font-medium">{profile?.email || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-stone-600 dark:text-stone-400">Track</span>
                <span className="text-stone-900 dark:text-white font-medium">{formatValue(profile?.gender ?? null, 'gender')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Personalization Card */}
        <section className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm border border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Personalization</p>
            <span className="text-amber-600 text-sm font-medium">Edit coming soon</span>
          </div>

          <div className="space-y-4">
            <ProfileRow label="Life Stage" value={formatValue(profile?.life_stage ?? null, 'life_stage')} />
            <ProfileRow label="Current Focus" value={formatValue(profile?.current_challenge ?? null, 'current_challenge')} />
          </div>
        </section>

        {/* Preferences Card */}
        <section className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm border border-stone-200 dark:border-stone-700">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">Preferences</p>

          <div className="space-y-4">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-stone-900 dark:text-white">Dark Mode</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">Switch appearance</p>
              </div>
              <button
                onClick={toggleDark}
                className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
                  isDark ? 'bg-amber-500' : 'bg-stone-300'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${
                  isDark ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-stone-900 dark:text-white">Daily Reminders</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">Get notified to read</p>
              </div>
              <span className="px-3 py-1 bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 text-xs font-medium rounded-full">
                Coming Soon
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-stone-900 dark:text-white">Reading Time</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">Preferred time of day</p>
              </div>
              <span className="px-3 py-1 bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 text-xs font-medium rounded-full">
                Coming Soon
              </span>
            </div>
          </div>
        </section>

        {/* Support Card */}
        <section className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm border border-stone-200 dark:border-stone-700">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">Support</p>

          <div className="space-y-2">
            <button className="w-full flex items-center justify-between py-3 text-left hover:bg-stone-50 dark:hover:bg-stone-700 -mx-2 px-2 rounded-xl transition-colors">
              <span className="font-medium text-stone-900 dark:text-white">Help & FAQ</span>
              <span className="text-stone-400">→</span>
            </button>

            <button className="w-full flex items-center justify-between py-3 text-left hover:bg-stone-50 dark:hover:bg-stone-700 -mx-2 px-2 rounded-xl transition-colors">
              <span className="font-medium text-stone-900 dark:text-white">Privacy Policy</span>
              <span className="text-stone-400">→</span>
            </button>

            <button className="w-full flex items-center justify-between py-3 text-left hover:bg-stone-50 dark:hover:bg-stone-700 -mx-2 px-2 rounded-xl transition-colors">
              <span className="font-medium text-stone-900 dark:text-white">Terms of Service</span>
              <span className="text-stone-400">→</span>
            </button>
          </div>
        </section>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full py-4 px-6 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 disabled:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 dark:active:bg-stone-600 text-stone-700 dark:text-stone-300 font-semibold rounded-2xl transition-all duration-200"
        >
          {signingOut ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
              Signing out...
            </span>
          ) : (
            'Sign Out'
          )}
        </button>

        {/* App Version */}
        <div className="text-center py-4">
          <p className="text-stone-400 text-sm">Daily Bread v1.0</p>
          <p className="text-stone-300 dark:text-stone-600 text-xs mt-1">Made with love for your daily walk</p>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-700 last:border-0">
      <span className="text-stone-600 dark:text-stone-400">{label}</span>
      <span className="text-stone-900 dark:text-white font-medium">{value}</span>
    </div>
  )
}
