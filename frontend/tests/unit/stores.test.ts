import { strict as assert } from 'node:assert'
import { afterEach, beforeEach, test } from 'node:test'

import { api } from '../../src/api/client'
import { useGoalStore } from '../../src/stores/goalStore'
import { useStatsStore } from '../../src/stores/statsStore'

const initialGoalState = {
  goals: [],
  isLoading: false,
  error: null,
}

const initialStatsState = {
  xp_total: 0,
  streak_count: 0,
  trait_scores: {},
  short_term_milestones: [],
  long_term_milestones: [],
}

const originalGoalApi = {
  list: api.goals.list,
  create: api.goals.create,
  update: api.goals.update,
  delete: api.goals.delete,
}

const originalStatsApi = {
  get: api.stats.get,
  home: api.home.get,
}

beforeEach(() => {
  useGoalStore.setState(initialGoalState)
  useStatsStore.setState(initialStatsState)
})

afterEach(() => {
  api.goals.list = originalGoalApi.list
  api.goals.create = originalGoalApi.create
  api.goals.update = originalGoalApi.update
  api.goals.delete = originalGoalApi.delete
  api.stats.get = originalStatsApi.get
  api.home.get = originalStatsApi.home
  useGoalStore.setState(initialGoalState)
  useStatsStore.setState(initialStatsState)
})

test('goal store load/create/update/delete updates the in-memory list', async () => {
  api.goals.list = async () => ({
    short_term: [{ id: 1, title: 'Run a 5K', type: 'short_term', created_at: '2026-07-15T00:00:00Z' }],
    long_term: [{ id: 2, title: 'Build a product', type: 'long_term', created_at: '2026-07-15T00:00:00Z' }],
  })
  api.goals.create = async (title, type) => ({ id: 3, title, type, created_at: '2026-07-15T00:00:00Z' })
  api.goals.update = async (id, title) => ({ id, title, type: 'short_term', created_at: '2026-07-15T00:00:00Z' })
  api.goals.delete = async () => undefined

  await useGoalStore.getState().loadGoals()
  await useGoalStore.getState().createGoal('Read more', 'short_term')
  await useGoalStore.getState().updateGoal(1, 'Run a 10K')
  await useGoalStore.getState().deleteGoal(2)

  const goals = useGoalStore.getState().goals
  assert.equal(goals.length, 2)
  assert.equal(goals.find(goal => goal.id === 1)?.title, 'Run a 10K')
  assert.equal(goals.some(goal => goal.id === 2), false)
  assert.equal(goals.some(goal => goal.id === 3), true)
})

test('stats store loadStats and applyDebrief update totals consistently', async () => {
  api.stats.get = async () => ({
    xp_total: 21,
    streak_count: 5,
    trait_scores: {
      stoicism: 1,
      resilience: 2,
      patience: 3,
      action_orientation: 4,
      critical_thinking: 5,
    },
  })

  await useStatsStore.getState().loadStats()
  useStatsStore.getState().applyDebrief({
    xp_awarded: 9,
    strengths: 'Great reflection.',
    areas_to_improve: 'Keep going.',
    suggestions: 'Write one action tomorrow.',
    trait_deltas: {
      stoicism: 1,
      resilience: 0,
      patience: 2,
      action_orientation: 1,
      critical_thinking: 0,
    },
    goal_connections: null,
    path_milestones: [],
    streak_count: 6,
    weekly_streak: [false, false, false, false, false, true, false],
  })

  const state = useStatsStore.getState()
  assert.equal(state.xp_total, 30)
  assert.equal(state.streak_count, 6)
  assert.equal(state.trait_scores.stoicism, 2)
  assert.equal(state.trait_scores.patience, 5)
  assert.equal(state.trait_scores.action_orientation, 5)
})
