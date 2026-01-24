'use client'

import BottomNav from '@/components/bottom-nav'

export default function AskPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 pb-24">
      {/* Header */}
      <header className="px-6 py-6">
        <h1 className="text-2xl font-bold text-stone-900">Ask Pastor Landon</h1>
        <p className="text-stone-500 mt-1">Get wisdom from thousands of sermons and Bible studies</p>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Icon */}
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-5xl">🎙️</span>
        </div>

        {/* Coming Soon Message */}
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold text-stone-800 mb-3">Coming Soon</h2>
          <p className="text-stone-600 leading-relaxed">
            We&apos;re training on Pastor Landon&apos;s teaching library to bring you personalized biblical guidance rooted in years of faithful ministry.
          </p>
        </div>

        {/* Feature Preview Cards */}
        <div className="mt-8 w-full max-w-sm space-y-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <span className="text-lg">📖</span>
              </div>
              <div>
                <p className="font-medium text-stone-800">Scripture Questions</p>
                <p className="text-sm text-stone-500">Ask about any Bible passage</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <span className="text-lg">💡</span>
              </div>
              <div>
                <p className="font-medium text-stone-800">Life Guidance</p>
                <p className="text-sm text-stone-500">Get biblical wisdom for decisions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <span className="text-lg">🙏</span>
              </div>
              <div>
                <p className="font-medium text-stone-800">Prayer Support</p>
                <p className="text-sm text-stone-500">Receive personalized prayers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disabled Chat Input */}
      <div className="fixed bottom-20 left-0 right-0 px-6 pb-4 bg-gradient-to-t from-amber-50 via-amber-50 to-transparent pt-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 bg-white rounded-xl border border-stone-200 p-3 opacity-60">
            <input
              type="text"
              placeholder="Ask Pastor Landon anything..."
              disabled
              className="flex-1 bg-transparent text-stone-400 placeholder-stone-400 outline-none cursor-not-allowed"
            />
            <button
              disabled
              className="w-10 h-10 bg-stone-200 rounded-lg flex items-center justify-center cursor-not-allowed"
            >
              <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
