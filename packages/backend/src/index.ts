/**
 * Backend Package - Main Export
 * TypeScript implementation of Paper2Slides backend
 */

export { DocumentParser, documentParser } from './parser'
export type { ParsedDocument } from './parser'

export { RAGSystem } from './rag'
export type { RAGConfig, RAGQuery, RAGResult } from './rag'

export { PaperProcessor } from './processor'
export type { PaperSummary, SlideConfig, SlideContent } from './processor'

// Re-export AI SDK types for convenience
export type { CoreMessage } from 'ai'
