export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface Goal {
  id: number
  title: string
  type: 'short_term' | 'long_term'
  created_at: string
}

export interface Milestone {
  id: number
  goal_id: number
  label: string
  order: number
}

export interface DebriefResponse {
  xp_awarded: number
  strengths: string
  areas_to_improve: string
  suggestions: string
  trait_deltas: Record<string, number>
  goal_connections: string | null
  path_milestones: { goal_id: number; label: string; order: number }[]
  streak_count: number
  weekly_streak: boolean[]
}

export interface StatsResponse {
  xp_total: number
  streak_count: number
  trait_scores: Record<string, number>
}

export interface HomeResponse {
  short_term_milestones: Milestone[]
  long_term_milestones: Milestone[]
}
