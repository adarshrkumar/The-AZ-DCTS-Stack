# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The ATSDC Stack is a full-stack web application framework built with Astro, TypeScript, SCSS, Drizzle ORM, and Clerk. It's designed as both a production-ready template and a CLI tool for scaffolding new projects.

This is a monorepo with two main parts:
- **Root**: CLI tool for scaffolding new projects (`create-atsdc-stack`)
- **app/**: The actual Astro application template

## Development Commands

### Root Directory Commands

These commands can be run from the root directory (they delegate to the app workspace):

```bash
npm run dev              # Start dev server at http://localhost:4321
npm run build            # Type-check and build for production
npm run preview          # Preview production build locally
```

### App Directory Commands

Database commands should be run from the `app/` directory:

```bash
cd app

npm run db:push          # Push schema changes to database (no migrations)
npm run db:generate      # Generate migration files from schema
npm run db:migrate       # Apply pending migrations
npm run db:studio        # Open Drizzle Studio GUI for database
```

## Architecture Overview

### Database Layer (Drizzle ORM)

**Key files:**
- `app/src/db/schema.ts` - Table definitions using Drizzle ORM
- `app/src/db/validations.ts` - Zod schemas for runtime validation
- `app/src/db/initialize.ts` - Database client initialization and utilities
- `app/drizzle.config.ts` - Drizzle Kit configuration

**Important patterns:**
- Uses **NanoID** (21 chars) for all primary keys, not UUIDs or auto-increment
- All IDs are `varchar(21)` with `.$defaultFn(() => nanoid())`
- TypeScript types are inferred: `typeof posts.$inferSelect` and `typeof posts.$inferInsert`
- Zod validation schemas mirror database schemas but add runtime validation
- Use `@vercel/postgres` for connection pooling, wrapped by Drizzle

### API Routes

**Location:** `app/src/pages/api/`

**Pattern:** Each file exports HTTP methods as named exports:
```typescript
export const GET: APIRoute = async ({ request, url }) => { ... }
export const POST: APIRoute = async ({ request }) => { ... }
export const PUT: APIRoute = async ({ request }) => { ... }
export const DELETE: APIRoute = async ({ request, url }) => { ... }
```

**Key conventions:**
1. Always validate inputs with Zod schemas from `validations.ts`
2. Return JSON responses with proper status codes (200, 201, 400, 404, 500)
3. Handle `ZodError` separately from generic errors
4. Use Drizzle query builder, not raw SQL
5. For query params, use `url.searchParams.get()` and validate with Zod

**Example:** See `app/src/pages/api/posts.ts` for complete CRUD implementation

### AI Integration (Vercel AI SDK v5+)

**Location:** `app/src/pages/api/chat.ts`

**Key pattern:** Uses AI Gateway - no provider-specific packages needed!
```typescript
import { streamText } from 'ai';

const result = streamText({
  model: 'openai/gpt-4o',  // or 'anthropic/claude-3-5-sonnet-20241022'
  messages: validatedData.messages,
  apiKey: process.env.OPENAI_API_KEY,  // Pass the appropriate API key
});

return result.toDataStreamResponse();
```

**Supported formats:** `openai/`, `anthropic/`, `google/`, etc.

### SCSS Architecture

**Critical rules:**
1. **NO inline `<style>` tags** in `.astro` files (except truly standalone components)
2. **NO utility classes** - use semantic class names (`.btn`, `.card`, not `.px-4`)
3. All styles in external `.scss` files under `app/src/styles/`
4. Component styles: `app/src/styles/components/`
5. Page styles: `app/src/styles/pages/`
6. Global variables auto-imported via Vite config: `@use "@/styles/variables/globals.scss" as *;`

**Import pattern in .astro files:**
```astro
---
import '@/styles/components/button.scss';
import '@/styles/pages/example.scss';
---
```

**Styling modifiers (in order of preference):**
1. Data attributes: `<button class="btn" data-variant="primary" data-size="lg">`
2. Class chaining: `<button class="btn primary lg">`

**SCSS organization:**
- `variables/globals.scss` - Colors, spacing, typography
- `variables/mixins.scss` - Reusable mixins like `@include flex-center`
- `reset.scss` - CSS reset
- `global.scss` - Global base styles

### TypeScript Path Aliases

Configured in `app/tsconfig.json`:
```json
{
  "@/*": ["src/*"],
  "@db/*": ["src/db/*"],
  "@styles/*": ["src/styles/*"],
  "@components/*": ["src/components/*"]
}
```

**Usage:**
```typescript
import { db } from '@/db/initialize';
import { posts } from '@/db/schema';
import '@/styles/components/card.scss';
```

### Authentication (Clerk)

- Pre-configured in `app/astro.config.mjs`
- Middleware: Create `app/src/middleware.ts` with `clerkMiddleware()` to protect routes
- User IDs stored as `authorId` in database (varchar 255)
- React components available via `@clerk/clerk-react`

### Progressive Web App (PWA)

- Configured via `vite-plugin-pwa` in `astro.config.mjs`
- Auto-updates enabled (`registerType: 'autoUpdate'`)
- Manifest and service worker auto-generated
- Assets should be in `app/public/` (pwa-192x192.png, pwa-512x512.png)

## Environment Variables

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `OPENAI_API_KEY` - OpenAI API key (for AI features)

**Setup:** Copy `.env.example` to `.env` and fill in values

## Key Design Decisions

1. **NanoID over UUID/auto-increment:** URL-safe, shorter, equally collision-resistant
2. **Vercel Postgres over node-postgres:** Better connection pooling for serverless
3. **Drizzle over Prisma:** Closer to SQL, better TypeScript inference, lighter weight
4. **Zod validation separate from schema:** Allows different validation rules for create/update operations
5. **SCSS over Tailwind:** Enforces semantic naming, better for large teams and maintainability
6. **Astro server mode:** Enables API routes and dynamic rendering with Vercel adapter

## Common Patterns

### Creating a new database table

1. Define schema in `app/src/db/schema.ts` using NanoID for primary key
2. Create Zod schemas in `app/src/db/validations.ts` for create/update operations
3. Export TypeScript types: `export type MyModel = typeof myTable.$inferSelect`
4. Push to database: `npm run db:push` (dev) or `npm run db:generate && npm run db:migrate` (prod)

### Creating a new API route

1. Create file in `app/src/pages/api/[name].ts`
2. Export named HTTP method handlers: `GET`, `POST`, `PUT`, `DELETE`
3. Validate inputs with Zod schemas
4. Use Drizzle ORM for database operations
5. Return JSON responses with proper error handling

### Adding new styles

1. Create `.scss` file in appropriate location (`components/` or `pages/`)
2. Import in `.astro` component: `import '@/styles/components/mycomponent.scss'`
3. Use semantic class names with data attributes for modifiers
4. Access global variables/mixins automatically (via Vite config)

## Testing Database Connection

```typescript
import { getDatabaseHealth } from '@/db/initialize';

const health = await getDatabaseHealth();
// Returns: { connected: boolean, tablesExist: boolean, timestamp: Date }
```

## Deployment

Configured for **Vercel** deployment with:
- Adapter: `@astrojs/vercel` (serverless mode)
- Build command: `npm run build`
- Output directory: `app/dist/`
- Environment variables must be set in Vercel project settings

## Workspace Structure

This is an npm workspace:
- Root `package.json` contains CLI tooling and workspace configuration
- `app/package.json` contains the Astro application dependencies
- Commands run from root are proxied to the app workspace via `--workspace=app`
