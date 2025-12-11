import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

/**
 * Database configuration with smart PGlite/PostgreSQL selection
 * 
 * Set USE_PGLITE=true in environment to use PGlite for local development
 * Otherwise, uses PostgreSQL via DATABASE_URL
 */

// Check if we should use PGlite
const usePGlite = process.env.USE_PGLITE === 'true'

if (!usePGlite && !process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set. ' +
    'Either set DATABASE_URL or set USE_PGLITE=true for local development. ' +
    'See LOCAL-POSTGRES.md for setup instructions.'
  )
}

// Initialize database based on configuration
let db: ReturnType<typeof drizzle>

if (usePGlite) {
  // Use PGlite for local development
  // Dynamic import to avoid loading PGlite in production
  const { getDefaultPGliteDB } = await import('./pglite')
  const pgliteInstance = await getDefaultPGliteDB()
  db = pgliteInstance.db
  console.log('✅ Using PGlite for local development')
} else {
  // Use PostgreSQL
  const client = postgres(process.env.DATABASE_URL!)
  db = drizzle(client, { schema })
  console.log('✅ Using PostgreSQL database')
}

export { db }
export * from './schema'
export * from './pglite'
