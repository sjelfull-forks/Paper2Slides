import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema-sqlite'

/**
 * SQLite database configuration for local development
 * 
 * SQLite is a lightweight file-based database that runs entirely in-process.
 * Perfect for:
 * - Local development without Docker/Postgres installation
 * - Testing
 * - Demos
 * - Single-user applications
 * - Development environments
 * 
 * Features:
 * - Zero external dependencies (just a file)
 * - Fast and reliable
 * - Persistent data storage (default: ./sqlite.db)
 * - Or in-memory mode for testing
 * - ACID compliant
 * 
 * @see https://github.com/WiseLibs/better-sqlite3
 * @see https://orm.drizzle.team/docs/get-started-sqlite
 */

/**
 * Create a SQLite database instance
 * 
 * @param filename - Path to SQLite database file (default: './sqlite.db')
 *                   Use ':memory:' for in-memory database (no persistence)
 * @returns Drizzle database instance configured with SQLite
 * 
 * @example
 * ```typescript
 * // Persistent database
 * const db = createSQLiteDB('./my-data.db')
 * 
 * // In-memory database (for testing)
 * const testDb = createSQLiteDB(':memory:')
 * ```
 */
export function createSQLiteDB(filename: string = './sqlite.db') {
  // Create SQLite instance
  const client = new Database(filename)
  
  // Enable WAL mode for better concurrent access
  client.pragma('journal_mode = WAL')
  
  // Enable foreign keys
  client.pragma('foreign_keys = ON')
  
  // Create Drizzle instance
  const db = drizzle(client, { schema })
  
  return { db, client }
}

/**
 * Default SQLite database instance for local development
 * Uses persistent storage in './sqlite.db' file
 */
let _defaultDB: ReturnType<typeof createSQLiteDB> | null = null

export function getDefaultSQLiteDB() {
  if (!_defaultDB) {
    const dbPath = process.env.SQLITE_DB_PATH || './sqlite.db'
    _defaultDB = createSQLiteDB(dbPath)
  }
  return _defaultDB
}

/**
 * Close SQLite database connection
 */
export function closeSQLiteDB(instance?: ReturnType<typeof createSQLiteDB>) {
  const db = instance || _defaultDB
  if (db) {
    db.client.close()
    if (instance === _defaultDB) {
      _defaultDB = null
    }
  }
}

export * from './schema-sqlite'
