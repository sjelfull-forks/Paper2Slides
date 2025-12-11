// Example: Using the database in your Next.js API routes
// Works with SQLite (default), PGlite, or PostgreSQL!

import { db } from '@paper2slides/database'
import { sessions, uploads } from '@paper2slides/database'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
  // Database works the same across all three options!
  // Connection is automatically managed based on environment:
  // - Default: SQLite (no config needed)
  // - USE_PGLITE=true: PGlite
  // - DATABASE_URL set: PostgreSQL
  
  try {
    // Query sessions
    const allSessions = await db.select().from(sessions)
    
    // Insert a new session
    const [newSession] = await db.insert(sessions).values({
      userId: 'user-123',
      status: 'pending',
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

// Example: Direct SQLite usage for advanced scenarios

import { createSQLiteDB } from '@paper2slides/database'

export function testDatabaseSQLite() {
  // Create an in-memory database for testing
  const { db: testDb, client } = createSQLiteDB(':memory:')
  
  try {
    // Use testDb for your tests
    const result = testDb.select().from(sessions).all()
    console.log('Test result:', result)
  } finally {
    // Always close the connection
    client.close()
  }
}

// Example: Custom SQLite database file

export function customDatabaseSQLite() {
  // Use a custom file for SQLite data
  const { db: customDb, client } = createSQLiteDB('./my-custom.db')
  
  // Use the database...
  
  client.close()
}

// Example: Direct PGlite usage for advanced scenarios

import { createPGliteDB } from '@paper2slides/database'

export async function testDatabasePGlite() {
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

// Example: Custom PGlite data directory

export async function customDatabasePGlite() {
  // Use a custom directory for PGlite data
  const { db: customDb, client } = await createPGliteDB('./my-custom-data')
  
  // Use the database...
  
  await client.close()
}

// Example: Switching databases with environment variables

/*
 * Set in apps/web/.env.local:
 *
 * # Option 1: SQLite (default, no config needed)
 * # Just don't set DATABASE_URL or USE_PGLITE
 *
 * # Option 2: PGlite (PostgreSQL-compatible)
 * USE_PGLITE=true
 *
 * # Option 3: PostgreSQL (production)
 * DATABASE_URL=postgresql://user:password@localhost:5432/paper2slides
 *
 * Your code stays the same! Just import and use:
 */

import { db } from '@paper2slides/database'
// Works with all three databases - no code changes needed!

