'use client'

import type { Message } from '@/hooks/use-conversations'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 && (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Welcome to Paper2Slides</h2>
            <p className="mt-2">Upload a paper and get started!</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.files && message.files.length > 0 && (
                <div className="mt-2 text-xs opacity-75">
                  {message.files.map((file, idx) => (
                    <div key={idx}>{file.name}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg bg-muted p-4">
              <p>Thinking...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
