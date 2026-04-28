import { useState, type KeyboardEvent } from 'react'
import { useJournalStore } from '../stores/journalStore'

export function MessageInput() {
  const [text, setText] = useState('')
  const { isLoading, sendMessage } = useJournalStore()

  const submit = async () => {
    const content = text.trim()
    if (!content || isLoading) return
    setText('')
    await sendMessage(content)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="flex items-end gap-2 px-4 py-3 bg-white border-t border-gray-100">
      <textarea
        className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-green-400 max-h-32"
        rows={1}
        placeholder="Type a message…"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={isLoading}
      />
      <button
        onClick={submit}
        disabled={isLoading || !text.trim()}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white disabled:opacity-40 shrink-0"
      >
        {isLoading ? (
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        )}
      </button>
    </div>
  )
}
