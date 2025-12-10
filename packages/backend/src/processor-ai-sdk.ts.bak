/**
 * Paper Processing Pipeline
 * TypeScript implementation of paper2slides processing
 */

import { openai } from '@ai-sdk/openai'
import { generateText, streamText } from 'ai'
import type { ParsedDocument } from './parser'
import type { RAGSystem, RAGResult } from './rag'

export interface PaperSummary {
  title: string
  abstract: string
  keyFindings: string[]
  methodology: string
  figures: Array<{
    caption: string
    description: string
  }>
  tables: Array<{
    caption: string
    summary: string
  }>
}

export interface SlideConfig {
  style: 'academic' | 'doraemon' | string
  length: 'short' | 'medium' | 'long'
  outputType: 'slides' | 'poster'
  fastMode: boolean
  model?: string // Optional: specify which model to use
}

// Default model for slide generation
const DEFAULT_SLIDE_MODEL = 'gpt-4-turbo-preview'

export interface SlideContent {
  slideNumber: number
  title: string
  content: string[]
  imagePrompt?: string
}

export class PaperProcessor {
  private ragSystem: RAGSystem

  constructor(ragSystem: RAGSystem) {
    this.ragSystem = ragSystem
  }

  /**
   * Summarize a paper document
   */
  async summarizePaper(doc: ParsedDocument): Promise<PaperSummary> {
    // Index document in RAG
    await this.ragSystem.indexDocument(doc)

    // Extract different sections using RAG queries
    const titleResult = await this.ragSystem.query({
      query: 'What is the title of this paper?',
      topK: 2,
    })

    const abstractResult = await this.ragSystem.query({
      query: 'What is the abstract or summary of this paper?',
      topK: 3,
    })

    const findingsResult = await this.ragSystem.query({
      query: 'What are the main findings and contributions of this paper?',
      topK: 4,
    })

    const methodResult = await this.ragSystem.query({
      query: 'What methodology was used in this research?',
      topK: 3,
    })

    // Parse key findings
    const keyFindings = findingsResult.answer
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .slice(0, 5)

    return {
      title: titleResult.answer.trim(),
      abstract: abstractResult.answer.trim(),
      keyFindings,
      methodology: methodResult.answer.trim(),
      figures: doc.images?.map((img) => ({
        caption: img.caption || 'Figure',
        description: 'Image from document',
      })) || [],
      tables: doc.tables?.map((table) => ({
        caption: table.caption || 'Table',
        summary: `Table with ${table.data.length} rows`,
      })) || [],
    }
  }

  /**
   * Generate slide plan from paper summary
   */
  async generateSlidePlan(
    summary: PaperSummary,
    config: SlideConfig
  ): Promise<SlideContent[]> {
    const slideCount = this.getSlideCount(config.length)

    const prompt = `Create a slide plan for a ${config.outputType} presentation about this paper.

Paper Title: ${summary.title}
Abstract: ${summary.abstract}
Key Findings: ${summary.keyFindings.join(', ')}
Methodology: ${summary.methodology}

Generate ${slideCount} slides in ${config.style} style.

For each slide, provide:
1. Slide number
2. Title
3. Key points (3-5 bullet points)
4. Optional: Image generation prompt

Format as JSON array.`

    const { text } = await generateText({
      model: openai(config.model || DEFAULT_SLIDE_MODEL),
      prompt,
      temperature: 0.7,
    })

    // Parse the response
    try {
      const slides = JSON.parse(text)
      return slides
    } catch {
      // Fallback: create basic slides
      return this.createBasicSlidePlan(summary, slideCount)
    }
  }

  /**
   * Stream slide generation with progress updates
   */
  async *generateSlidesStream(
    summary: PaperSummary,
    config: SlideConfig
  ): AsyncGenerator<{
    type: 'plan' | 'slide' | 'complete'
    data: any
  }> {
    // Generate plan
    const plan = await this.generateSlidePlan(summary, config)
    yield { type: 'plan', data: plan }

    // Generate each slide
    for (const slide of plan) {
      yield {
        type: 'slide',
        data: {
          slideNumber: slide.slideNumber,
          title: slide.title,
          content: slide.content,
        },
      }

      // Small delay to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    yield { type: 'complete', data: { totalSlides: plan.length } }
  }

  /**
   * Generate slide content with AI SDK streaming
   */
  async *generateSlideContentStream(
    slidePrompt: string,
    model?: string
  ): AsyncGenerator<string> {
    const { textStream } = await streamText({
      model: openai(model || DEFAULT_SLIDE_MODEL),
      prompt: slidePrompt,
      temperature: 0.7,
    })

    for await (const chunk of textStream) {
      yield chunk
    }
  }

  /**
   * Get slide count based on length configuration
   */
  private getSlideCount(length: 'short' | 'medium' | 'long'): number {
    switch (length) {
      case 'short':
        return 8
      case 'medium':
        return 12
      case 'long':
        return 16
      default:
        return 12
    }
  }

  /**
   * Create a basic slide plan as fallback
   */
  private createBasicSlidePlan(summary: PaperSummary, count: number): SlideContent[] {
    const slides: SlideContent[] = [
      {
        slideNumber: 1,
        title: 'Title',
        content: [summary.title],
      },
      {
        slideNumber: 2,
        title: 'Abstract',
        content: [summary.abstract],
      },
    ]

    // Add methodology slide
    if (summary.methodology) {
      slides.push({
        slideNumber: slides.length + 1,
        title: 'Methodology',
        content: [summary.methodology],
      })
    }

    // Add findings slides
    summary.keyFindings.forEach((finding, i) => {
      if (slides.length < count - 1) {
        slides.push({
          slideNumber: slides.length + 1,
          title: `Finding ${i + 1}`,
          content: [finding],
        })
      }
    })

    // Add conclusion slide
    slides.push({
      slideNumber: slides.length + 1,
      title: 'Conclusion',
      content: ['Summary of key findings and contributions'],
    })

    return slides
  }
}
