import { strict as assert } from 'node:assert'
import { afterEach, test } from 'node:test'

import { api } from '../../src/api/client'

const originalFetch = globalThis.fetch

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

afterEach(() => {
  globalThis.fetch = originalFetch
})

test('journal.complete posts to the expected endpoint and parses the response', async () => {
  globalThis.fetch = async (input, init) => {
    assert.equal(input, 'http://localhost:8000/journal/complete')
    assert.equal(init?.method, 'POST')
    return jsonResponse({
      xp_awarded: 12,
      strengths: 'You showed honesty.',
      areas_to_improve: 'You could slow down.',
      suggestions: 'Write one next step tomorrow.',
      trait_deltas: {
        stoicism: 1,
        resilience: 2,
        patience: 0,
        action_orientation: 1,
        critical_thinking: 1,
      },
      goal_connections: null,
      path_milestones: [],
      streak_count: 3,
      weekly_streak: [false, true, false, false, false, false, false],
    }) as Response
  }

  const debrief = await api.journal.complete()

  assert.equal(debrief.xp_awarded, 12)
  assert.equal(debrief.streak_count, 3)
  assert.equal(debrief.trait_deltas.resilience, 2)
})

test('goals.create posts a goal payload with title and type', async () => {
  globalThis.fetch = async (input, init) => {
    assert.equal(input, 'http://localhost:8000/goals')
    assert.equal(init?.method, 'POST')
    assert.equal(init?.headers && (init.headers as Record<string, string>)['Content-Type'], 'application/json')
    assert.equal(init?.body, JSON.stringify({ title: 'Run a 5K', type: 'short_term' }))
    return jsonResponse({ id: 1, title: 'Run a 5K', type: 'short_term', created_at: '2026-07-15T00:00:00Z' }) as Response
  }

  const goal = await api.goals.create('Run a 5K', 'short_term')

  assert.equal(goal.id, 1)
  assert.equal(goal.title, 'Run a 5K')
  assert.equal(goal.type, 'short_term')
})
