'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Conversation } from '@/hooks/use-conversations'

interface ConversationListProps {
  conversations: Conversation[]
  currentConversationId?: string
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onCreate: () => void
}

export function ConversationList({
  conversations,
  currentConversationId,
  onSelect,
  onDelete,
  onCreate,
}: ConversationListProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b p-4">
        <Button onClick={onCreate} className="w-full" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`group flex items-center justify-between rounded-lg p-3 hover:bg-accent ${
              conv.id === currentConversationId ? 'bg-accent' : ''
            }`}
          >
            <button
              onClick={() => onSelect(conv.id)}
              className="flex-1 truncate text-left text-sm"
            >
              {conv.title}
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(conv.id)
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
