import { create } from 'zustand'
import { api } from '../api/client'
import type { Goal } from '../types'

interface GoalState {
  goals: Goal[]
  isLoading: boolean
  error: string | null
  loadGoals: () => Promise<void>
  createGoal: (title: string, type: 'short_term' | 'long_term') => Promise<void>
  updateGoal: (id: number, title: string) => Promise<void>
  deleteGoal: (id: number) => Promise<void>
  clearError: () => void
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: [],
  isLoading: false,
  error: null,

  loadGoals: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.goals.list()
      set({ isLoading: false, goals: [...data.short_term, ...data.long_term] })
    } catch {
      set({ isLoading: false, error: 'Failed to load goals.' })
    }
  },

  createGoal: async (title, type) => {
    try {
      const goal = await api.goals.create(title, type)
      set(s => ({ goals: [...s.goals, goal] }))
    } catch {
      set({ error: 'Failed to create goal.' })
    }
  },

  updateGoal: async (id, title) => {
    try {
      const updated = await api.goals.update(id, title)
      set(s => ({ goals: s.goals.map(g => g.id === id ? updated : g) }))
    } catch {
      set({ error: 'Failed to update goal.' })
    }
  },

  deleteGoal: async (id) => {
    try {
      await api.goals.delete(id)
      set(s => ({ goals: s.goals.filter(g => g.id !== id) }))
    } catch {
      set({ error: 'Failed to delete goal.' })
    }
  },

  clearError: () => set({ error: null }),
}))
