/**
 * RAG (Retrieval Augmented Generation) Implementation
 * TypeScript equivalent of Python's LightRAG
 * Uses LangChain.js + OpenAI + Vector Store
 */

import { OpenAI } from '@langchain/openai'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { Document } from 'langchain/document'
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

export class RAGSystem {
  private llm: OpenAI
  private embeddings: OpenAIEmbeddings
  private vectorStore: MemoryVectorStore | null = null
  private textSplitter: RecursiveCharacterTextSplitter
  private config: Required<RAGConfig>

  constructor(config: RAGConfig) {
    this.config = {
      model: config.model || DEFAULT_MODEL,
      embeddingModel: config.embeddingModel || DEFAULT_EMBEDDING_MODEL,
      chunkSize: config.chunkSize || 1000,
      chunkOverlap: config.chunkOverlap || 200,
      topK: config.topK || 4,
      openaiApiKey: config.openaiApiKey,
    }

    this.llm = new OpenAI({
      modelName: this.config.model,
      openAIApiKey: this.config.openaiApiKey,
      temperature: 0.7,
    })

    this.embeddings = new OpenAIEmbeddings({
      modelName: this.config.embeddingModel,
      openAIApiKey: this.config.openaiApiKey,
    })

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.config.chunkSize,
      chunkOverlap: this.config.chunkOverlap,
    })
  }

  /**
   * Index a document for RAG
   */
  async indexDocument(doc: ParsedDocument): Promise<void> {
    // Split text into chunks
    const chunks = await this.textSplitter.createDocuments(
      [doc.text],
      [{ fileName: doc.metadata.fileName, fileType: doc.metadata.fileType }]
    )

    // Create or update vector store
    if (!this.vectorStore) {
      this.vectorStore = await MemoryVectorStore.fromDocuments(chunks, this.embeddings)
    } else {
      await this.vectorStore.addDocuments(chunks)
    }
  }

  /**
   * Query the RAG system
   */
  async query(query: RAGQuery): Promise<RAGResult> {
    if (!this.vectorStore) {
      throw new Error('No documents indexed. Call indexDocument first.')
    }

    const topK = query.topK || this.config.topK

    // Retrieve relevant documents
    const results = await this.vectorStore.similaritySearchWithScore(query.query, topK)

    // Format sources
    const sources = results.map(([doc, score]) => ({
      content: doc.pageContent,
      metadata: doc.metadata,
      score,
    }))

    // Build context from retrieved documents
    const context = sources.map((s, i) => `[${i + 1}] ${s.content}`).join('\n\n')

    // Generate answer using LLM with context
    const prompt = `Based on the following context, answer the question.

Context:
${context}

Question: ${query.query}

Answer:`

    const answer = await this.llm.call(prompt)

    return {
      answer,
      sources,
    }
  }

  /**
   * Stream a query response
   */
  async *streamQuery(query: RAGQuery): AsyncGenerator<string> {
    if (!this.vectorStore) {
      throw new Error('No documents indexed. Call indexDocument first.')
    }

    const topK = query.topK || this.config.topK

    // Retrieve relevant documents
    const results = await this.vectorStore.similaritySearchWithScore(query.query, topK)

    // Build context
    const context = results.map(([doc], i) => `[${i + 1}] ${doc.pageContent}`).join('\n\n')

    const prompt = `Based on the following context, answer the question.

Context:
${context}

Question: ${query.query}

Answer:`

    // Stream response
    const stream = await this.llm.stream(prompt)

    for await (const chunk of stream) {
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
    if (!this.vectorStore) {
      return {
        documentCount: 0,
        chunkCount: 0,
      }
    }

    // Note: MemoryVectorStore doesn't expose document count directly
    // This is a simplified version
    return {
      documentCount: 1, // Approximate
      chunkCount: 0, // Would need to track separately
    }
  }

  /**
   * Clear all indexed documents
   */
  clear(): void {
    this.vectorStore = null
  }
}
