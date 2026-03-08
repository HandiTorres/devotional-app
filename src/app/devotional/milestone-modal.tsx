'use client'

type CharityType = 'feeding' | 'water' | 'bible' | null

type MilestoneModalProps = {
  milestone: number
  preferredCharity: CharityType
  onDismiss: () => void
}

const CHARITY_NAMES: Record<string, string> = {
  feeding: 'feeding families',
  water: 'clean water',
  bible: 'Bible translation',
}

const MILESTONES: Record<number, { icon: string; title: string; getMessage: (charity: CharityType) => string }> = {
  7: {
    icon: '🎉',
    title: 'One week strong!',
    getMessage: () => 'Your consistency is building something real. Keep going.',
  },
  30: {
    icon: '🏆',
    title: '30 days!',
    getMessage: () => "You're in the top 10% of Bible readers. We just donated a meal in your honor.",
  },
  90: {
    icon: '👑',
    title: '90 days!',
    getMessage: (charity) => {
      const charityName = charity ? CHARITY_NAMES[charity] : 'charity'
      return `This is a lifestyle now. We donated to ${charityName} to celebrate your faithfulness.`
    },
  },
}

export default function MilestoneModal({ milestone, preferredCharity, onDismiss }: MilestoneModalProps) {
  const config = MILESTONES[milestone]
  if (!config) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onDismiss} />

      <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl text-center">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-4xl">{config.icon}</span>
          </div>
        </div>

        <div className="mt-12 space-y-4">
          <h2 className="text-2xl font-bold text-stone-900">{config.title}</h2>
          <p className="text-stone-600 leading-relaxed">{config.getMessage(preferredCharity)}</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full">
            <span className="text-amber-700 font-bold">{milestone} days</span>
            <span className="text-lg">🔥</span>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="mt-8 w-full py-4 px-6 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors"
        >
          Keep Going
        </button>
      </div>
    </div>
  )
}
