import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50 to-stone-100 flex flex-col items-center justify-center px-8">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="text-6xl mb-6">📖</div>

        {/* Title */}
        <h1 className="text-4xl font-bold tracking-tight text-stone-800">
          Daily Bread
        </h1>

        {/* Taglines */}
        <p className="text-lg text-stone-600 mt-3">
          Nourish your soul, every morning
        </p>
        <p className="text-stone-500 mt-1">
          Daily Scripture, Personalized For You
        </p>

        {/* Buttons */}
        <div className="mt-12 space-y-4">
          <Link
            href="/signup?gender=him"
            className="block w-full py-4 rounded-2xl bg-stone-800 text-white text-lg font-semibold hover:bg-stone-900 transition-all shadow-md"
          >
            Start as Him
          </Link>
          <Link
            href="/signup?gender=her"
            className="block w-full py-4 rounded-2xl bg-amber-600 text-white text-lg font-semibold hover:bg-amber-700 transition-all shadow-md"
          >
            Start as Her
          </Link>
        </div>

        {/* Bottom links */}
        <p className="mt-8 text-stone-500">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-700 hover:underline font-medium">
            Sign in
          </Link>
        </p>

        <p className="mt-6 text-sm text-stone-400">
          Join 10,000+ believers growing in faith daily
        </p>
      </div>
    </main>
  )
}
