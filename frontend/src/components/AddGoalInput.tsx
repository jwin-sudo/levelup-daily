import { useState } from 'react'
import { useGoalStore } from '../stores/goalStore'

interface AddGoalInputProps {
  type: 'short_term' | 'long_term'
}

export function AddGoalInput({ type }: AddGoalInputProps) {
  const [title, setTitle] = useState('')
  const createGoal = useGoalStore(s => s.createGoal)

  const handleAdd = async () => {
    const trimmed = title.trim()
    if (!trimmed) return
    await createGoal(trimmed, type)
    setTitle('')
  }

  return (
    <div className="flex gap-2 mt-3">
      <input
        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
        placeholder="Add a goal..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
      />
      <button
        onClick={handleAdd}
        disabled={!title.trim()}
        className="bg-green-500 text-white rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-green-600 transition-colors"
      >
        Add
      </button>
    </div>
  )
}
