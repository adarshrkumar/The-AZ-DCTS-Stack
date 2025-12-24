# AZ-DCTS Stack

A production-ready, full-stack web application framework combining the best modern technologies for building secure, type-safe, and AI-ready web applications.

## 🚀 Stack Overview

The **AZ-DCTS Stack** is a carefully curated combination of modern web technologies:

- **A** - [Astro](https://astro.build) - Lightning-fast static site generation with dynamic capabilities
- **Z** - [Zod](https://zod.dev) - TypeScript-first schema validation with runtime type safety
- **D** - [Drizzle ORM](https://orm.drizzle.team) - Type-safe database operations with PostgreSQL
- **C** - [Clerk](https://clerk.com) - Complete authentication and user management
- **T** - [TypeScript](https://www.typescriptlang.org) - Full type safety across your entire application
- **S** - [SCSS](https://sass-lang.com) - Powerful styling with variables, mixins, and modules

### Additional Technologies

- **Vercel AI SDK** - Seamless integration with AI language models
- **NanoID** - Secure, URL-friendly unique identifiers for database records
- **Vite PWA** - Progressive Web App capabilities with offline support

## 📦 Installation

### Using NPX (Recommended)

Create a new project using the AZ-DCTS Stack CLI:

```bash
npx az-dcts-stack create my-app
cd my-app
npm install
```

### Manual Installation

```bash
# Clone this repository
git clone https://github.com/yourusername/az-dcts-stack.git my-app
cd my-app

# Install dependencies
npm install
```

## ⚙️ Configuration

### 1. Environment Variables

Copy `.env.example` to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `OPENAI_API_KEY` - OpenAI API key (for AI features)

### 2. Database Setup

Push your database schema to PostgreSQL:

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
│   │   ├── client.ts      # Database client configuration
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
│       ├── _variables.scss # SCSS variables
│       ├── _mixins.scss    # SCSS mixins
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

This stack enforces a strict separation of concerns for styling:

### Rules

1. **No inline `<style>` tags** in `.astro` files (except for truly standalone components)
2. **All styles in external SCSS files** for better maintainability and smaller CSS footprint
3. **Component-specific styles** in `src/styles/components/`
4. **Page-specific styles** in `src/styles/pages/`

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
    <button class="btn btn-primary">Click Me</button>
  </div>
</BaseLayout>
```

### Available Mixins

```scss
@import '@/styles/mixins';

.my-component {
  @include flex-center;      // Center content with flexbox
  @include card;             // Card styling
  @include button-primary;   // Primary button styles
  @include heading-1;        // H1 typography
}
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
import { db } from '@/db/client';
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

The stack includes Vercel AI SDK for seamless AI integration:

```typescript
// src/pages/api/chat.ts
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST: APIRoute = async ({ request }) => {
  const { messages } = await request.json();

  const result = streamText({
    model: openai('gpt-4-turbo-preview'),
    messages,
  });

  return result.toDataStreamResponse();
};
```

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
3. **Developer Experience** - Modern tooling with excellent IDE support
4. **Scalability** - PostgreSQL + serverless architecture scales effortlessly
5. **Security** - Clerk handles authentication, Zod validates inputs
6. **AI-Ready** - Vercel AI SDK integration for modern AI features
7. **PWA Support** - Offline-first capabilities with Vite PWA
8. **Clean Architecture** - Enforced separation of concerns, especially for styles
