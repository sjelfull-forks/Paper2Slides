'use client'

import { useState } from 'react'
import { Send, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface MessageInputProps {
  onSend: (message: string, files?: File[]) => void
  isLoading: boolean
  conversationId?: string
}

export function MessageInput({ onSend, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() && files.length === 0) return

    onSend(message, files.length > 0 ? files : undefined)
    setMessage('')
    setFiles([])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  return (
    <div className="border-t p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1">
          {files.length > 0 && (
            <div className="mb-2 rounded-md bg-muted p-2 text-sm">
              {files.map((file, idx) => (
                <div key={idx}>{file.name}</div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={isLoading}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className="h-4 w-4" />
            </Button>
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.md,.doc,.docx,.ppt,.pptx"
            />
            <Button type="submit" disabled={isLoading} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
