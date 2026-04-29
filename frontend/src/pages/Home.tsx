import { useEffect } from 'react'
import { useStatsStore } from '../stores/statsStore'
import { PathVisualization } from '../components/PathVisualization'

export function Home() {
  const { short_term_milestones, long_term_milestones, loadHome } = useStatsStore()

  useEffect(() => {
    loadHome()
  }, [loadHome])

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-6 pb-4 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-black text-gray-800">Your Journey</h1>
        <p className="text-sm text-gray-500 mt-0.5">Milestones unlocked through journaling</p>
      </div>

      <div className="flex-1 py-5">
        <PathVisualization
          short_term_milestones={short_term_milestones}
          long_term_milestones={long_term_milestones}
        />
      </div>
    </div>
  )
}
