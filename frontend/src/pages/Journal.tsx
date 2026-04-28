import { useEffect } from 'react'
import { useJournalStore } from '../stores/journalStore'
import { useStatsStore } from '../stores/statsStore'
import { ChatWindow } from '../components/ChatWindow'
import { MessageInput } from '../components/MessageInput'
import { ErrorBanner } from '../components/ErrorBanner'
import { DebriefScreen } from '../components/DebriefScreen'

export function Journal() {
  const { status, messages, debrief, isLoading, error, loadToday, completeSession, clearError } = useJournalStore()
  const applyDebrief = useStatsStore(s => s.applyDebrief)

  useEffect(() => {
    loadToday()
  }, [loadToday])

  useEffect(() => {
    if (debrief) applyDebrief(debrief)
  }, [debrief, applyDebrief])

  if (status === 'idle') {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        <svg className="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Loading…
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100 bg-white">
        <h1 className="text-lg font-bold text-gray-800">Journal</h1>
        {status === 'completed' && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
            Completed ✓
          </span>
        )}
      </div>

      <ErrorBanner error={error} onDismiss={clearError} />

      {status === 'active' && (
        <>
          <ChatWindow messages={messages} />
          <MessageInput />
          <div className="px-4 pb-4 bg-white">
            <button
              onClick={completeSession}
              disabled={isLoading || messages.length < 2}
              className="w-full py-2.5 rounded-xl border border-green-500 text-green-600 text-sm font-semibold hover:bg-green-50 disabled:opacity-40 transition-colors"
            >
              {isLoading ? 'Analyzing your session…' : 'End Session'}
            </button>
          </div>
        </>
      )}

      {status === 'completed' && (
        <div className="flex-1 overflow-y-auto flex flex-col">
          <ChatWindow messages={messages} readOnly compact />
          <div className="border-t border-gray-100">
            {debrief
              ? <DebriefScreen debrief={debrief} />
              : (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  Loading debrief…
                </div>
              )
            }
          </div>
        </div>
      )}
    </div>
  )
}
