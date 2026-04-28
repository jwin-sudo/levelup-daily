import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import type { Message } from '../types'

interface ChatWindowProps {
  messages: Message[]
  readOnly?: boolean
}

export function ChatWindow({ messages, readOnly = false }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className={`flex-1 overflow-y-auto px-4 py-4 ${readOnly ? 'opacity-80' : ''}`}>
      {messages.map((msg, i) => (
        <MessageBubble key={i} role={msg.role} content={msg.content} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
