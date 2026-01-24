'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function SignupContent() {
  const searchParams = useSearchParams()
  const gender = searchParams.get('gender') as 'him' | 'her' | null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?gender=${gender}`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setEmailSent(true)
      setLoading(false)
    }
  }

  // Redirect if no gender selected
  if (!gender) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-2xl font-bold text-stone-900">Choose Your Path</h1>
          <p className="text-stone-600">Select how you&apos;d like to receive your devotionals</p>
          <div className="space-y-3">
            <Link
              href="/signup?gender=him"
              className="block w-full py-4 px-6 bg-stone-800 hover:bg-stone-900 text-white font-semibold rounded-xl transition-colors"
            >
              Start as Him
            </Link>
            <Link
              href="/signup?gender=her"
              className="block w-full py-4 px-6 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors"
            >
              Start as Her
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Email sent confirmation
  if (emailSent) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
            <span className="text-3xl">✉️</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Check Your Email</h1>
          <p className="text-stone-600">
            We&apos;ve sent a confirmation link to <span className="font-medium">{email}</span>
          </p>
          <p className="text-stone-500 text-sm">
            Click the link in the email to complete your signup and start your journey.
          </p>
        </div>
      </main>
    )
  }

  const isHim = gender === 'him'

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="text-stone-400 hover:text-stone-600 text-sm inline-flex items-center gap-1">
            <span>←</span>
            Back
          </Link>
          <h1 className="text-3xl font-bold text-stone-900">Create Account</h1>
          <p className="text-stone-600">
            {isHim ? 'Direct, action-focused devotionals for men' : 'Warm, reflective devotionals for women'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-stone-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-stone-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 font-semibold rounded-xl transition-colors text-white ${
              isHim
                ? 'bg-stone-800 hover:bg-stone-900 disabled:bg-stone-400'
                : 'bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300'
            }`}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Switch gender */}
        <p className="text-center text-stone-500 text-sm">
          Want{' '}
          <Link
            href={`/signup?gender=${isHim ? 'her' : 'him'}`}
            className="text-amber-700 font-medium hover:underline"
          >
            {isHim ? 'Her' : 'Him'}
          </Link>
          {' '}devotionals instead?
        </p>

        {/* Login link */}
        <p className="text-center text-stone-500">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-700 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <SignupContent />
    </Suspense>
  )
}
