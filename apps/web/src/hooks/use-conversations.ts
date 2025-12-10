'use client'

import { useState, useCallback, useEffect } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  files?: any[]
  pptUrl?: string
  posterUrl?: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  files: any[]
  config: Config
  createdAt: string
  updatedAt: string
}

export interface Config {
  content: 'paper' | 'general'
  style: string
  output: 'slides' | 'poster'
  length: 'short' | 'medium' | 'long'
  density: 'sparse' | 'medium' | 'dense'
  fastMode: boolean
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

const defaultConfig: Config = {
  content: 'paper',
  style: 'doraemon',
  output: 'slides',
  length: 'medium',
  density: 'medium',
  fastMode: true,
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [config, setConfig] = useState<Config>(defaultConfig)
  const [isLoading, setIsLoading] = useState(false)

  const currentConversation = conversations.find((c) => c.id === currentConversationId)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('paper2slides_conversations')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setConversations(parsed)
        if (parsed.length > 0) {
          setCurrentConversationId(parsed[0].id)
          if (parsed[0].config) {
            setConfig(parsed[0].config)
          }
        }
      } catch (e) {
        console.error('Error loading conversations:', e)
      }
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('paper2slides_conversations', JSON.stringify(conversations))
    }
  }, [conversations])

  const createConversation = useCallback(() => {
    const newConv: Conversation = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      files: [],
      config: { ...config },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setCurrentConversationId(newConv.id)
    setConversations((prev) => [newConv, ...prev])
  }, [config])

  const selectConversation = useCallback(
    (id: string) => {
      const conv = conversations.find((c) => c.id === id)
      if (conv) {
        setCurrentConversationId(id)
        if (conv.config) {
          setConfig(conv.config)
        }
      }
    },
    [conversations]
  )

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== id)
        if (id === currentConversationId && filtered.length > 0) {
          setCurrentConversationId(filtered[0].id)
        }
        return filtered
      })
    },
    [currentConversationId]
  )

  const updateConfig = useCallback(
    (updates: Partial<Config>) => {
      setConfig((prev) => ({ ...prev, ...updates }))
      if (currentConversationId) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversationId
              ? { ...conv, config: { ...conv.config, ...updates } }
              : conv
          )
        )
      }
    },
    [currentConversationId]
  )

  const sendMessage = useCallback(
    async (content: string, files?: File[]) => {
      if (!currentConversationId) {
        createConversation()
        return
      }

      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        files: files?.map((f) => ({ name: f.name, size: f.size })),
      }

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: [...conv.messages, userMessage],
                updatedAt: new Date().toISOString(),
              }
            : conv
        )
      )

      setIsLoading(true)

      try {
        // TODO: Implement API call with AI SDK
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            config,
            conversationId: currentConversationId,
          }),
        })

        const data = await response.json()

        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: data.message || 'Processing your request...',
          timestamp: new Date().toISOString(),
        }

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, assistantMessage],
                  updatedAt: new Date().toISOString(),
                }
              : conv
          )
        )
      } catch (error) {
        console.error('Error sending message:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [currentConversationId, config, createConversation]
  )

  // Create initial conversation if none exist
  useEffect(() => {
    if (conversations.length === 0) {
      createConversation()
    }
  }, [])

  return {
    conversations,
    currentConversation,
    config,
    isLoading,
    createConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
    updateConfig,
  }
}
