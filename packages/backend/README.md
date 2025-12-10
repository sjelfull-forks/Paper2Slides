# @paper2slides/backend

TypeScript implementation of the Paper2Slides backend, replacing Python components with TypeScript/Node.js equivalents.

## Overview

This package provides:
- **Document Parsing**: PDF, DOCX, XLSX, TXT, MD parsing
- **RAG System**: LangChain-based retrieval augmented generation
- **Paper Processing**: AI-powered paper summarization and slide generation
- **Streaming**: Real-time processing updates using Vercel AI SDK

## Python → TypeScript Mapping

| Python Component | TypeScript Equivalent | Library |
|------------------|----------------------|---------|
| MinerU (PDF parsing) | pdf-parse | npm: `pdf-parse` |
| python-docx | mammoth | npm: `mammoth` |
| openpyxl | xlsx | npm: `xlsx` |
| LightRAG | LangChain.js | npm: `langchain` |
| OpenAI SDK | Vercel AI SDK | npm: `ai`, `@ai-sdk/openai` |
| FastAPI | Next.js API Routes | Built-in |
| PIL/Pillow | sharp | npm: `sharp` |

## Features

### Document Parser
Supports multiple document formats:
- **PDF**: Text extraction using pdf-parse
- **Word (.docx)**: Text and formatting with mammoth
- **Excel (.xlsx)**: Data extraction with xlsx
- **Text (.txt, .md)**: Direct file reading

```typescript
import { DocumentParser } from '@paper2slides/backend'

const parser = new DocumentParser()
const doc = await parser.parseDocument('/path/to/file.pdf')

console.log(doc.text) // Extracted text
console.log(doc.metadata) // File metadata
console.log(doc.tables) // Extracted tables (if any)
```

### RAG System
LangChain-based retrieval system with OpenAI embeddings:

```typescript
import { RAGSystem } from '@paper2slides/backend'

const rag = new RAGSystem({
  openaiApiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4-turbo-preview',
  chunkSize: 1000,
  chunkOverlap: 200,
})

// Index documents
await rag.indexDocument(doc)

// Query
const result = await rag.query({
  query: 'What are the main findings?',
  topK: 4,
})

console.log(result.answer)
console.log(result.sources)
```

### Paper Processor
End-to-end paper processing pipeline:

```typescript
import { PaperProcessor } from '@paper2slides/backend'

const processor = new PaperProcessor(ragSystem)

// Summarize paper
const summary = await processor.summarizePaper(doc)

// Generate slides
const slides = await processor.generateSlidePlan(summary, {
  style: 'academic',
  length: 'medium',
  outputType: 'slides',
  fastMode: false,
})

// Stream generation
for await (const update of processor.generateSlidesStream(summary, config)) {
  console.log(update.type, update.data)
}
```

## API Integration

### Next.js API Routes

The package is designed to work seamlessly with Next.js API routes:

**Upload Endpoint** (`/api/upload`):
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const files = formData.getAll('files')
  // Save files and return session ID
}
```

**Processing Endpoint** (`/api/process`):
```typescript
import { DocumentParser, RAGSystem, PaperProcessor } from '@paper2slides/backend'

export async function POST(request: NextRequest) {
  const { sessionId, config } = await request.json()
  
  const parser = new DocumentParser()
  const rag = new RAGSystem({ openaiApiKey: process.env.OPENAI_API_KEY! })
  const processor = new PaperProcessor(rag)
  
  // Stream processing updates
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  })
}
```

## Advantages Over Python Backend

### 1. **Unified TypeScript Stack**
- Single language for frontend and backend
- Shared types and interfaces
- Better IDE support and type checking

### 2. **Performance**
- Node.js async I/O for better concurrency
- Streaming responses with minimal overhead
- Native integration with Next.js

### 3. **Deployment**
- Deploy as single Node.js application
- Vercel-native deployment
- No Python runtime required

### 4. **Developer Experience**
- Hot reload in development
- Better debugging tools
- Familiar npm ecosystem

## Configuration

Environment variables:
```bash
OPENAI_API_KEY=your_key_here
```

## Dependencies

Core dependencies:
- `ai` + `@ai-sdk/openai` - Vercel AI SDK
- `langchain` + `@langchain/openai` - RAG implementation
- `pdf-parse` - PDF parsing
- `mammoth` - Word document parsing
- `xlsx` - Excel parsing
- `sharp` - Image processing
- `zod` - Schema validation

## Future Enhancements

- [ ] OCR support with tesseract.js
- [ ] Image extraction from PDFs
- [ ] PowerPoint parsing
- [ ] Vector database integration (Pinecone, Supabase)
- [ ] Persistent RAG storage
- [ ] Multi-modal processing
- [ ] Advanced equation parsing

## Migration from Python

The TypeScript backend maintains feature parity with the Python version while providing:
- Same API interface
- Equivalent document parsing capabilities
- Compatible RAG functionality
- Enhanced streaming support

## License

MIT
