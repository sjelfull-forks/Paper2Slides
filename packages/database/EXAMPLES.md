// Example: Using PGlite in your Next.js API routes

import { db } from '@paper2slides/database'
import { sessions, uploads } from '@paper2slides/database/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
  // Database works the same whether using PGlite or PostgreSQL!
  // The connection is automatically managed based on USE_PGLITE env var
  
  try {
    // Query sessions
    const allSessions = await db.select().from(sessions)
    
    // Insert a new session
    const [newSession] = await db.insert(sessions).values({
      userId: 'user-123',
      status: 'active',
      createdAt: new Date(),
    }).returning()
    
    // Update session
    await db.update(sessions)
      .set({ status: 'completed' })
      .where(eq(sessions.id, newSession.id))
    
    // Delete session
    await db.delete(sessions)
      .where(eq(sessions.id, newSession.id))
    
    return Response.json({ sessions: allSessions })
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: 'Database error' }, { status: 500 })
  }
}

// Example: Direct PGlite usage for advanced scenarios

import { createPGliteDB } from '@paper2slides/database/pglite'

export async function testDatabase() {
  // Create an in-memory database for testing
  const { db: testDb, client } = await createPGliteDB(':memory:')
  
  try {
    // Use testDb for your tests
    const result = await testDb.select().from(sessions)
    console.log('Test result:', result)
  } finally {
    // Always close the connection
    await client.close()
  }
}

// Example: Custom data directory

export async function customDatabase() {
  // Use a custom directory for PGlite data
  const { db: customDb, client } = await createPGliteDB('./my-custom-data')
  
  // Use the database...
  
  await client.close()
}
