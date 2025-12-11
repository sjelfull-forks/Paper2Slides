/**
 * RAG (Retrieval Augmented Generation) Implementation using Mastra
 * Uses Mastra's built-in RAG capabilities for chunking, embedding, and retrieval
 * See: https://mastra.ai/docs/rag/overview
 */

import { Mastra, RAG } from '@mastra/core'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
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
const DEFAULT_CHUNK_SIZE = 1000
const DEFAULT_CHUNK_OVERLAP = 200
const DEFAULT_TOP_K = 4

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

/**
 * Interface for Mastra RAG source documents
 */
interface MastraRAGSource {
  content: string
  metadata?: Record<string, any>
  score?: number
}

/**
 * RAG System using Mastra's native capabilities
 * Leverages Mastra for:
 * - Automatic text chunking (RecursiveCharacterTextSplitter)
 * - Embedding generation (OpenAI)
 * - Vector storage (in-memory, can be upgraded to Postgres/Pinecone)
 * - Retrieval and generation
 */
export class RAGSystem {
  private config: Required<RAGConfig>
  private mastra: Mastra
  private rag: RAG | null = null

  constructor(config: RAGConfig) {
    this.config = {
      model: config.model || DEFAULT_MODEL,
      embeddingModel: config.embeddingModel || DEFAULT_EMBEDDING_MODEL,
      chunkSize: config.chunkSize || DEFAULT_CHUNK_SIZE,
      chunkOverlap: config.chunkOverlap || DEFAULT_CHUNK_OVERLAP,
      topK: config.topK || DEFAULT_TOP_K,
      openaiApiKey: config.openaiApiKey,
    }

    // Initialize Mastra with OpenAI provider
    this.mastra = new Mastra({
      providers: {
        openai: {
          apiKey: this.config.openaiApiKey,
        },
      },
    })
  }

  /**
   * Initialize RAG system (lazy initialization)
   */
  private async initializeRAG(): Promise<void> {
    if (this.rag) return

    // Create RAG instance with Mastra's built-in components
    // See: https://mastra.ai/docs/rag/chunking-and-embedding
    this.rag = new RAG({
      // Use Mastra's LLM abstraction
      llm: this.mastra.LLM({
        provider: 'OPEN_AI',
        name: this.config.model,
      }),
      // Use Mastra's embedding abstraction
      // See: https://mastra.ai/docs/rag/chunking-and-embedding
      embedder: this.mastra.Embedder({
        provider: 'OPEN_AI',
        name: this.config.embeddingModel,
      }),
      // Use Mastra's in-memory vector store
      // Can be upgraded to Postgres: https://mastra.ai/docs/rag/vector-databases
      vectorStore: this.mastra.VectorStore('IN_MEMORY'),
      // Configure chunking strategy
      // See: https://mastra.ai/docs/rag/chunking-and-embedding
      chunkConfig: {
        size: this.config.chunkSize,
        overlap: this.config.chunkOverlap,
      },
    })
  }

  /**
   * Index a document using Mastra's RAG system
   * Mastra handles chunking and embedding automatically
   */
  async indexDocument(doc: ParsedDocument): Promise<void> {
    await this.initializeRAG()
    if (!this.rag) throw new Error('RAG not initialized')

    // Mastra's RAG.ingest handles:
    // 1. Text chunking using RecursiveCharacterTextSplitter
    // 2. Embedding generation for each chunk
    // 3. Storage in vector store
    await this.rag.ingest([
      {
        content: doc.text,
        metadata: {
          fileName: doc.metadata.fileName,
          fileType: doc.metadata.fileType,
        },
      },
    ])
  }

  /**
   * Query the RAG system using Mastra's retrieval
   * See: https://mastra.ai/docs/rag/retrieval
   */
  async query(query: RAGQuery): Promise<RAGResult> {
    if (!this.rag) {
      throw new Error('No documents indexed. Call indexDocument first.')
    }

    const topK = query.topK || this.config.topK

    // Mastra's RAG.query handles:
    // 1. Query embedding generation
    // 2. Vector similarity search
    // 3. Context retrieval
    // 4. LLM generation with context
    const result = await this.rag.query({
      query: query.query,
      topK,
    })

    return {
      answer: result.answer,
      sources: result.sources.map((source: MastraRAGSource) => ({
        content: source.content,
        metadata: source.metadata || {},
        score: source.score || 0,
      })),
    }
  }

  /**
   * Stream a query response
   * Uses Mastra for retrieval, Vercel AI SDK for streaming
   */
  async *streamQuery(query: RAGQuery): AsyncGenerator<string> {
    if (!this.rag) {
      throw new Error('No documents indexed. Call indexDocument first.')
    }

    const topK = query.topK || this.config.topK

    // Use Mastra's retrieve method to get relevant chunks
    const sources = await this.rag.retrieve({
      query: query.query,
      topK,
    })

    // Build context from retrieved sources
    const context = sources
      .map((s: MastraRAGSource, i: number) => `[${i + 1}] ${s.content}`)
      .join('\n\n')

    const prompt = `Based on the following context, answer the question.

Context:
${context}

Question: ${query.query}

Answer:`

    // Use Vercel AI SDK for streaming (better than Mastra for this)
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
    if (!this.rag) {
      return {
        documentCount: 0,
        chunkCount: 0,
      }
    }

    // Get stats from Mastra's vector store
    const stats = await this.rag.getStats()
    return {
      documentCount: stats.documentCount || 0,
      chunkCount: stats.chunkCount || 0,
    }
  }

  /**
   * Clear all indexed documents
   */
  clear(): void {
    if (this.rag) {
      this.rag.clear()
    }
  }
}
