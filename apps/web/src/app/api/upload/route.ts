/**
 * File Upload API Route
 * Handles file uploads and initiates document processing
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), '../../sources/uploads')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      )
    }

    const sessionId = randomUUID()
    const sessionDir = path.join(UPLOAD_DIR, sessionId)
    
    // Create session directory
    await mkdir(sessionDir, { recursive: true })

    const uploadedFiles = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const filePath = path.join(sessionDir, file.name)
      await writeFile(filePath, buffer)
      
      uploadedFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        path: filePath,
      })
    }

    return NextResponse.json({
      success: true,
      sessionId,
      files: uploadedFiles,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}
