import { create } from 'zustand'
import { api } from '../api/client'
import type { DebriefResponse, Message } from '../types'

interface JournalState {
  status: 'idle' | 'active' | 'completed'
  messages: Message[]
  debrief: DebriefResponse | null
  isLoading: boolean
  error: string | null
  loadToday: () => Promise<void>
  sendMessage: (content: string) => Promise<void>
  completeSession: () => Promise<void>
  clearError: () => void
}

export const useJournalStore = create<JournalState>((set, get) => ({
  status: 'idle',
  messages: [],
  debrief: null,
  isLoading: false,
  error: null,

  loadToday: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.journal.getToday()
      set({
        status: data.status as 'active' | 'completed',
        messages: data.messages as Message[],
        isLoading: false,
      })
    } catch {
      set({ isLoading: false, error: 'Failed to load today\'s session.' })
    }
  },

  sendMessage: async (content: string) => {
    const prev = get().messages
    set({ isLoading: true, error: null, messages: [...prev, { role: 'user', content }] })
    try {
      const reply = await api.journal.sendMessage(content)
      set(s => ({ isLoading: false, messages: [...s.messages, reply as Message] }))
    } catch {
      set({ isLoading: false, messages: prev, error: 'AI unavailable — please try again.' })
    }
  },

  completeSession: async () => {
    set({ isLoading: true, error: null })
    try {
      const debrief = await api.journal.complete()
      set({ isLoading: false, status: 'completed', debrief })
    } catch {
      set({ isLoading: false, error: 'Failed to complete session — please try again.' })
    }
  },

  clearError: () => set({ error: null }),
}))
