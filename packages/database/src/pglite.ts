import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import * as schema from './schema'

/**
 * PGlite database configuration for local development
 * 
 * PGlite is a lightweight WASM-based PostgreSQL that runs entirely in-process.
 * Perfect for:
 * - Local development without Docker/Postgres installation
 * - Testing
 * - Demos
 * - Development environments
 * 
 * Features:
 * - Zero external dependencies
 * - Full PostgreSQL compatibility
 * - Persistent data storage (default: ./pglite-data)
 * - Or in-memory mode for testing
 * 
 * @see https://github.com/electric-sql/pglite
 * @see https://orm.drizzle.team/docs/get-started-postgresql#pglite
 */

/**
 * Create a PGlite database instance
 * 
 * @param dataDir - Directory for persistent storage (default: './pglite-data')
 *                  Use ':memory:' for in-memory database (no persistence)
 * @returns Drizzle database instance configured with PGlite
 * 
 * @example
 * ```typescript
 * // Persistent database
 * const db = createPGliteDB('./my-data')
 * 
 * // In-memory database (for testing)
 * const testDb = createPGliteDB(':memory:')
 * ```
 */
export async function createPGliteDB(dataDir: string = './pglite-data') {
  // Create PGlite instance
  const client = new PGlite(dataDir)
  
  // Wait for database to be ready
  await client.waitReady
  
  // Create Drizzle instance
  const db = drizzle(client, { schema })
  
  return { db, client }
}

/**
 * Default PGlite database instance for local development
 * Uses persistent storage in './pglite-data' directory
 */
let _defaultDB: Awaited<ReturnType<typeof createPGliteDB>> | null = null

export async function getDefaultPGliteDB() {
  if (!_defaultDB) {
    _defaultDB = await createPGliteDB()
  }
  return _defaultDB
}

/**
 * Close PGlite database connection
 */
export async function closePGliteDB(instance?: Awaited<ReturnType<typeof createPGliteDB>>) {
  const db = instance || _defaultDB
  if (db) {
    await db.client.close()
    if (instance === _defaultDB) {
      _defaultDB = null
    }
  }
}

export * from './schema'
