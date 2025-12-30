# ATSDC Stack

A production-ready, full-stack web application framework combining the best modern technologies for building secure, type-safe, and AI-ready web applications.

## 🚀 Stack Overview

The **ATSDC Stack** is a carefully curated combination of modern web technologies:

- **A** - [Astro](https://astro.build) - Lightning-fast static site generation with dynamic capabilities
- **T** - [TypeScript](https://www.typescriptlang.org) - Full type safety across your entire application
- **S** - [SCSS](https://sass-lang.com) - Powerful styling with variables, mixins, and modules
- **D** - [Drizzle ORM](https://orm.drizzle.team) - Type-safe database operations with PostgreSQL
- **C** - [Clerk](https://clerk.com) - Complete authentication and user management

### Additional Technologies

- **Zero** - Local-first sync engine for real-time data synchronization
- **Zod** - TypeScript-first schema validation with runtime type safety
- **Vercel AI SDK** - Seamless integration with AI language models
- **NanoID** - Secure, URL-friendly unique identifiers for database records
- **Vite PWA** - Progressive Web App capabilities with offline support
- **Cheerio** - Server-side jQuery for HTML/DOM manipulation
- **Marked** - Fast Markdown to HTML converter
- **Turndown** - HTML to Markdown converter
- **Exa** - AI-powered search for intelligent content discovery

## 📦 Installation

### Using NPX (Recommended)

Create a new project using the ATSDC Stack CLI:

```bash
# Fully interactive mode - prompts for everything
npx create-atsdc-stack

# Provide project name, get prompted for install/setup options
npx create-atsdc-stack my-app

# Skip prompts with explicit flags
npx create-atsdc-stack my-app --install
npx create-atsdc-stack my-app --install --setup-db
```

The CLI will interactively prompt you for any options you don't provide:
- **Project name** - if not provided as argument
- **Install dependencies** - if `--install` flag not provided
- **Setup database** - if `--setup-db` flag not provided (only when installing)

### Manual Installation

```bash
# Clone this repository
git clone https://github.com/yourusername/atsdc-stack.git my-app
cd my-app

# Install dependencies
npm install
```

## ⚙️ Configuration

### 1. Environment Variables

**Note:** When using the CLI (`npx create-atsdc-stack`), the `.env` file is automatically created from `.env.example` - no manual copying needed!

If you're setting up manually, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `OPENAI_API_KEY` - OpenAI API key (for AI features)

### 2. Database Setup

**Note:** When using the CLI with the `--setup-db` flag, the database schema is automatically pushed for you!

```bash
npx create-atsdc-stack my-app --install --setup-db
```

If setting up manually or if you skipped the automatic setup, push your database schema to PostgreSQL:

```bash
npm run db:push
```

Generate migrations (optional):

```bash
npm run db:generate
```

### 3. Start Development Server

```bash
npm run dev
```

Your application will be available at `http://localhost:4321`

## 📁 Project Structure

```
├── bin/
│   └── cli.js              # CLI entry point
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable Astro components
│   ├── db/
│   │   ├── initialize.ts  # Database client and initialization
│   │   ├── schema.ts      # Drizzle ORM schema definitions
│   │   └── validations.ts # Zod validation schemas
│   ├── layouts/
│   │   └── BaseLayout.astro # Base layout component
│   ├── pages/
│   │   ├── api/           # API routes
│   │   │   ├── chat.ts    # Vercel AI SDK chat endpoint
│   │   │   └── posts.ts   # CRUD operations for posts
│   │   └── index.astro    # Home page
│   └── styles/
│       ├── variables/
│       │   ├── globals.scss # SCSS global variables
│       │   └── mixins.scss  # SCSS mixins
│       ├── _reset.scss     # CSS reset
│       ├── global.scss     # Global styles
│       ├── components/     # Component-specific styles
│       └── pages/          # Page-specific styles
├── astro.config.mjs        # Astro configuration
├── drizzle.config.ts       # Drizzle ORM configuration
├── package.json
└── tsconfig.json
```

## 🎨 SCSS Architecture

This stack enforces a strict separation of concerns for styling with **semantic, readable class names** - no utility classes like Tailwind.

### Rules

1. **Semantic class names** - Use readable, meaningful class names (e.g., `.btn`, `.card`, `.header`) instead of utility classes (e.g., `.px-4`, `.bg-blue-500`)
2. **No inline `<style>` tags** in `.astro` files (except for truly standalone components)
3. **All styles in external SCSS files** for better maintainability and smaller CSS footprint
4. **Component-specific styles** in `src/styles/components/`
5. **Page-specific styles** in `src/styles/pages/`
6. **Use data attributes for modifiers** (preferred over BEM modifier classes)
7. **Use class chaining** when data attributes aren't appropriate

### Example Usage

```astro
---
// src/pages/example.astro
import BaseLayout from '@/layouts/BaseLayout.astro';
import '@/styles/components/button.scss';
import '@/styles/pages/example.scss';
---

<BaseLayout title="Example Page">
  <div class="example-page">
    <h1>Hello World</h1>
    <!-- Preferred: Data attributes for modifiers -->
    <button class="btn" data-variant="primary" data-size="lg">Click Me</button>

    <!-- Alternative: Class chaining -->
    <button class="btn primary lg">Click Me Too</button>
  </div>
</BaseLayout>
```

### Styling Approach

**Preferred: Data Attributes**
```scss
.btn {
  @include button-base;

  &[data-variant='primary'] { /* styles */ }
  &[data-size='lg'] { /* styles */ }
  &[data-state='loading'] { /* styles */ }
}
```

**Alternative: Class Chaining**
```scss
.btn {
  @include button-base;

  &.primary { /* styles */ }
  &.lg { /* styles */ }
  &.loading { /* styles */ }
}
```

### Available Mixins

The stack provides readable, semantic mixins instead of cryptic utility names:

```scss
@import '@/styles/mixins';

.my-component {
  @include flex-center;      // Center content with flexbox
  @include card;             // Card styling
  @include button-primary;   // Primary button styles
  @include heading-1;        // H1 typography
}
```

### SCSS Variables

Use descriptive variable names that clearly indicate their purpose:

```scss
// ✅ Good: Readable, semantic names
$color-primary: #007bff;
$spacing-large: 2rem;
$border-radius-default: 0.5rem;
$font-size-heading: 2rem;

// ❌ Avoid: Cryptic abbreviations
$clr-1: #007bff;
$sp-lg: 2rem;
```

## 🗄️ Database Operations

### Schema Definition

Define your database schema using Drizzle ORM with NanoID:

```typescript
// src/db/schema.ts
import { pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

export const posts = pgTable('posts', {
  id: varchar('id', { length: 21 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
});
```

### Validation with Zod

Create Zod schemas for runtime validation:

```typescript
// src/db/validations.ts
import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
});
```

### API Routes

Create type-safe API routes:

```typescript
// src/pages/api/posts.ts
import type { APIRoute } from 'astro';
import { db } from '@/db/initialize';
import { posts } from '@/db/schema';
import { createPostSchema } from '@/db/validations';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const validated = createPostSchema.parse(body);

  const [newPost] = await db
    .insert(posts)
    .values(validated)
    .returning();

  return new Response(JSON.stringify(newPost), { status: 201 });
};
```

## 🤖 AI Integration

The stack includes Vercel AI SDK with AI Gateway for seamless AI integration - no provider-specific packages needed!

**Note:** AI Gateway requires Vercel AI SDK v4.1.0 or later (already configured in this stack).

```typescript
// src/pages/api/chat.ts
import type { APIRoute } from 'astro';
import { streamText } from 'ai';

export const POST: APIRoute = async ({ request }) => {
  const { messages } = await request.json();

  const result = streamText({
    model: 'openai/gpt-4o',  // Use model string directly - supports any provider
    messages,
    apiKey: process.env.OPENAI_API_KEY,
  });

  return result.toDataStreamResponse();
};
```

**Supported model formats:**
- OpenAI: `openai/gpt-4o`, `openai/gpt-4-turbo`
- Anthropic: `anthropic/claude-3-5-sonnet-20241022`
- Google: `google/gemini-1.5-pro`
- And many more providers without extra dependencies!

## 🔐 Authentication

Clerk is pre-configured for authentication. Protect routes with middleware:

```typescript
// src/middleware.ts
import { clerkMiddleware } from '@clerk/astro/server';

export const onRequest = clerkMiddleware();
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables on Vercel

Set these in your Vercel project settings:
- `DATABASE_URL`
- `CLERK_SECRET_KEY`
- `OPENAI_API_KEY`

## 📚 Documentation

- [Astro Documentation](https://docs.astro.build)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Zero Sync Documentation](https://zero.rocicorp.dev)
- [Zod Documentation](https://zod.dev)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)

## 🛠️ Available Scripts

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
npm run db:generate   # Generate database migrations
npm run db:migrate    # Run database migrations
npm run db:push       # Push schema to database
npm run db:studio     # Open Drizzle Studio
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 💡 Why This Stack?

1. **Type Safety** - TypeScript + Drizzle + Zod ensure type safety from database to frontend
2. **Performance** - Astro's zero-JS by default approach for maximum performance
3. **Real-time Sync** - Zero provides local-first data synchronization for responsive UIs
4. **Developer Experience** - Modern tooling with excellent IDE support and automated setup
5. **Scalability** - PostgreSQL + serverless architecture scales effortlessly
6. **Security** - Clerk handles authentication, Zod validates inputs
7. **AI-Ready** - Vercel AI SDK integration for modern AI features
8. **PWA Support** - Offline-first capabilities with Vite PWA
9. **Clean Architecture** - Enforced separation of concerns, especially for styles
10. **Quick Start** - Automated environment setup and database initialization
