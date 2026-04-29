import { useEffect } from 'react'
import { useGoalStore } from '../stores/goalStore'
import { GoalSection } from '../components/GoalSection'
import { ErrorBanner } from '../components/ErrorBanner'

export function Goals() {
  const loadGoals = useGoalStore(s => s.loadGoals)
  const goals = useGoalStore(s => s.goals)
  const isLoading = useGoalStore(s => s.isLoading)
  const error = useGoalStore(s => s.error)
  const clearError = useGoalStore(s => s.clearError)

  useEffect(() => { loadGoals() }, [loadGoals])

  const shortTermGoals = goals.filter(g => g.type === 'short_term')
  const longTermGoals = goals.filter(g => g.type === 'long_term')

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 pt-6 pb-4">
      <h1 className="text-2xl font-black text-gray-800 mb-6">🎯 Goals</h1>

      {error && <ErrorBanner error={error} onDismiss={clearError} />}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <GoalSection
            title="Short-Term Goals"
            emoji="⚡"
            goals={shortTermGoals}
            type="short_term"
          />
          <GoalSection
            title="Long-Term Goals"
            emoji="🌟"
            goals={longTermGoals}
            type="long_term"
          />
        </>
      )}
    </div>
  )
}
