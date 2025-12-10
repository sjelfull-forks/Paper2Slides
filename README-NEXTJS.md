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
- PostgreSQL 14 or later
- Python 3.12 (for paper processing backend)

### Installation

1. **Install dependencies:**

```bash
pnpm install
```

2. **Set up environment variables:**

Create `.env.local` in `apps/web/`:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/paper2slides

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Python Backend
PYTHON_BACKEND_URL=http://localhost:8000
```

3. **Set up the database:**

```bash
# Push schema to database
pnpm db:push

# Optional: Run Drizzle Studio to view database
pnpm db:studio
```

4. **Start Python backend (for paper processing):**

```bash
# In a separate terminal
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# Start the backend
python api/server.py
```

5. **Start the development server:**

```bash
pnpm dev
```

The Next.js app will be available at `http://localhost:3000`

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
pnpm db:push            # Push schema changes to database
pnpm db:studio          # Open Drizzle Studio

# Formatting
pnpm format             # Format code with Prettier
```

### Key Features

1. **Monorepo Architecture**: Uses Turborepo for efficient builds and caching
2. **Type-Safe Database**: Drizzle ORM provides end-to-end type safety
3. **Modern UI**: Built with shadcn/ui components and Tailwind CSS
4. **AI Integration**: Ready for Vercel AI SDK integration
5. **Hybrid Backend**: Next.js API routes + Python backend for heavy processing

### Database Schema

The application uses the following main tables:

- `sessions` - User sessions and processing status
- `uploads` - Uploaded files metadata
- `outputs` - Generated slides/posters
- `checkpoints` - Pipeline state for resuming

See `packages/database/src/schema.ts` for full schema definitions.

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
