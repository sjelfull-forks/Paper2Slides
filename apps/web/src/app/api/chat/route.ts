import { NextRequest, NextResponse } from 'next/server'

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, config, conversationId } = body

    // For now, return a simple response
    // TODO: Integrate with Python backend for actual processing
    return NextResponse.json({
      message: 'Processing your request. This will integrate with the Python backend for paper processing.',
      sessionId: conversationId,
    })

    // In the future, this would proxy to the Python backend:
    // const response = await fetch(`${PYTHON_BACKEND_URL}/api/chat`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     message,
    //     content: config.content,
    //     output_type: config.output,
    //     style: config.style,
    //     length: config.length,
    //     density: config.density,
    //     fast_mode: config.fastMode,
    //     session_id: conversationId,
    //   }),
    // })
    //
    // const data = await response.json()
    // return NextResponse.json(data)
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
