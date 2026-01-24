'use client'

import BottomNav from '@/components/bottom-nav'

export default function AskPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 pb-28">
      {/* Header */}
      <header className="px-8 pt-12 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Ask Pastor Landon</h1>
          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
            Coming Soon
          </span>
        </div>
        <p className="text-lg text-stone-500 leading-relaxed">
          Get wisdom from thousands of sermons and Bible studies
        </p>
      </header>

      {/* Main Content */}
      <div className="px-8">
        <div className="max-w-lg mx-auto">
          {/* Hero Section */}
          <div className="text-center py-12">
            {/* Icon */}
            <div className="w-28 h-28 bg-gradient-to-br from-amber-100 to-amber-200 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-sm">
              <span className="text-6xl">🎙️</span>
            </div>

            {/* Coming Soon Message */}
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              Something Special is Coming
            </h2>
            <p className="text-stone-600 leading-relaxed max-w-sm mx-auto">
              We&apos;re training on Pastor Landon&apos;s teaching library to bring you personalized biblical guidance rooted in years of faithful ministry.
            </p>
          </div>

          {/* Feature Preview Cards */}
          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider">
              What you&apos;ll be able to do
            </h3>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 hover:shadow-md hover:border-stone-300 transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📖</span>
                </div>
                <div>
                  <p className="font-semibold text-stone-900 mb-1">Scripture Questions</p>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    Ask about any Bible passage and get thoughtful, grounded explanations
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 hover:shadow-md hover:border-stone-300 transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💡</span>
                </div>
                <div>
                  <p className="font-semibold text-stone-900 mb-1">Life Guidance</p>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    Get biblical wisdom for decisions, relationships, and challenges
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 hover:shadow-md hover:border-stone-300 transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🙏</span>
                </div>
                <div>
                  <p className="font-semibold text-stone-900 mb-1">Prayer Support</p>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    Receive personalized prayers for whatever you&apos;re going through
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 hover:shadow-md hover:border-stone-300 transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <p className="font-semibold text-stone-900 mb-1">Topical Deep Dives</p>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    Explore topics like faith, anxiety, purpose, and relationships
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pastor Info Card */}
          <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-6 text-white mb-8">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">About Pastor Landon</h4>
                <p className="text-stone-400 text-sm leading-relaxed">
                  Drawing from decades of pastoral wisdom, our AI is being trained to respond with the same warmth, biblical depth, and practical insight you&apos;d find in a one-on-one conversation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disabled Chat Input */}
      <div className="fixed bottom-24 left-0 right-0 px-8 pb-4 bg-gradient-to-t from-stone-50 via-stone-50 to-transparent pt-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 bg-white rounded-2xl border border-stone-200 p-4 shadow-sm opacity-60">
            <input
              type="text"
              placeholder="Ask Pastor Landon anything..."
              disabled
              className="flex-1 bg-transparent text-stone-400 placeholder-stone-400 outline-none cursor-not-allowed text-lg"
            />
            <button
              disabled
              className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center cursor-not-allowed"
            >
              <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-center text-stone-400 text-sm mt-3">
            Available soon — we&apos;re putting the finishing touches on it
          </p>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
