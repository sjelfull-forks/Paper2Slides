/**
 * Document Processing API Route
 * Processes uploaded documents and generates slides
 * Uses TypeScript backend instead of Python
 */

import { NextRequest } from 'next/server'
import { DocumentParser, RAGSystem, PaperProcessor } from '@paper2slides/backend'
import path from 'path'
import fs from 'fs'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), '../../sources/uploads')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, config } = body

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const sessionDir = path.join(UPLOAD_DIR, sessionId)
    
    // Initialize processors
    const parser = new DocumentParser()
    const ragSystem = new RAGSystem({
      openaiApiKey: process.env.OPENAI_API_KEY,
      model: config.model || 'gpt-4-turbo-preview',
      chunkSize: 1000,
      chunkOverlap: 200,
    })
    const processor = new PaperProcessor(ragSystem, process.env.OPENAI_API_KEY)

    // Create a streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial status
          controller.enqueue(
            encoder.encode(
              JSON.stringify({ type: 'status', data: 'Parsing documents...' }) + '\n'
            )
          )

          // Parse documents in session directory
          const files = fs.readdirSync(sessionDir)
          
          let combinedDoc = null
          
          for (const file of files) {
            const filePath = path.join(sessionDir, file)
            const doc = await parser.parseDocument(filePath)
            
            if (!combinedDoc) {
              combinedDoc = doc
            } else {
              // Combine documents
              combinedDoc.text += '\n\n' + doc.text
            }
          }

          if (!combinedDoc) {
            throw new Error('No documents found')
          }

          // Summarize paper
          controller.enqueue(
            encoder.encode(
              JSON.stringify({ type: 'status', data: 'Analyzing paper...' }) + '\n'
            )
          )

          const summary = await processor.summarizePaper(combinedDoc)

          controller.enqueue(
            encoder.encode(
              JSON.stringify({ type: 'summary', data: summary }) + '\n'
            )
          )

          // Generate slides
          controller.enqueue(
            encoder.encode(
              JSON.stringify({ type: 'status', data: 'Generating slides...' }) + '\n'
            )
          )

          for await (const update of processor.generateSlidesStream(summary, config)) {
            controller.enqueue(
              encoder.encode(JSON.stringify(update) + '\n')
            )
          }

          controller.close()
        } catch (error) {
          console.error('Processing error:', error)
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'error',
                data: error instanceof Error ? error.message : 'Processing failed',
              }) + '\n'
            )
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
