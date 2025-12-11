# Local PostgreSQL Development with PGlite

This guide explains how to use PGlite for local development without installing PostgreSQL.

## What is PGlite?

[PGlite](https://github.com/electric-sql/pglite) is a lightweight WASM-based PostgreSQL that runs entirely in-process. It's perfect for local development, testing, and demos.

**Benefits:**
- ✅ No PostgreSQL installation required
- ✅ No Docker needed
- ✅ Full PostgreSQL compatibility
- ✅ Works with Drizzle ORM
- ✅ Persistent data storage
- ✅ Fast startup (milliseconds)
- ✅ Perfect for development and testing

**Recommended by Drizzle team:** https://orm.drizzle.team/docs/get-started-postgresql#pglite

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

This will install `@electric-sql/pglite` automatically.

### 2. Choose Your Database Mode

#### Option A: PGlite (Recommended for Local Development)

Use PGlite for development without any external database:

**Update `apps/web/.env.local`:**
```bash
# Use PGlite for local development
USE_PGLITE=true

# Other settings
OPENAI_API_KEY=your_openai_api_key
```

**Or use the provided script:**
```bash
./scripts-new/setup-pglite.sh
```

PGlite will store data in `./pglite-data` directory automatically.

#### Option B: Regular PostgreSQL

If you prefer using PostgreSQL (Docker or local installation):

**Update `apps/web/.env.local`:**
```bash
# PostgreSQL connection
DATABASE_URL=postgresql://user:password@localhost:5432/paper2slides

# Other settings
OPENAI_API_KEY=your_openai_api_key
```

### 3. Initialize Database Schema

```bash
# Push schema to database (works with both PGlite and PostgreSQL)
pnpm db:push

# Or generate migrations
pnpm db:generate
```

### 4. Start Development

```bash
pnpm dev
```

## Using PGlite in Your Code

### Basic Usage

```typescript
import { createPGliteDB } from '@paper2slides/database/pglite'

// Create persistent database
const { db, client } = await createPGliteDB('./my-data')

// Use with Drizzle
const users = await db.select().from(schema.users)

// Close when done
await client.close()
```

### In-Memory Mode (Testing)

```typescript
import { createPGliteDB } from '@paper2slides/database/pglite'

// In-memory database (no persistence)
const { db, client } = await createPGliteDB(':memory:')

// Perfect for tests
const result = await db.insert(schema.users).values({ name: 'Test' })

await client.close()
```

### Default Instance

```typescript
import { getDefaultPGliteDB } from '@paper2slides/database/pglite'

// Get default instance (reuses connection)
const { db } = await getDefaultPGliteDB()

// Use it
const sessions = await db.select().from(schema.sessions)
```

## Database Management

### Drizzle Studio

View and manage your database with Drizzle Studio:

```bash
# For PGlite
pnpm db:studio:pglite

# For PostgreSQL
pnpm db:studio
```

### Migrations

```bash
# Generate migration files
pnpm db:generate

# Apply migrations (PostgreSQL)
pnpm db:migrate

# Push schema directly (works for both)
pnpm db:push
```

### Reset Database

```bash
# PGlite - just delete the data directory
rm -rf ./pglite-data

# PostgreSQL - drop and recreate
dropdb paper2slides
createdb paper2slides
pnpm db:push
```

## PGlite vs PostgreSQL Comparison

| Feature | PGlite | PostgreSQL |
|---------|--------|------------|
| Installation | None required | Required |
| Setup Time | Instant | Minutes |
| Startup Time | Milliseconds | Seconds |
| Memory Usage | Low (~20MB) | Medium (~50-100MB) |
| Performance | Fast (in-process) | Faster (dedicated) |
| Persistence | File-based | Server-based |
| Multi-client | Single process | Multiple clients |
| Production Ready | No | Yes |
| Perfect For | Dev, Testing | Production, Sharing |

## Switching Between PGlite and PostgreSQL

### Development → Production

1. **Develop with PGlite** locally for fast iteration
2. **Test with PostgreSQL** in Docker for integration testing
3. **Deploy with PostgreSQL** in production

### Configuration

```typescript
// packages/database/src/index.ts - Smart database selection
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { createPGliteDB } from './pglite'
import * as schema from './schema'

export async function getDB() {
  // Use PGlite for local development
  if (process.env.USE_PGLITE === 'true') {
    const { db } = await createPGliteDB()
    return db
  }
  
  // Use PostgreSQL for production/testing
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  
  const client = postgres(process.env.DATABASE_URL)
  return drizzle(client, { schema })
}
```

## Docker Compose (Optional)

If you want to use PostgreSQL with Docker for testing:

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: paper2slides
      POSTGRES_PASSWORD: password
      POSTGRES_DB: paper2slides
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# Start PostgreSQL
docker compose up -d postgres

# Update .env.local
DATABASE_URL=postgresql://paper2slides:password@localhost:5432/paper2slides

# Push schema
pnpm db:push
```

## Troubleshooting

### PGlite Issues

**Error: Cannot find module '@electric-sql/pglite'**
```bash
# Reinstall dependencies
pnpm install
```

**Error: Database locked**
```bash
# Another process is using the database
# Close other instances or use different data directory
```

**Slow performance**
```bash
# PGlite is in-process, shouldn't be slow
# Check if running in debug mode or with many extensions
```

### PostgreSQL Issues

**Connection refused**
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL
docker compose up postgres
# or
brew services start postgresql
```

**Authentication failed**
```bash
# Verify credentials in DATABASE_URL
# Check PostgreSQL pg_hba.conf settings
```

## Best Practices

### Development Workflow

1. **Local Development**: Use PGlite
   - Fast startup
   - No external dependencies
   - Easy to reset/test

2. **Integration Testing**: Use PostgreSQL in Docker
   - More realistic environment
   - Test connection pooling
   - Test concurrent access

3. **Production**: Use managed PostgreSQL
   - Better performance
   - Backups and monitoring
   - High availability

### Data Directory

```bash
# Add to .gitignore (already included)
pglite-data/
*.db

# Backup PGlite data
tar -czf backup.tar.gz pglite-data/

# Restore
tar -xzf backup.tar.gz
```

### Testing Strategy

```typescript
// test/setup.ts
import { createPGliteDB } from '@paper2slides/database/pglite'

export async function setupTestDB() {
  // Create in-memory database for each test
  const { db, client } = await createPGliteDB(':memory:')
  
  // Push schema
  // ... migration logic
  
  return { db, client }
}

export async function teardownTestDB(client: any) {
  await client.close()
}
```

## Resources

- [PGlite GitHub](https://github.com/electric-sql/pglite)
- [PGlite Documentation](https://pglite.dev)
- [Drizzle + PGlite Guide](https://orm.drizzle.team/docs/get-started-postgresql#pglite)
- [Electric SQL](https://electric-sql.com)

## Summary

**For most developers**: Use PGlite for local development. It's fast, easy, and requires no setup.

**For production**: Use PostgreSQL with proper backups, monitoring, and scaling.

**Best of both worlds**: Develop with PGlite, deploy with PostgreSQL.
