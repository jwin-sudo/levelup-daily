import { useState } from 'react'
import { useGoalStore } from '../stores/goalStore'
import type { Goal } from '../types'

export function GoalCard({ goal }: { goal: Goal }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(goal.title)
  const updateGoal = useGoalStore(s => s.updateGoal)
  const deleteGoal = useGoalStore(s => s.deleteGoal)

  const handleSave = async () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    await updateGoal(goal.id, trimmed)
    setEditing(false)
  }

  const handleCancel = () => {
    setDraft(goal.title)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex gap-2 items-center bg-white border border-green-300 rounded-xl px-3 py-2.5">
        <input
          className="flex-1 text-sm text-gray-800 focus:outline-none"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') handleCancel()
          }}
          autoFocus
        />
        <button onClick={handleSave} className="text-green-500 text-sm font-semibold hover:text-green-700 transition-colors">
          Save
        </button>
        <button onClick={handleCancel} className="text-gray-400 text-sm hover:text-gray-600 transition-colors">
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center bg-white border border-gray-100 rounded-xl px-3 py-2.5 gap-3 shadow-sm">
      <span className="flex-1 text-sm text-gray-800">{goal.title}</span>
      <button
        onClick={() => { setDraft(goal.title); setEditing(true) }}
        className="text-gray-300 hover:text-blue-400 transition-colors text-base"
        aria-label="Edit goal"
      >
        ✏️
      </button>
      <button
        onClick={() => deleteGoal(goal.id)}
        className="text-gray-300 hover:text-red-400 transition-colors text-base"
        aria-label="Delete goal"
      >
        🗑️
      </button>
    </div>
  )
}
