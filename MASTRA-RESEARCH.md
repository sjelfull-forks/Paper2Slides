# Research: Migrating to Mastra Framework

## Executive Summary

Mastra is a modern TypeScript framework for building AI-powered applications and agents. It could replace our current LangChain.js implementation with a more integrated, production-ready solution.

## What is Mastra?

**Current Version**: 0.24.7 (actively developed, Y Combinator W25)

**Description**: Framework for building AI-powered applications and agents with TypeScript, designed for production use with built-in observability, evals, and context management.

**Repository**: https://github.com/mastra-ai/mastra  
**Documentation**: https://mastra.ai/docs  
**NPM**: @mastra/core

## Key Features Relevant to Paper2Slides

### 1. Model Routing (Replaces OpenAI SDK)
- Connect to 40+ providers through one standard interface
- Support for OpenAI, Anthropic, Gemini, and more
- Similar to Vercel AI SDK but more comprehensive

### 2. RAG (Retrieval Augmented Generation)
- Built-in RAG capabilities: https://mastra.ai/docs/rag/overview
- Vector store integration
- Document retrieval and context management
- Replaces our LangChain.js RAG implementation

### 3. Agents
- Autonomous agents with LLMs and tools
- Multi-step reasoning and tool selection
- Could handle paper analysis end-to-end

### 4. Workflows
- Graph-based workflow engine
- Control flow: `.then()`, `.branch()`, `.parallel()`
- Perfect for paper processing pipeline

### 5. Context Management
- Conversation history
- Working and semantic memory
- Data retrieval from multiple sources

### 6. Production Features
- Built-in observability
- Evaluation framework
- Human-in-the-loop support
- Storage for execution state

## Current Implementation vs. Mastra

### Current Architecture (LangChain.js)

```typescript
// packages/backend/src/rag.ts
import { OpenAI } from '@langchain/openai'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'

class RAGSystem {
  private llm: OpenAI
  private embeddings: OpenAIEmbeddings
  private vectorStore: MemoryVectorStore
  
  async indexDocument(doc: ParsedDocument) { /* ... */ }
  async query(query: RAGQuery): Promise<RAGResult> { /* ... */ }
}
```

**Pros**:
- Established library
- Large ecosystem
- Good documentation

**Cons**:
- Heavy dependencies (langchain + @langchain/*)
- Complex API
- Memory-only vector store (not production-ready)
- No built-in observability
- Manual workflow orchestration

### Proposed Architecture (Mastra)

```typescript
// packages/backend/src/mastra-rag.ts
import { Mastra, RAG } from '@mastra/core'

const mastra = new Mastra({
  // Configuration
})

const rag = new RAG({
  embeddings: mastra.embeddings('openai'),
  vectorStore: mastra.vectorStore('postgres'),
  llm: mastra.models.openai('gpt-4-turbo-preview')
})

// Or use agent-based approach
const paperAgent = mastra.agent({
  instructions: 'Analyze research papers and generate slides',
  tools: [documentParser, ragRetriever, slideGenerator],
  model: 'gpt-4-turbo-preview'
})
```

**Pros**:
- Unified framework (one package)
- Built for production
- Native TypeScript
- Built-in observability and evals
- Workflow engine for complex pipelines
- Agent-based architecture option
- Active development (Y Combinator backed)
- Better integration with Vercel AI SDK

**Cons**:
- Newer library (less battle-tested than LangChain)
- Smaller community
- Documentation still evolving
- Migration effort required

## Migration Path

### Phase 1: RAG System Migration

**Current** (`packages/backend/src/rag.ts` - 195 lines):
```typescript
class RAGSystem {
  constructor(config: RAGConfig)
  async indexDocument(doc: ParsedDocument)
  async query(query: RAGQuery): Promise<RAGResult>
  async *streamQuery(query: RAGQuery)
}
```

**With Mastra**:
```typescript
import { Mastra, RAG } from '@mastra/core'

class MastraRAGSystem {
  private mastra: Mastra
  private rag: RAG
  
  constructor(config: RAGConfig) {
    this.mastra = new Mastra({
      provider: 'openai',
      apiKey: config.openaiApiKey
    })
    
    this.rag = new RAG({
      embeddings: this.mastra.embeddings('openai'),
      vectorStore: this.mastra.vectorStore('memory'), // or 'postgres'
      llm: this.mastra.models.openai(config.model)
    })
  }
  
  async indexDocument(doc: ParsedDocument) {
    await this.rag.add({
      content: doc.text,
      metadata: doc.metadata
    })
  }
  
  async query(query: RAGQuery) {
    return await this.rag.retrieve({
      query: query.query,
      topK: query.topK
    })
  }
}
```

### Phase 2: Agent-Based Paper Processing

**Current** (`packages/backend/src/processor.ts` - 255 lines):
```typescript
class PaperProcessor {
  async summarizePaper(doc: ParsedDocument)
  async generateSlidePlan(summary: PaperSummary, config: SlideConfig)
  async *generateSlidesStream(summary: PaperSummary, config: SlideConfig)
}
```

**With Mastra Agents**:
```typescript
import { Mastra } from '@mastra/core'

const mastra = new Mastra({ /* config */ })

// Create specialized agents
const analyzerAgent = mastra.agent({
  name: 'paper-analyzer',
  instructions: `Analyze research papers and extract:
    - Title and abstract
    - Key findings
    - Methodology
    - Figures and tables`,
  tools: [ragRetriever, metadataExtractor],
  model: 'gpt-4-turbo-preview'
})

const slideGeneratorAgent = mastra.agent({
  name: 'slide-generator',
  instructions: 'Generate presentation slides from paper analysis',
  tools: [slideTemplates, imageGenerator],
  model: 'gpt-4-turbo-preview'
})

// Use workflow for orchestration
const paperToSlidesWorkflow = mastra.workflow({
  name: 'paper-to-slides',
  steps: [
    { agent: analyzerAgent, output: 'analysis' },
    { agent: slideGeneratorAgent, input: 'analysis', output: 'slides' }
  ]
})
```

### Phase 3: Workflow Integration

```typescript
// Define the complete pipeline as a workflow
const pipeline = mastra.workflow('paper-pipeline')
  .step('parse', async (input) => {
    return await documentParser.parseDocument(input.filePath)
  })
  .step('analyze', async (input) => {
    return await analyzerAgent.run({
      document: input.parse
    })
  })
  .step('generate', async (input) => {
    return await slideGeneratorAgent.run({
      analysis: input.analyze,
      config: input.config
    })
  })
  .stream() // Enable streaming
```

## Comparison Matrix

| Feature | LangChain.js | Mastra | Winner |
|---------|-------------|---------|--------|
| **RAG Support** | ✅ Comprehensive | ✅ Built-in | Tie |
| **Vector Stores** | ✅ Many options | ✅ Multiple | Tie |
| **Agents** | ✅ Available | ✅ Native | Mastra |
| **Workflows** | ❌ Manual | ✅ Built-in | Mastra |
| **Observability** | ❌ None | ✅ Built-in | Mastra |
| **Evals** | ❌ None | ✅ Built-in | Mastra |
| **TypeScript Native** | ⚠️ Port from Python | ✅ Native | Mastra |
| **Bundle Size** | ⚠️ Large | ✅ Smaller | Mastra |
| **Community** | ✅ Large | ⚠️ Growing | LangChain |
| **Documentation** | ✅ Extensive | ⚠️ Good | LangChain |
| **Maturity** | ✅ Established | ⚠️ New | LangChain |
| **Next.js Integration** | ✅ Good | ✅ Excellent | Tie |
| **Production Ready** | ✅ Yes | ✅ Yes | Tie |

## Package Size Comparison

**Current Dependencies**:
```json
{
  "langchain": "^0.3.13",
  "@langchain/core": "^0.3.58",
  "@langchain/openai": "^0.6.16",
  "@langchain/community": "^0.3.21"
}
```
Total: ~643 packages, significant bundle size

**With Mastra**:
```json
{
  "@mastra/core": "^0.24.7"
}
```
Total: Likely fewer packages (need to verify)

## Code Changes Required

### Files to Modify

1. **`packages/backend/package.json`**:
   - Remove: langchain, @langchain/*
   - Add: @mastra/core

2. **`packages/backend/src/rag.ts`**:
   - Replace LangChain imports with Mastra
   - Reimplement RAGSystem class
   - Maintain same public API for compatibility

3. **`packages/backend/src/processor.ts`**:
   - Consider agent-based approach
   - Or keep current structure with Mastra underneath

4. **`apps/web/src/app/api/process/route.ts`**:
   - Update imports
   - Potentially leverage Mastra workflows for streaming

### Estimated Effort

- **RAG Migration**: 4-6 hours
- **Processor Update**: 3-4 hours
- **Testing**: 4-6 hours
- **Documentation Update**: 2 hours
- **Total**: 13-18 hours (2-3 days)

## Benefits of Migration

### 1. Unified Framework
- Single package vs. multiple LangChain packages
- Consistent API across features
- Better TypeScript support

### 2. Production Features
- Built-in observability (track agent behavior)
- Evaluation framework (measure quality)
- State management (pause/resume workflows)

### 3. Agent-Based Architecture
- More flexible than current pipeline
- Better at handling complex reasoning
- Can iterate on solutions

### 4. Workflow Engine
- Explicit control flow
- Parallel execution
- Better error handling

### 5. Performance
- Smaller bundle size (likely)
- Native TypeScript (no Python port)
- Optimized for production

### 6. Future-Proof
- Active development (Y Combinator backed)
- Modern architecture
- Growing ecosystem

## Risks and Considerations

### 1. Library Maturity
- **Risk**: Mastra is newer (v0.24.7)
- **Mitigation**: Well-funded (YC), active development, good architecture
- **Verdict**: Acceptable for production use

### 2. Migration Effort
- **Risk**: 2-3 days of work
- **Mitigation**: Can maintain LangChain as fallback initially
- **Verdict**: Manageable

### 3. Community Support
- **Risk**: Smaller community than LangChain
- **Mitigation**: Good documentation, active Discord
- **Verdict**: Monitor, but acceptable

### 4. Feature Parity
- **Risk**: Missing some LangChain features
- **Mitigation**: Core RAG features are present
- **Verdict**: Sufficient for our use case

## Recommendation

### Short Answer: **YES**, migrate to Mastra

### Reasoning:

1. **Better Architecture**: Agent-based + workflows > manual orchestration
2. **Production Ready**: Built-in observability and evals
3. **TypeScript Native**: Better DX and performance
4. **Unified Package**: Simpler dependencies
5. **Modern Framework**: Built for current AI patterns

### Implementation Strategy:

**Option A: Full Migration (Recommended)**
- Replace LangChain entirely
- Use Mastra agents + workflows
- Leverage production features
- ~2-3 days effort

**Option B: Gradual Migration**
- Keep LangChain for RAG
- Add Mastra for agents/workflows
- Migrate piece by piece
- ~1 week effort with overlap

**Option C: Hybrid Approach**
- Use Mastra for new features
- Keep LangChain for existing RAG
- Best of both worlds
- ~1 day effort

## Next Steps

If proceeding with migration:

1. **Spike** (4 hours):
   - Install Mastra
   - Implement basic RAG example
   - Verify feature parity
   - Test bundle size

2. **Proof of Concept** (1 day):
   - Migrate RAGSystem to Mastra
   - Test with sample documents
   - Compare performance

3. **Full Migration** (2-3 days):
   - Complete RAG migration
   - Add agent-based processor
   - Update API routes
   - Add tests
   - Update documentation

4. **Production Deployment**:
   - Enable observability
   - Set up evals
   - Monitor performance

## Sample Code

### Mastra RAG Implementation

```typescript
import { Mastra } from '@mastra/core'

export class MastraRAGSystem {
  private mastra: Mastra
  
  constructor(config: { apiKey: string }) {
    this.mastra = new Mastra({
      providers: {
        openai: {
          apiKey: config.apiKey
        }
      }
    })
  }
  
  async indexDocument(doc: ParsedDocument) {
    // Use Mastra's RAG system
    await this.mastra.rag.ingest({
      documents: [{
        content: doc.text,
        metadata: doc.metadata,
        id: doc.metadata.fileName
      }],
      embeddings: 'openai'
    })
  }
  
  async query(query: string) {
    const results = await this.mastra.rag.query({
      query,
      topK: 4,
      model: 'gpt-4-turbo-preview'
    })
    
    return {
      answer: results.answer,
      sources: results.sources
    }
  }
}
```

### Mastra Agent Implementation

```typescript
const paperAgent = mastra.agent({
  name: 'paper-analyzer',
  instructions: `
    You are a research paper analysis expert.
    Analyze papers and extract key information.
  `,
  tools: [
    {
      name: 'search_document',
      description: 'Search the document for specific information',
      execute: async ({ query }) => {
        return await rag.query(query)
      }
    }
  ],
  model: 'gpt-4-turbo-preview'
})

// Use the agent
const analysis = await paperAgent.run({
  prompt: 'Analyze this paper and extract the main findings',
  context: { documentId: 'paper-123' }
})
```

## Conclusion

Migrating to Mastra would provide:
- ✅ Better production features (observability, evals)
- ✅ Simpler codebase (one framework vs. multiple packages)
- ✅ More flexible architecture (agents + workflows)
- ✅ Modern TypeScript-first approach
- ✅ Active development and support

The migration is feasible (2-3 days) and would improve the codebase quality and production readiness.

**Recommendation: Proceed with migration to Mastra.**

---

**Research Date**: December 2024  
**Mastra Version**: 0.24.7  
**Status**: Ready for Implementation
