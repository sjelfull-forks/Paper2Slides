'use client'

import type { Config } from '@/hooks/use-conversations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ConfigPanelProps {
  config: Config
  onChange: (updates: Partial<Config>) => void
}

export function ConfigPanel({ config, onChange }: ConfigPanelProps) {
  return (
    <div className="border-t p-4">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
          <div>
            <label className="text-xs font-medium">Output</label>
            <select
              value={config.output}
              onChange={(e) => onChange({ output: e.target.value as 'slides' | 'poster' })}
              className="w-full rounded-md border p-2 text-sm"
            >
              <option value="slides">Slides</option>
              <option value="poster">Poster</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium">Style</label>
            <select
              value={config.style}
              onChange={(e) => onChange({ style: e.target.value })}
              className="w-full rounded-md border p-2 text-sm"
            >
              <option value="academic">Academic</option>
              <option value="doraemon">Doraemon</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium">Content Type</label>
            <select
              value={config.content}
              onChange={(e) => onChange({ content: e.target.value as 'paper' | 'general' })}
              className="w-full rounded-md border p-2 text-sm"
            >
              <option value="paper">Paper</option>
              <option value="general">General</option>
            </select>
          </div>

          {config.output === 'slides' && (
            <div>
              <label className="text-xs font-medium">Length</label>
              <select
                value={config.length}
                onChange={(e) =>
                  onChange({ length: e.target.value as 'short' | 'medium' | 'long' })
                }
                className="w-full rounded-md border p-2 text-sm"
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
          )}

          {config.output === 'poster' && (
            <div>
              <label className="text-xs font-medium">Density</label>
              <select
                value={config.density}
                onChange={(e) =>
                  onChange({ density: e.target.value as 'sparse' | 'medium' | 'dense' })
                }
                className="w-full rounded-md border p-2 text-sm"
              >
                <option value="sparse">Sparse</option>
                <option value="medium">Medium</option>
                <option value="dense">Dense</option>
              </select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="fastMode"
              checked={config.fastMode}
              onChange={(e) => onChange({ fastMode: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="fastMode" className="text-xs">
              Fast Mode
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
