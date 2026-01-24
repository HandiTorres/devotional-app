'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import BottomNav from '@/components/bottom-nav'

type ImpactData = {
  currentStreak: number
  longestStreak: number
  totalExtensions: number
  totalDonations: number
  monthlyDonations: { month: string; amount: number }[]
}

export default function ImpactPage() {
  const [data, setData] = useState<ImpactData | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadImpactData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadImpactData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    type StreakRow = {
      current_streak: number
      longest_streak: number
      total_extensions: number
    }

    type DonationRow = {
      amount_cents: number
      created_at: string
    }

    // Get streak data
    const { data: streakRaw } = await supabase
      .from('streaks')
      .select('current_streak, longest_streak, total_extensions')
      .eq('user_id', user.id)
      .single()

    const streak = streakRaw as StreakRow | null

    // Get all donations
    const { data: donationsRaw } = await supabase
      .from('donations')
      .select('amount_cents, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const donations = donationsRaw as DonationRow[] | null

    // Calculate monthly breakdown
    const monthlyMap = new Map<string, number>()
    let totalDonations = 0

    donations?.forEach((donation) => {
      totalDonations += donation.amount_cents
      const date = new Date(donation.created_at)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + donation.amount_cents)
    })

    const monthlyDonations = Array.from(monthlyMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .slice(0, 6) // Last 6 months

    setData({
      currentStreak: streak?.current_streak || 0,
      longestStreak: streak?.longest_streak || 0,
      totalExtensions: streak?.total_extensions || 0,
      totalDonations,
      monthlyDonations,
    })
    setLoading(false)
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  const mealsProvided = (data?.totalExtensions || 0) * 10

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 pb-24">
      {/* Header */}
      <header className="px-6 py-4 flex items-center gap-4">
        <Link
          href="/devotional"
          className="p-2 -ml-2 text-stone-500 hover:text-stone-700 text-xl"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold text-stone-900">Your Impact</h1>
      </header>

      <div className="px-6 space-y-6 max-w-lg mx-auto">
        {/* Hero Stats */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-amber-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-4xl">🔥</span>
            </div>
            <p className="text-5xl font-bold text-stone-900 mb-1">
              {data?.currentStreak || 0}
            </p>
            <p className="text-stone-500">day streak</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-900">{data?.longestStreak || 0}</p>
              <p className="text-stone-500 text-sm">longest streak</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-900">{data?.totalExtensions || 0}</p>
              <p className="text-stone-500 text-sm">extensions</p>
            </div>
          </div>
        </section>

        {/* Meals Impact */}
        <section className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🍽️</span>
            </div>
            <div>
              <p className="text-amber-100 text-sm mb-1">Your consistency has provided</p>
              <p className="text-3xl font-bold mb-1">{mealsProvided} meals</p>
              <p className="text-amber-100 text-sm">to families in need</p>
            </div>
          </div>
        </section>

        {/* Total Giving */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Total Giving</h2>
          <p className="text-4xl font-bold text-stone-900 mb-1">
            {formatCurrency(data?.totalDonations || 0)}
          </p>
          <p className="text-stone-500 text-sm">100% goes to charity</p>
        </section>

        {/* Monthly Breakdown */}
        {data?.monthlyDonations && data.monthlyDonations.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Monthly Summary</h2>
            <div className="space-y-3">
              {data.monthlyDonations.map((item) => (
                <div key={item.month} className="flex items-center justify-between">
                  <span className="text-stone-600">{item.month}</span>
                  <span className="font-medium text-stone-900">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {(!data?.monthlyDonations || data.monthlyDonations.length === 0) && (
          <section className="bg-stone-50 rounded-2xl p-6 text-center">
            <p className="text-stone-500 mb-2">No donations yet</p>
            <p className="text-stone-400 text-sm">
              When you extend your streak, 100% of your $2.99 feeds families in need.
            </p>
          </section>
        )}

        {/* Back to Devotional */}
        <Link
          href="/devotional"
          className="block w-full py-4 px-6 bg-stone-800 hover:bg-stone-900 text-white font-semibold rounded-xl transition-colors text-center"
        >
          Back to Today&apos;s Devotional
        </Link>
      </div>

      <BottomNav />
    </main>
  )
}
