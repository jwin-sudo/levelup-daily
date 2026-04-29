import { useEffect } from 'react'
import { useStatsStore } from '../stores/statsStore'
import { StatCard } from '../components/StatCard'
import { TraitScoreCard } from '../components/TraitScoreCard'

const TRAITS = ['stoicism', 'resilience', 'patience', 'action_orientation', 'critical_thinking']

const TRAIT_LABELS: Record<string, string> = {
  stoicism: 'Stoicism',
  resilience: 'Resilience',
  patience: 'Patience',
  action_orientation: 'Action-Orientation',
  critical_thinking: 'Critical Thinking',
}

export function Progress() {
  const { xp_total, streak_count, trait_scores, loadStats } = useStatsStore()

  useEffect(() => {
    loadStats()
  }, [loadStats])

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-black text-gray-800">Progress</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your journey so far</p>
      </div>

      <div className="px-4 flex flex-col gap-4 pb-8">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total XP" value={xp_total} colorClass="bg-green-50 border-green-200 text-green-600" />
          <StatCard label="Day Streak" value={streak_count} colorClass="bg-orange-50 border-orange-200 text-orange-500" />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Character Traits</h2>
          {TRAITS.map(trait => (
            <TraitScoreCard
              key={trait}
              trait={TRAIT_LABELS[trait]}
              score={trait_scores[trait] ?? 0}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
