/**
 * RAG (Retrieval Augmented Generation) Implementation
 * Simplified implementation using OpenAI embeddings and Vercel AI SDK
 * Mastra is available for future agent-based enhancements
 */

import { openai } from '@ai-sdk/openai'
import { generateText, streamText } from 'ai'
import type { ParsedDocument } from './parser'

export interface RAGConfig {
  openaiApiKey: string
  model?: string
  embeddingModel?: string
  chunkSize?: number
  chunkOverlap?: number
  topK?: number
}

// Default configurations
const DEFAULT_MODEL = 'gpt-4-turbo-preview'
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small'

export interface RAGQuery {
  query: string
  topK?: number
}

export interface RAGResult {
  answer: string
  sources: Array<{
    content: string
    metadata: Record<string, any>
    score: number
  }>
}

interface DocumentChunk {
  content: string
  metadata: Record<string, any>
  embedding?: number[]
}

export class RAGSystem {
  private config: Required<RAGConfig>
  private documents: DocumentChunk[] = []
  private indexed: boolean = false

  constructor(config: RAGConfig) {
    this.config = {
      model: config.model || DEFAULT_MODEL,
      embeddingModel: config.embeddingModel || DEFAULT_EMBEDDING_MODEL,
      chunkSize: config.chunkSize || 1000,
      chunkOverlap: config.chunkOverlap || 200,
      topK: config.topK || 4,
      openaiApiKey: config.openaiApiKey,
    }
  }

  /**
   * Split text into chunks
   */
  private splitIntoChunks(text: string): string[] {
    const chunks: string[] = []
    const { chunkSize, chunkOverlap } = this.config

    let start = 0
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length)
      chunks.push(text.slice(start, end))
      start += chunkSize - chunkOverlap
    }

    return chunks
  }

  /**
   * Generate embeddings for text using OpenAI
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.openaiApiKey}`,
        },
        body: JSON.stringify({
          input: text,
          model: this.config.embeddingModel,
        }),
      })

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.statusText}`)
      }

      const data: any = await response.json()
      return data.data[0].embedding
    } catch (error) {
      console.error('Error generating embedding:', error)
      throw error
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
    return dotProduct / (magnitudeA * magnitudeB)
  }

  /**
   * Index a document for RAG
   */
  async indexDocument(doc: ParsedDocument): Promise<void> {
    const chunks = this.splitIntoChunks(doc.text)

    for (const chunk of chunks) {
      const embedding = await this.generateEmbedding(chunk)
      this.documents.push({
        content: chunk,
        metadata: {
          fileName: doc.metadata.fileName,
          fileType: doc.metadata.fileType,
        },
        embedding,
      })
    }

    this.indexed = true
  }

  /**
   * Query the RAG system
   */
  async query(query: RAGQuery): Promise<RAGResult> {
    if (!this.indexed || this.documents.length === 0) {
      throw new Error('No documents indexed. Call indexDocument first.')
    }

    const topK = query.topK || this.config.topK
    const queryEmbedding = await this.generateEmbedding(query.query)

    const results = this.documents
      .map((doc) => ({
        ...doc,
        score: this.cosineSimilarity(queryEmbedding, doc.embedding!),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)

    const sources = results.map((r) => ({
      content: r.content,
      metadata: r.metadata,
      score: r.score,
    }))

    const context = sources.map((s, i) => `[${i + 1}] ${s.content}`).join('\n\n')

    const prompt = `Based on the following context, answer the question.

Context:
${context}

Question: ${query.query}

Answer:`

    // Use Vercel AI SDK for generation
    const { text } = await generateText({
      model: openai(this.config.model),
      prompt,
    })

    return {
      answer: text,
      sources,
    }
  }

  /**
   * Stream a query response
   */
  async *streamQuery(query: RAGQuery): AsyncGenerator<string> {
    if (!this.indexed || this.documents.length === 0) {
      throw new Error('No documents indexed. Call indexDocument first.')
    }

    const topK = query.topK || this.config.topK
    const queryEmbedding = await this.generateEmbedding(query.query)

    const results = this.documents
      .map((doc) => ({
        ...doc,
        score: this.cosineSimilarity(queryEmbedding, doc.embedding!),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)

    const context = results.map((r, i) => `[${i + 1}] ${r.content}`).join('\n\n')

    const prompt = `Based on the following context, answer the question.

Context:
${context}

Question: ${query.query}

Answer:`

    // Use Vercel AI SDK for streaming
    const { textStream } = await streamText({
      model: openai(this.config.model),
      prompt,
    })

    for await (const chunk of textStream) {
      yield chunk
    }
  }

  /**
   * Get statistics about indexed documents
   */
  async getStats(): Promise<{
    documentCount: number
    chunkCount: number
  }> {
    return {
      documentCount: 1,
      chunkCount: this.documents.length,
    }
  }

  /**
   * Clear all indexed documents
   */
  clear(): void {
    this.documents = []
    this.indexed = false
  }
}
