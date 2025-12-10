/**
 * Document Parser - TypeScript implementation
 * Replaces Python's MinerU parser with TypeScript alternatives
 */

import fs from 'fs/promises'
import path from 'path'
import PDFParser from 'pdf-parse'
import mammoth from 'mammoth'
import * as XLSX from 'xlsx'
import { createReadStream } from 'fs'

export interface ParsedDocument {
  text: string
  metadata: {
    fileName: string
    fileType: string
    pageCount?: number
    wordCount: number
  }
  images?: Array<{
    base64: string
    mimeType: string
    caption?: string
  }>
  tables?: Array<{
    data: string[][]
    caption?: string
  }>
}

export class DocumentParser {
  /**
   * Parse a document file (PDF, DOCX, XLSX, etc.)
   */
  async parseDocument(filePath: string): Promise<ParsedDocument> {
    const ext = path.extname(filePath).toLowerCase()
    const fileName = path.basename(filePath)

    switch (ext) {
      case '.pdf':
        return this.parsePDF(filePath, fileName)
      case '.docx':
      case '.doc':
        return this.parseWord(filePath, fileName)
      case '.xlsx':
      case '.xls':
        return this.parseExcel(filePath, fileName)
      case '.txt':
      case '.md':
        return this.parseText(filePath, fileName)
      default:
        throw new Error(`Unsupported file type: ${ext}`)
    }
  }

  /**
   * Parse PDF document
   */
  private async parsePDF(filePath: string, fileName: string): Promise<ParsedDocument> {
    const dataBuffer = await fs.readFile(filePath)
    const data = await PDFParser(dataBuffer)

    return {
      text: data.text,
      metadata: {
        fileName,
        fileType: 'pdf',
        pageCount: data.numpages,
        wordCount: data.text.split(/\s+/).length,
      },
    }
  }

  /**
   * Parse Word document
   */
  private async parseWord(filePath: string, fileName: string): Promise<ParsedDocument> {
    const result = await mammoth.extractRawText({ path: filePath })
    const text = result.value

    return {
      text,
      metadata: {
        fileName,
        fileType: 'docx',
        wordCount: text.split(/\s+/).length,
      },
    }
  }

  /**
   * Parse Excel spreadsheet
   */
  private async parseExcel(filePath: string, fileName: string): Promise<ParsedDocument> {
    const workbook = XLSX.readFile(filePath)
    let text = ''
    const tables: Array<{ data: string[][]; caption?: string }> = []

    // Extract text from all sheets
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName]
      const csv = XLSX.utils.sheet_to_csv(sheet)
      text += `\n\n## Sheet: ${sheetName}\n\n${csv}`

      // Convert to 2D array for table data
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][]
      if (jsonData.length > 0) {
        tables.push({
          data: jsonData,
          caption: sheetName,
        })
      }
    })

    return {
      text,
      metadata: {
        fileName,
        fileType: 'xlsx',
        wordCount: text.split(/\s+/).length,
      },
      tables,
    }
  }

  /**
   * Parse plain text or markdown
   */
  private async parseText(filePath: string, fileName: string): Promise<ParsedDocument> {
    const text = await fs.readFile(filePath, 'utf-8')

    return {
      text,
      metadata: {
        fileName,
        fileType: path.extname(filePath).slice(1),
        wordCount: text.split(/\s+/).length,
      },
    }
  }

  /**
   * Extract images from document (for future implementation with OCR)
   */
  async extractImages(filePath: string): Promise<string[]> {
    // TODO: Implement image extraction
    // For PDFs: use pdf-lib or pdf.js
    // For now, return empty array
    return []
  }
}

export const documentParser = new DocumentParser()
