# Local Database Options

This guide explains the three database options available for Paper2Slides development.

## Quick Comparison

| Feature | SQLite | PGlite | PostgreSQL |
|---------|--------|--------|------------|
| **Installation** | ✅ None (built-in) | ✅ None (WASM) | ❌ Required |
| **Setup Time** | ⚡ Instant | ⚡ Instant | 🐢 5+ minutes |
| **File-based** | ✅ Yes (`.db` file) | ✅ Yes (`pglite-data/`) | ❌ No (server) |
| **PostgreSQL Compatible** | ❌ No | ✅ Yes (WASM) | ✅ Yes (native) |
| **Best For** | Simple dev, demos | PostgreSQL features | Production |
| **Performance** | ⚡ Fast | ⚡ Fast | ⚡⚡ Very fast |
| **Concurrent Users** | ⚠️ Limited | ⚠️ Limited | ✅ Unlimited |
| **Production Ready** | ⚠️ Single user only | ❌ No | ✅ Yes |

## Option 1: SQLite (Default) ⭐ RECOMMENDED FOR QUICK START

**SQLite** is the default database for Paper2Slides development. It's a lightweight, file-based database that requires zero setup.

### Benefits

- ✅ **Zero installation** - Works immediately after `pnpm install`
- ✅ **Single file** - All data in one `.db` file
- ✅ **Fast** - Optimized for single-user access
- ✅ **Portable** - Copy the `.db` file to backup/share
- ✅ **Perfect for**:
  - Quick start development
  - Demos and prototypes
  - Learning the codebase
  - Local testing

### Quick Start

```bash
# Automated setup (recommended)
./scripts-new/setup-sqlite.sh

# Manual setup
pnpm install
pnpm --filter @paper2slides/database db:push:sqlite
pnpm dev
```

### Configuration

SQLite works with **no configuration** by default. Optional settings:

**`apps/web/.env.local`:**
```bash
# SQLite is the default - no config needed!

# Optional: Custom database file location
# SQLITE_DB_PATH=./my-custom.db

# Optional: In-memory database (testing only)
# SQLITE_DB_PATH=:memory:
```

### Usage

```typescript
import { db } from '@paper2slides/database'
import { sessions } from '@paper2slides/database'

// Works the same as PostgreSQL/PGlite!
const allSessions = await db.select().from(sessions)
```

### Database Management

```bash
# Push schema changes
pnpm --filter @paper2slides/database db:push:sqlite

# Open Drizzle Studio (visual database editor)
pnpm --filter @paper2slides/database db:studio:sqlite

# Generate migrations
pnpm --filter @paper2slides/database db:generate:sqlite
```

### Data Location

- **Default**: `./sqlite.db` in project root
- **Custom**: Set `SQLITE_DB_PATH` environment variable
- **Backup**: Just copy the `.db` file

### When to Use SQLite

✅ **Use SQLite when:**
- Starting development for the first time
- Building demos or prototypes
- Testing features locally
- Working offline
- Want the simplest setup

❌ **Don't use SQLite when:**
- Deploying to production (use PostgreSQL)
- Need concurrent users (use PostgreSQL)
- Need full PostgreSQL features (use PGlite or PostgreSQL)

---

## Option 2: PGlite (PostgreSQL-Compatible)

**PGlite** is a WASM-based PostgreSQL that runs entirely in-process. Use it when you need PostgreSQL compatibility without installation.

### Benefits

- ✅ **Zero installation** - No Docker or PostgreSQL needed
- ✅ **Full PostgreSQL** - 100% PostgreSQL compatibility
- ✅ **WASM-based** - Runs in Node.js process
- ✅ **Fast startup** - Milliseconds vs minutes
- ✅ **Perfect for**:
  - PostgreSQL-specific features (arrays, jsonb, etc.)
  - Testing PostgreSQL queries locally
  - Ensuring production compatibility

### Quick Start

```bash
# Automated setup
./scripts-new/setup-pglite.sh

# Manual setup
echo "USE_PGLITE=true" > apps/web/.env.local
pnpm install
pnpm --filter @paper2slides/database db:push:pglite
pnpm dev
```

### Configuration

**`apps/web/.env.local`:**
```bash
# Enable PGlite
USE_PGLITE=true

# Optional: Custom data directory
# PGLITE_DATA_DIR=./my-pglite-data

# Optional: In-memory mode (testing)
# PGLITE_DATA_DIR=:memory:
```

### Database Management

```bash
# Push schema changes
pnpm --filter @paper2slides/database db:push:pglite

# Open Drizzle Studio
pnpm --filter @paper2slides/database db:studio:pglite

# Generate migrations
pnpm --filter @paper2slides/database db:generate:pglite
```

### Data Location

- **Default**: `./pglite-data/` directory
- **Custom**: Set `PGLITE_DATA_DIR` environment variable
- **Backup**: Copy the entire `pglite-data/` directory

### When to Use PGlite

✅ **Use PGlite when:**
- Need PostgreSQL-specific features
- Want to test PostgreSQL queries
- Preparing for PostgreSQL deployment
- Need better PostgreSQL compatibility than SQLite

❌ **Don't use PGlite when:**
- Want the simplest option (use SQLite)
- Deploying to production (use PostgreSQL)
- Need maximum performance (use PostgreSQL)

---

## Option 3: PostgreSQL (Production)

**PostgreSQL** is a production-grade database server. Use it for production deployments or when you need full PostgreSQL features.

### Benefits

- ✅ **Production-grade** - Battle-tested at scale
- ✅ **Concurrent users** - Handles many connections
- ✅ **Advanced features** - Full SQL support
- ✅ **Scalable** - Grows with your application
- ✅ **Perfect for**:
  - Production deployments
  - Integration testing
  - Multi-user development

### Quick Start

**Option A: Docker (Recommended)**

```bash
# Start PostgreSQL with Docker
docker run -d \
  --name paper2slides-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=paper2slides \
  -p 5432:5432 \
  postgres:16

# Configure environment
echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/paper2slides" > apps/web/.env.local

# Setup database
pnpm install
pnpm --filter @paper2slides/database db:push
pnpm dev
```

**Option B: Local PostgreSQL**

```bash
# Install PostgreSQL (macOS)
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb paper2slides

# Configure
echo "DATABASE_URL=postgresql://localhost/paper2slides" > apps/web/.env.local

# Setup
pnpm install
pnpm --filter @paper2slides/database db:push
pnpm dev
```

### Configuration

**`apps/web/.env.local`:**
```bash
# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/paper2slides

# Don't set USE_PGLITE when using PostgreSQL
```

### Database Management

```bash
# Push schema changes
pnpm --filter @paper2slides/database db:push

# Open Drizzle Studio
pnpm --filter @paper2slides/database db:studio

# Generate migrations
pnpm --filter @paper2slides/database db:generate
```

### When to Use PostgreSQL

✅ **Use PostgreSQL when:**
- Deploying to production
- Need multi-user support
- Want maximum performance
- Building integration tests

❌ **Don't use PostgreSQL when:**
- Just starting development (use SQLite)
- Want quick setup (use SQLite or PGlite)

---

## Switching Between Databases

You can easily switch between databases by changing your environment variables:

### SQLite → PGlite

```bash
# apps/web/.env.local
# Remove/comment any DATABASE_URL
USE_PGLITE=true
```

### SQLite → PostgreSQL

```bash
# apps/web/.env.local
DATABASE_URL=postgresql://user:password@localhost:5432/paper2slides
# Don't set USE_PGLITE
```

### PGlite → SQLite

```bash
# apps/web/.env.local
# Remove/comment USE_PGLITE
# Remove/comment DATABASE_URL
# (SQLite is the default)
```

### PGlite → PostgreSQL

```bash
# apps/web/.env.local
DATABASE_URL=postgresql://user:password@localhost:5432/paper2slides
# Remove/comment USE_PGLITE
```

---

## Database Decision Tree

```
┌─────────────────────────────────┐
│ What database should I use?     │
└────────────┬────────────────────┘
             │
             ▼
    ┌────────────────────┐
    │ Is this production?│
    └────────┬───────────┘
             │
      ┌──────┴──────┐
      │ Yes         │ No
      ▼             ▼
┌─────────────┐   ┌──────────────────────────┐
│ PostgreSQL  │   │ Need PostgreSQL features?│
└─────────────┘   └──────┬───────────────────┘
                         │
                  ┌──────┴──────┐
                  │ Yes         │ No
                  ▼             ▼
            ┌──────────┐   ┌──────────┐
            │ PGlite   │   │ SQLite ⭐│
            └──────────┘   └──────────┘
```

---

## Recommended Workflow

| Stage | Database | Why |
|-------|----------|-----|
| **Local Dev** | SQLite | Fastest setup, simplest |
| **Testing PostgreSQL Queries** | PGlite | PostgreSQL compatible |
| **Integration Tests** | PostgreSQL (Docker) | Production-like |
| **Staging** | PostgreSQL | Same as production |
| **Production** | PostgreSQL | Battle-tested, scalable |

---

## Troubleshooting

### SQLite Issues

**Problem**: Database locked error

```bash
# Check for stale connections
lsof ./sqlite.db

# Remove WAL files
rm -f ./sqlite.db-shm ./sqlite.db-wal
```

**Problem**: Schema out of sync

```bash
# Rebuild database
rm ./sqlite.db
pnpm --filter @paper2slides/database db:push:sqlite
```

### PGlite Issues

**Problem**: PGlite fails to start

```bash
# Clear data and restart
rm -rf ./pglite-data
pnpm --filter @paper2slides/database db:push:pglite
```

### PostgreSQL Issues

**Problem**: Connection refused

```bash
# Check if PostgreSQL is running (Docker)
docker ps | grep postgres

# Or check local PostgreSQL
pg_isready
```

**Problem**: Authentication failed

```bash
# Verify connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

---

## Examples

### Using the Database in Code

The API is identical regardless of which database you're using:

```typescript
import { db } from '@paper2slides/database'
import { sessions, uploads, outputs } from '@paper2slides/database'

// Create a session
const [newSession] = await db.insert(sessions).values({
  userId: 'user-123',
  status: 'pending',
}).returning()

// Query sessions
const userSessions = await db.select()
  .from(sessions)
  .where(eq(sessions.userId, 'user-123'))

// Join tables
const sessionsWithUploads = await db.select()
  .from(sessions)
  .leftJoin(uploads, eq(uploads.sessionId, sessions.id))

// Update
await db.update(sessions)
  .set({ status: 'completed' })
  .where(eq(sessions.id, sessionId))

// Delete
await db.delete(sessions)
  .where(eq(sessions.id, sessionId))
```

---

## Additional Resources

**SQLite:**
- [SQLite Website](https://www.sqlite.org/)
- [better-sqlite3 (Node.js driver)](https://github.com/WiseLibs/better-sqlite3)
- [Drizzle SQLite Guide](https://orm.drizzle.team/docs/get-started-sqlite)

**PGlite:**
- [PGlite GitHub](https://github.com/electric-sql/pglite)
- [Drizzle PGlite Guide](https://orm.drizzle.team/docs/get-started-postgresql#pglite)

**PostgreSQL:**
- [PostgreSQL Website](https://www.postgresql.org/)
- [Drizzle PostgreSQL Guide](https://orm.drizzle.team/docs/get-started-postgresql)

---

## Summary

- **SQLite** (Default): Fastest setup, perfect for getting started ⭐
- **PGlite**: PostgreSQL compatibility without installation
- **PostgreSQL**: Production-grade, full SQL features

Choose SQLite to get started quickly, then switch to PostgreSQL for production!
