# Paper2Slides - Next.js Version

This is the modernized version of Paper2Slides built with:

- **Next.js 16** - React framework with App Router
- **Turbo repo** - Monorepo build system
- **Drizzle ORM** - Type-safe database ORM
- **PostgreSQL** - Database
- **Vercel AI SDK** - AI/LLM integrations
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## Project Structure

```
Paper2Slides/
├── apps/
│   └── web/                    # Next.js web application
│       ├── src/
│       │   ├── app/           # Next.js App Router pages & API routes
│       │   ├── components/    # React components
│       │   ├── hooks/         # Custom React hooks
│       │   └── lib/           # Utility functions
│       └── package.json
├── packages/
│   └── database/              # Shared database package
│       ├── src/
│       │   ├── schema.ts     # Drizzle schema definitions
│       │   └── index.ts      # Database exports
│       └── package.json
├── api/                       # Python FastAPI backend (for paper processing)
├── paper2slides/              # Python core library
├── frontend/                  # Legacy React frontend (deprecated)
├── package.json               # Root package.json
├── turbo.json                # Turborepo configuration
└── pnpm-workspace.yaml       # pnpm workspace configuration
```

## Getting Started

### Prerequisites

- Node.js 20 or later
- pnpm 9 or later
- **PostgreSQL 14+ OR PGlite** (PGlite recommended for local development - no installation needed!)
- Python 3.12 (optional - for legacy Python backend)

### Installation

1. **Install dependencies:**

```bash
pnpm install
```

2. **Set up environment variables:**

Choose between PGlite (recommended) or PostgreSQL:

#### Option A: PGlite (Recommended - No PostgreSQL needed!)

Use the automated setup script:

```bash
./scripts-new/setup-pglite.sh
```

Or manually create `apps/web/.env.local`:

```bash
# Use PGlite for local development
USE_PGLITE=true

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# File uploads
UPLOAD_DIR=./sources/uploads
OUTPUT_DIR=./outputs
```

#### Option B: PostgreSQL (Traditional)

Create `apps/web/.env.local`:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/paper2slides

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# File uploads
UPLOAD_DIR=./sources/uploads
OUTPUT_DIR=./outputs
```

3. **Set up the database:**

The schema is automatically initialized on first use with PGlite, or you can manually push:

```bash
# Push schema to database (works with both PGlite and PostgreSQL)
pnpm db:push

# Or for PGlite specifically
pnpm db:push:pglite

# Optional: Run Drizzle Studio to view/manage database
pnpm db:studio        # For PostgreSQL
pnpm db:studio:pglite # For PGlite
```

**📖 See [LOCAL-POSTGRES.md](./LOCAL-POSTGRES.md) for detailed PGlite setup and usage guide.**

4. **Start the development server:**

```bash
pnpm dev
```

The Next.js app will be available at `http://localhost:3000`

**Note:** Python backend is optional. The TypeScript backend now handles all functionality.

### Building for Production

```bash
# Build all packages
pnpm build

# Start production server
cd apps/web && pnpm start
```

## Development

### Running Commands

All commands are run from the root directory:

```bash
# Development
pnpm dev                 # Start all apps in development mode
pnpm dev --filter=web   # Start only the web app

# Building
pnpm build              # Build all packages
pnpm build --filter=web # Build only the web app

# Linting
pnpm lint               # Lint all packages

# Database
pnpm db:push              # Push schema to database
pnpm db:push:pglite       # Push schema to PGlite
pnpm db:studio            # Open Drizzle Studio (PostgreSQL)
pnpm db:studio:pglite     # Open Drizzle Studio (PGlite)
pnpm db:generate          # Generate migration files
pnpm db:generate:pglite   # Generate migration files (PGlite)

# Formatting
pnpm format             # Format code with Prettier
```

### Key Features

1. **Monorepo Architecture**: Uses Turborepo for efficient builds and caching
2. **Type-Safe Database**: Drizzle ORM provides end-to-end type safety
3. **Modern UI**: Built with shadcn/ui components and Tailwind CSS
4. **AI Integration**: Vercel AI SDK with Mastra framework
5. **TypeScript Backend**: Complete backend in TypeScript with RAG, document parsing
6. **Flexible Database**: PGlite for easy local dev, PostgreSQL for production
7. **No External Dependencies**: Run PGlite locally without Docker or PostgreSQL installation

### Database Schema

The application uses the following main tables:

- `sessions` - User sessions and processing status
- `uploads` - Uploaded files metadata
- `outputs` - Generated slides/posters
- `checkpoints` - Pipeline state for resuming

See `packages/database/src/schema.ts` for full schema definitions.

### Local Development with PGlite

**PGlite** is a lightweight WASM-based PostgreSQL perfect for local development:

- ✅ **No Installation**: No PostgreSQL or Docker needed
- ✅ **Fast**: Millisecond startup time
- ✅ **Compatible**: Full PostgreSQL compatibility
- ✅ **Persistent**: Data stored in `./pglite-data` directory
- ✅ **Drizzle Native**: Recommended by Drizzle team

**Quick Setup:**
```bash
./scripts-new/setup-pglite.sh
pnpm install
pnpm db:push
pnpm dev
```

**📖 Complete guide:** See [LOCAL-POSTGRES.md](./LOCAL-POSTGRES.md) for:
- Detailed setup instructions
- PGlite vs PostgreSQL comparison
- Switching between databases
- Testing strategies
- Troubleshooting

**When to use what:**
- **Local Development**: PGlite (recommended)
- **Integration Testing**: PostgreSQL in Docker
- **Production**: Managed PostgreSQL (Supabase, RDS, etc.)

### API Routes

Next.js API routes are located in `apps/web/src/app/api/`:

- `POST /api/chat` - Main chat endpoint (proxies to Python backend)

### Python Backend Integration

The Python backend handles the heavy lifting:

- Document parsing (PDF, Word, etc.)
- RAG indexing and querying
- Figure and table extraction
- Slide/poster generation

The Next.js app communicates with it via HTTP API calls.

## Contributing

This is a major architectural migration. Key areas that need work:

1. Complete API route implementations
2. Implement file upload handling
3. Add streaming AI responses with Vercel AI SDK
4. Migrate remaining React components
5. Add comprehensive tests
6. Create Docker deployment setup

## Migration Notes

This version represents a complete rewrite of the frontend architecture:

- **Old**: Vite + React + Vanilla JS
- **New**: Next.js + TypeScript + App Router

The Python backend remains largely unchanged and continues to handle paper processing.

## License

MIT License - see LICENSE file for details
