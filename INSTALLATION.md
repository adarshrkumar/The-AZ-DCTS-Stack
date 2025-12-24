# Installation Guide

This guide provides detailed shell commands for initializing a new Astro project with the AZ-DCTS Stack.

## Quick Start

### Option 1: Using the CLI (Recommended)

```bash
npx az-dcts-stack create my-app
cd my-app
npm install
```

### Option 2: Manual Setup from Scratch

If you want to build the stack manually from scratch, follow these steps:

## Step 1: Initialize Astro Project

```bash
# Create a new directory
mkdir my-az-dcts-app
cd my-az-dcts-app

# Initialize npm project
npm init -y

# Install Astro and core dependencies
npm install astro@latest
```

## Step 2: Install All Stack Dependencies

### Core Framework & Language

```bash
npm install astro@latest typescript@latest
```

### Astro Integrations

```bash
npm install @astrojs/react@latest @astrojs/vercel@latest @astrojs/check@latest
```

### Authentication (Clerk)

```bash
npm install @clerk/astro@latest @clerk/clerk-react@latest
```

### Database (Drizzle ORM + PostgreSQL)

```bash
npm install drizzle-orm@latest postgres@latest @vercel/postgres@latest
npm install -D drizzle-kit@latest
```

### Validation (Zod)

```bash
npm install zod@latest
```

### Styling (SCSS)

```bash
npm install -D sass@latest
```

### AI Integration (Vercel AI SDK)

```bash
npm install ai@latest @ai-sdk/openai@latest
```

### Unique IDs (NanoID)

```bash
npm install nanoid@latest
```

### PWA Support

```bash
npm install -D vite-plugin-pwa@latest @vite-pwa/assets-generator@latest
```

### React Dependencies (for Clerk components)

```bash
npm install react@latest react-dom@latest
npm install -D @types/react@latest @types/react-dom@latest
```

### TypeScript Types

```bash
npm install -D @types/node@latest
```

## Step 3: All-in-One Installation Command

Alternatively, install all dependencies at once:

```bash
npm install \
  astro@latest \
  @astrojs/react@latest \
  @astrojs/vercel@latest \
  @astrojs/check@latest \
  @clerk/astro@latest \
  @clerk/clerk-react@latest \
  @vercel/postgres@latest \
  ai@latest \
  @ai-sdk/openai@latest \
  drizzle-orm@latest \
  nanoid@latest \
  postgres@latest \
  react@latest \
  react-dom@latest \
  typescript@latest \
  zod@latest

npm install -D \
  @types/node@latest \
  @types/react@latest \
  @types/react-dom@latest \
  @vite-pwa/assets-generator@latest \
  drizzle-kit@latest \
  sass@latest \
  vite-plugin-pwa@latest
```

## Step 4: Project Structure Setup

Create the necessary directories:

```bash
mkdir -p src/{components,db,layouts,pages/api,styles/components,styles/pages} public bin
```

## Step 5: Configuration Files

### Create `package.json` scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "astro": "astro",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

### Create `tsconfig.json`

```bash
cat > tsconfig.json << 'EOF'
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
EOF
```

### Create `astro.config.mjs`

```bash
cat > astro.config.mjs << 'EOF'
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';
import clerk from '@clerk/astro';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [react(), clerk()],
  vite: {
    plugins: [VitePWA({ registerType: 'autoUpdate' })],
  },
});
EOF
```

### Create `.env.example`

```bash
cat > .env.example << 'EOF'
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
OPENAI_API_KEY="sk-..."
EOF
```

### Create `.gitignore`

```bash
cat > .gitignore << 'EOF'
node_modules/
dist/
.astro/
.env
.env.local
.DS_Store
.vscode/
*.log
drizzle/
EOF
```

## Step 6: Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your actual credentials
nano .env  # or use your preferred editor
```

## Step 7: Database Setup

```bash
# Push your schema to the database
npm run db:push

# Or generate migrations
npm run db:generate
npm run db:migrate
```

## Step 8: Start Development

```bash
npm run dev
```

Your application will be available at `http://localhost:4321`

## Verification

Verify your installation:

```bash
# Check Node version (should be 18+)
node --version

# Check npm version
npm --version

# Verify Astro is working
npm run astro -- --version

# Check TypeScript
npx tsc --version
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 4321
lsof -ti:4321 | xargs kill -9

# Or specify a different port
npm run dev -- --port 3000
```

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql $DATABASE_URL

# Check if database exists
psql -l
```

### Clear Cache and Reinstall

```bash
# Remove node_modules and lockfile
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall
npm install
```

## Next Steps

1. Review the [README.md](./README.md) for architecture details
2. Explore the example code in `src/pages/api/`
3. Customize your database schema in `src/db/schema.ts`
4. Set up your Clerk authentication
5. Deploy to Vercel

## Production Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Set Environment Variables on Vercel

```bash
vercel env add DATABASE_URL
vercel env add CLERK_SECRET_KEY
vercel env add OPENAI_API_KEY
```

## Support

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/yourusername/az-dcts-stack/issues)
2. Review the official documentation for each technology
3. Ask in the community Discord/Slack

Happy coding!
