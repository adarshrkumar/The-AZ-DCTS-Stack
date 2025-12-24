#!/usr/bin/env node

/**
 * AZ-DCTS Stack CLI
 * Command-line utility for scaffolding new projects with the AZ-DCTS Stack
 */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templateDir = join(__dirname, '..');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`${colors.cyan}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  console.error(`${colors.red}✗${colors.reset} ${message}`);
}

async function createProject(projectName) {
  const targetDir = join(process.cwd(), projectName);

  try {
    // Step 1: Check if directory exists
    logStep(1, 'Checking project directory...');
    if (existsSync(targetDir)) {
      logError(`Directory "${projectName}" already exists!`);
      process.exit(1);
    }

    // Step 2: Create project directory
    logStep(2, `Creating project directory: ${projectName}`);
    await mkdir(targetDir, { recursive: true });
    logSuccess('Directory created');

    // Step 3: Copy template files
    logStep(3, 'Copying template files...');

    const filesToCopy = [
      'package.json',
      'tsconfig.json',
      'astro.config.mjs',
      'drizzle.config.ts',
      'README.md',
      '.gitignore',
    ];

    for (const file of filesToCopy) {
      const srcPath = join(templateDir, file);
      const destPath = join(targetDir, file);

      if (existsSync(srcPath)) {
        await copyFile(srcPath, destPath);
      }
    }

    // Copy directory structures
    const dirsToCopy = ['src', 'public', 'bin'];
    for (const dir of dirsToCopy) {
      const srcPath = join(templateDir, dir);
      const destPath = join(targetDir, dir);

      if (existsSync(srcPath)) {
        await copyDirectory(srcPath, destPath);
      }
    }

    logSuccess('Template files copied');

    // Step 4: Update package.json with project name
    logStep(4, 'Updating package.json...');
    const packageJsonPath = join(targetDir, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
    packageJson.name = projectName;
    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    logSuccess('package.json updated');

    // Step 5: Create .env.example
    logStep(5, 'Creating environment file template...');
    const envExample = `# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Clerk Authentication
PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# OpenAI (for Vercel AI SDK)
OPENAI_API_KEY="sk-..."

# Vercel (for deployment)
# These are automatically set by Vercel
# VERCEL_URL
# VERCEL_ENV
`;
    await writeFile(join(targetDir, '.env.example'), envExample);
    logSuccess('.env.example created');

    // Step 6: Display next steps
    log('\n' + '='.repeat(60), 'bright');
    log('🎉 Project created successfully!', 'green');
    log('='.repeat(60), 'bright');

    console.log('\nNext steps:');
    console.log(`  1. ${colors.cyan}cd ${projectName}${colors.reset}`);
    console.log(`  2. ${colors.cyan}npm install${colors.reset}`);
    console.log(`  3. Copy ${colors.yellow}.env.example${colors.reset} to ${colors.yellow}.env${colors.reset} and fill in your values`);
    console.log(`  4. ${colors.cyan}npm run db:push${colors.reset} - Push database schema`);
    console.log(`  5. ${colors.cyan}npm run dev${colors.reset} - Start development server`);

    console.log('\nDocumentation:');
    console.log(`  • Astro: ${colors.cyan}https://astro.build${colors.reset}`);
    console.log(`  • Drizzle ORM: ${colors.cyan}https://orm.drizzle.team${colors.reset}`);
    console.log(`  • Clerk: ${colors.cyan}https://clerk.com/docs${colors.reset}`);
    console.log(`  • Vercel AI SDK: ${colors.cyan}https://sdk.vercel.ai${colors.reset}`);

    log('\n' + '='.repeat(60), 'bright');

  } catch (error) {
    logError(`Failed to create project: ${error.message}`);
    process.exit(1);
  }
}

async function copyDirectory(src, dest) {
  const { readdir, stat } = await import('node:fs/promises');

  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

// Main CLI logic
const args = process.argv.slice(2);
const command = args[0];
const projectName = args[1];

if (!command || command === '--help' || command === '-h') {
  console.log(`
${colors.bright}${colors.cyan}AZ-DCTS Stack CLI${colors.reset}

${colors.bright}Usage:${colors.reset}
  npx az-dcts-stack create <project-name>

${colors.bright}Commands:${colors.reset}
  create <name>    Create a new AZ-DCTS Stack project
  --help, -h       Show this help message
  --version, -v    Show version number

${colors.bright}Examples:${colors.reset}
  npx az-dcts-stack create my-app
  npx az-dcts-stack create my-blog

${colors.bright}Stack includes:${colors.reset}
  • Astro          - Modern web framework
  • TypeScript     - Type-safe development
  • Drizzle ORM    - Type-safe database operations
  • Clerk          - Authentication & user management
  • SCSS           - Advanced styling
  • Zod            - Runtime validation
  • Vercel AI SDK  - AI integration
  • NanoID         - Unique ID generation
  • Vite PWA       - Progressive Web App
`);
  process.exit(0);
}

if (command === '--version' || command === '-v') {
  const packageJson = JSON.parse(
    await readFile(join(templateDir, 'package.json'), 'utf-8')
  );
  console.log(packageJson.version);
  process.exit(0);
}

if (command === 'create') {
  if (!projectName) {
    logError('Please provide a project name');
    console.log(`Usage: npx az-dcts-stack create <project-name>`);
    process.exit(1);
  }

  log(`\n${colors.bright}${colors.cyan}Creating AZ-DCTS Stack project...${colors.reset}\n`);
  await createProject(projectName);
} else {
  logError(`Unknown command: ${command}`);
  console.log('Run with --help for usage information');
  process.exit(1);
}
