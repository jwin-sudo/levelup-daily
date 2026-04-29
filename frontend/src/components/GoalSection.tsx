import type { Goal } from '../types'
import { GoalCard } from './GoalCard'
import { AddGoalInput } from './AddGoalInput'

interface GoalSectionProps {
  title: string
  emoji: string
  goals: Goal[]
  type: 'short_term' | 'long_term'
}

export function GoalSection({ title, emoji, goals, type }: GoalSectionProps) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-gray-700 mb-3">{emoji} {title}</h2>
      <div className="flex flex-col gap-2">
        {goals.length === 0 && (
          <p className="text-sm text-gray-400 italic px-1">No goals yet — add one below.</p>
        )}
        {goals.map(goal => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
      <AddGoalInput type={type} />
    </div>
  )
}
