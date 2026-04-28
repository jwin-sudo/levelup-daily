import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import type { Message } from '../types'

interface ChatWindowProps {
  messages: Message[]
  readOnly?: boolean
  compact?: boolean
}

export function ChatWindow({ messages, readOnly = false, compact = false }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className={`${compact ? 'max-h-48 overflow-y-auto' : 'flex-1 overflow-y-auto'} px-4 py-4 ${readOnly ? 'opacity-75' : ''}`}>
      {messages.map((msg, i) => (
        <MessageBubble key={i} role={msg.role} content={msg.content} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
