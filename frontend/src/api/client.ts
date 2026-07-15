import type { DebriefResponse, Goal, HomeResponse, StatsResponse } from '../types'
import { getApiBaseUrl } from './base'

const BASE = () => getApiBaseUrl()

const json = (r: Response): Promise<any> => {
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

export const api = {
  journal: {
    getToday: (): Promise<{ status: string; messages: { role: string; content: string }[] }> =>
      fetch(`${BASE()}/journal/today`).then(json),

    sendMessage: (content: string): Promise<{ role: string; content: string }> =>
      fetch(`${BASE()}/journal/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      }).then(json),

    complete: (): Promise<DebriefResponse> =>
      fetch(`${BASE()}/journal/complete`, { method: 'POST' }).then(json),
  },

  goals: {
    list: (): Promise<{ short_term: Goal[]; long_term: Goal[] }> =>
      fetch(`${BASE()}/goals`).then(json),

    create: (title: string, type: 'short_term' | 'long_term'): Promise<Goal> =>
      fetch(`${BASE()}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, type }),
      }).then(json),

    update: (id: number, title: string): Promise<Goal> =>
      fetch(`${BASE()}/goals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      }).then(json),

    delete: (id: number): Promise<void> =>
      fetch(`${BASE}/goals/${id}`, { method: 'DELETE' }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
      }),
  },

  stats: {
    get: (): Promise<StatsResponse> => fetch(`${BASE()}/stats`).then(json),
  },

  home: {
    get: (): Promise<HomeResponse> => fetch(`${BASE()}/home`).then(json),
  },
}
