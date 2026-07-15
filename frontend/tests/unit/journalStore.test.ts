import { strict as assert } from 'node:assert'
import { afterEach, beforeEach, test } from 'node:test'

import { api } from '../../src/api/client'
import { useJournalStore } from '../../src/stores/journalStore'

const initialJournalState = {
  status: 'idle' as const,
  messages: [],
  debrief: null,
  isLoading: false,
  error: null,
}

const originalJournalApi = {
  getToday: api.journal.getToday,
  sendMessage: api.journal.sendMessage,
  complete: api.journal.complete,
}

beforeEach(() => {
  useJournalStore.setState(initialJournalState)
})

afterEach(() => {
  api.journal.getToday = originalJournalApi.getToday
  api.journal.sendMessage = originalJournalApi.sendMessage
  api.journal.complete = originalJournalApi.complete
  useJournalStore.setState(initialJournalState)
})

test('loadToday hydrates an active session', async () => {
  api.journal.getToday = async () => ({
    status: 'active',
    messages: [{ role: 'assistant', content: 'How are you feeling today?' }],
  })

  await useJournalStore.getState().loadToday()
  const state = useJournalStore.getState()

  assert.equal(state.status, 'active')
  assert.equal(state.messages.length, 1)
  assert.equal(state.messages[0].content, 'How are you feeling today?')
  assert.equal(state.error, null)
})

test('sendMessage appends the user message and assistant reply', async () => {
  api.journal.sendMessage = async () => ({ role: 'assistant', content: 'Tell me more about that.' })

  await useJournalStore.getState().sendMessage('I had a good day.')
  const state = useJournalStore.getState()

  assert.equal(state.messages.length, 2)
  assert.equal(state.messages[0].role, 'user')
  assert.equal(state.messages[1].role, 'assistant')
  assert.equal(state.messages[1].content, 'Tell me more about that.')
})

test('completeSession stores the debrief and marks the session completed', async () => {
  api.journal.complete = async () => ({
    xp_awarded: 14,
    strengths: 'Strong reflection.',
    areas_to_improve: 'Keep exploring patterns.',
    suggestions: 'Write one action item tomorrow.',
    trait_deltas: {
      stoicism: 1,
      resilience: 2,
      patience: 0,
      action_orientation: 1,
      critical_thinking: 1,
    },
    goal_connections: null,
    path_milestones: [],
    streak_count: 4,
    weekly_streak: [false, true, false, false, false, false, false],
  })

  await useJournalStore.getState().completeSession()
  const state = useJournalStore.getState()

  assert.equal(state.status, 'completed')
  assert.equal(state.debrief?.xp_awarded, 14)
  assert.equal(state.error, null)
})
