import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        <div className="max-w-md w-full text-center space-y-10 animate-fade-in">
          {/* Logo/Brand */}
          <div className="space-y-6">
            {/* Premium Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-amber-200/50">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-stone-900 tracking-tight">
                Daily Bread
              </h1>
              <p className="text-lg text-stone-500">
                Nourish your soul, every morning
              </p>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="space-y-4">
            <p className="text-xl text-stone-700 font-medium leading-relaxed">
              Daily Scripture, Personalized For You
            </p>
            <p className="text-stone-500 leading-relaxed">
              Start each day with a devotional crafted specifically for your journey, your challenges, and your growth.
            </p>
          </div>

          {/* Gender Selection CTAs */}
          <div className="space-y-4 pt-2">
            <Link
              href="/signup?gender=him"
              className="block w-full py-5 px-6 bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-stone-950 text-white font-semibold rounded-2xl transition-all duration-200 text-lg shadow-lg shadow-stone-300/50 hover:shadow-xl hover:shadow-stone-300/50 active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-3">
                <span className="text-2xl">👨</span>
                <span>Start as Him</span>
              </span>
            </Link>
            <Link
              href="/signup?gender=her"
              className="block w-full py-5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-2xl transition-all duration-200 text-lg shadow-lg shadow-amber-200/50 hover:shadow-xl hover:shadow-amber-200/50 active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-3">
                <span className="text-2xl">👩</span>
                <span>Start as Her</span>
              </span>
            </Link>
          </div>

          {/* Login Link */}
          <p className="text-stone-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-amber-700 font-semibold hover:text-amber-800 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Social Proof */}
      <div className="py-10 px-8 text-center">
        <div className="max-w-md mx-auto">
          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-stone-600 font-medium">
            Join <span className="font-bold text-stone-800">10,000+</span> believers
          </p>
          <p className="text-stone-400 text-sm mt-1">
            Growing in faith daily
          </p>
        </div>
      </div>
    </main>
  )
}
