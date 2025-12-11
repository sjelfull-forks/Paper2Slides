'use client'

import { useState } from 'react'
import { PanelLeftOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConversationList } from './conversation-list'
import { ConfigPanel } from './config-panel'
import { MessageList } from './message-list'
import { MessageInput } from './message-input'
import { useConversations } from '@/hooks/use-conversations'

export default function ChatInterface() {
  const [showLeftPanel, setShowLeftPanel] = useState(true)
  const {
    conversations,
    currentConversation,
    config,
    isLoading,
    createConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
    updateConfig,
  } = useConversations()

  return (
    <div className="flex h-full">
      {/* Left Panel */}
      {showLeftPanel && (
        <div className="flex w-80 flex-col border-r bg-muted/50">
          <div className="flex h-16 items-center justify-between border-b px-4">
            <h2 className="text-lg font-semibold">Paper2Slides</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLeftPanel(false)}
              className="h-8 w-8"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </div>

          <ConversationList
            conversations={conversations}
            currentConversationId={currentConversation?.id}
            onSelect={selectConversation}
            onDelete={deleteConversation}
            onCreate={createConversation}
          />

          <ConfigPanel config={config} onChange={updateConfig} />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        <div className="flex h-16 items-center border-b px-4">
          {!showLeftPanel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLeftPanel(true)}
              className="mr-2 h-8 w-8"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-lg font-semibold">
            {currentConversation?.title || 'New Conversation'}
          </h1>
        </div>

        <MessageList
          messages={currentConversation?.messages || []}
          isLoading={isLoading}
        />

        <MessageInput
          onSend={sendMessage}
          isLoading={isLoading}
          conversationId={currentConversation?.id}
        />
      </div>
    </div>
  )
}
