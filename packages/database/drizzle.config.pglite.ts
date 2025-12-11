import { defineConfig } from 'drizzle-kit'

/**
 * Drizzle configuration for PGlite (local development)
 * 
 * Usage:
 * - Generate migrations: drizzle-kit generate --config=drizzle.config.pglite.ts
 * - Push schema: drizzle-kit push --config=drizzle.config.pglite.ts
 * - Studio: drizzle-kit studio --config=drizzle.config.pglite.ts
 */
export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  driver: 'pglite',
  dbCredentials: {
    url: './pglite-data',
  },
})
