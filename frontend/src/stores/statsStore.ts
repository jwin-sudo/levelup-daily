import { create } from 'zustand'
import { api } from '../api/client'
import type { DebriefResponse, Milestone } from '../types'

interface StatsState {
  xp_total: number
  streak_count: number
  trait_scores: Record<string, number>
  short_term_milestones: Milestone[]
  long_term_milestones: Milestone[]
  loadStats: () => Promise<void>
  loadHome: () => Promise<void>
  applyDebrief: (debrief: DebriefResponse) => void
}

export const useStatsStore = create<StatsState>((set) => ({
  xp_total: 0,
  streak_count: 0,
  trait_scores: {},
  short_term_milestones: [],
  long_term_milestones: [],

  loadStats: async () => {
    try {
      const data = await api.stats.get()
      set({ xp_total: data.xp_total, streak_count: data.streak_count, trait_scores: data.trait_scores })
    } catch {
      // silently fail — progress page handles empty state
    }
  },

  loadHome: async () => {
    try {
      const data = await api.home.get()
      set({ short_term_milestones: data.short_term_milestones, long_term_milestones: data.long_term_milestones })
    } catch {
      // silently fail — home page handles empty state
    }
  },

  applyDebrief: (debrief) => {
    set(s => ({
      xp_total: s.xp_total + debrief.xp_awarded,
      streak_count: debrief.streak_count,
      trait_scores: Object.fromEntries(
        Object.entries(s.trait_scores).map(([k, v]) => [k, v + (debrief.trait_deltas[k] ?? 0)])
      ),
    }))
  },
}))
