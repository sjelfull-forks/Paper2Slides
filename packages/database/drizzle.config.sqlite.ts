import type { Config } from 'drizzle-kit'

export default {
  schema: './src/schema-sqlite.ts',
  out: './drizzle-sqlite',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.SQLITE_DB_PATH || './sqlite.db',
  },
} satisfies Config
