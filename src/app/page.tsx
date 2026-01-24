import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-100 flex flex-col items-center justify-center">
      <div className="max-w-md mx-auto px-8 text-center">
        {/* Icon */}
        <div className="text-6xl mb-6">📖</div>

        {/* App Name */}
        <h1 className="text-4xl font-bold tracking-tight text-stone-800">
          Daily Bread
        </h1>

        {/* Tagline */}
        <p className="text-lg text-stone-600 mt-2">
          Nourish your soul, every morning
        </p>

        {/* Subtitle */}
        <p className="text-stone-500 mt-1">
          Daily Scripture, Personalized For You
        </p>

        {/* Buttons */}
        <div className="mt-12 flex flex-col gap-4">
          <Link
            href="/signup?gender=him"
            className="w-full py-4 bg-stone-800 text-white font-semibold rounded-2xl hover:bg-stone-900 transition-all shadow-md"
          >
            Start as Him
          </Link>
          <Link
            href="/signup?gender=her"
            className="w-full py-4 bg-amber-600 text-white font-semibold rounded-2xl hover:bg-amber-700 transition-all shadow-md"
          >
            Start as Her
          </Link>
        </div>

        {/* Sign In Link */}
        <p className="mt-8 text-stone-500">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-700 hover:underline">
            Sign in
          </Link>
        </p>

        {/* Social Proof */}
        <p className="text-sm text-stone-400 mt-6">
          Join 10,000+ believers growing in faith daily
        </p>
      </div>
    </main>
  )
}
