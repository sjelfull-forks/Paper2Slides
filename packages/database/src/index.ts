/**
 * Database configuration with smart SQLite/PGlite/PostgreSQL selection
 * 
 * Priority order:
 * 1. DATABASE_URL is set → PostgreSQL (production)
 * 2. USE_PGLITE=true → PGlite (PostgreSQL-compatible, WASM-based)
 * 3. Default → SQLite (lightweight, file-based)
 * 
 * Environment variables:
 * - DATABASE_URL: PostgreSQL connection string (highest priority)
 * - USE_PGLITE: Set to 'true' to use PGlite instead of SQLite
 * - SQLITE_DB_PATH: Path to SQLite database file (default: './sqlite.db')
 */

// Determine which database to use
const hasPostgresURL = !!process.env.DATABASE_URL
const usePGlite = process.env.USE_PGLITE === 'true'

// Initialize database based on configuration
let db: any

if (hasPostgresURL) {
  // Priority 1: Use PostgreSQL if DATABASE_URL is set
  const { drizzle } = await import('drizzle-orm/postgres-js')
  const postgres = (await import('postgres')).default
  const schema = await import('./schema')
  
  const client = postgres(process.env.DATABASE_URL!)
  db = drizzle(client, { schema })
  console.log('✅ Using PostgreSQL database')
} else if (usePGlite) {
  // Priority 2: Use PGlite if explicitly requested
  const { getDefaultPGliteDB } = await import('./pglite')
  const pgliteInstance = await getDefaultPGliteDB()
  db = pgliteInstance.db
  console.log('✅ Using PGlite for local development')
} else {
  // Priority 3: Default to SQLite for local development
  const { getDefaultSQLiteDB } = await import('./sqlite')
  const sqliteInstance = getDefaultSQLiteDB()
  db = sqliteInstance.db
  console.log('✅ Using SQLite for local development (default)')
}

export { db }

// Export schemas based on database type
if (hasPostgresURL || usePGlite) {
  export * from './schema'
  export * from './pglite'
} else {
  export * from './schema-sqlite'
  export * from './sqlite'
}
