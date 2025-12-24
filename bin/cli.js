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
import * as readline from 'node:readline/promises';

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

function logWarning(message) {
  console.warn(`${colors.yellow}⚠${colors.reset} ${message}`);
}

async function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer = await rl.question(`${colors.cyan}${question}${colors.reset} `);
    return answer.trim();
  } finally {
    rl.close();
  }
}

async function promptYesNo(question, defaultValue = false) {
  const defaultText = defaultValue ? 'Y/n' : 'y/N';
  const answer = await promptUser(`${question} (${defaultText}):`);

  if (!answer) {
    return defaultValue;
  }

  const normalized = answer.toLowerCase();
  return normalized === 'y' || normalized === 'yes';
}

async function setupDatabase(projectDir) {
  try {
    logStep('DB', 'Setting up database...');

    // Check if .env file exists
    const envPath = join(projectDir, '.env');
    if (!existsSync(envPath)) {
      logWarning('No .env file found. Skipping database setup.');
      logWarning('Please copy .env.example to .env and configure your DATABASE_URL');
      return false;
    }

    // Try to run drizzle-kit push
    execSync('npm run db:push', {
      cwd: projectDir,
      stdio: 'inherit',
    });

    logSuccess('Database schema pushed successfully');
    return true;
  } catch (error) {
    logError('Failed to push database schema');
    logWarning('Please configure your DATABASE_URL in .env and run: npm run db:push');
    console.log(`\nError details: ${error.message}`);
    return false;
  }
}

async function createProject(projectName, options = {}) {
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

    // Step 5: Create .env.example and .env
    logStep(5, 'Creating environment file template...');
    const envExample = `# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Clerk Authentication
PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# OpenAI (for Vercel AI SDK)
OPENAI_API_KEY="sk-..."

# Exa Search (for AI-powered search)
EXA_API_KEY="..."

# Vercel (for deployment)
# These are automatically set by Vercel
# VERCEL_URL
# VERCEL_ENV
`;
    await writeFile(join(targetDir, '.env.example'), envExample);
    await writeFile(join(targetDir, '.env'), envExample);
    logSuccess('.env.example and .env created');

    // Step 6: Install dependencies if requested
    if (options.install) {
      logStep(6, 'Installing dependencies...');
      try {
        execSync('npm install', {
          cwd: targetDir,
          stdio: 'inherit',
        });
        logSuccess('Dependencies installed');
      } catch (error) {
        logWarning('Failed to install dependencies. You can run npm install manually.');
      }
    }

    // Step 7: Setup database if requested
    if (options.setupDb && options.install) {
      await setupDatabase(targetDir);
    }

    // Display next steps
    log('\n' + '='.repeat(60), 'bright');
    log('🎉 Project created successfully!', 'green');
    log('='.repeat(60), 'bright');

    console.log('\nNext steps:');
    let step = 1;
    console.log(`  ${step++}. ${colors.cyan}cd ${projectName}${colors.reset}`);

    if (!options.install) {
      console.log(`  ${step++}. ${colors.cyan}npm install${colors.reset}`);
    }

    console.log(`  ${step++}. Edit ${colors.yellow}.env${colors.reset} and fill in your database credentials and API keys`);

    if (!options.setupDb) {
      console.log(`  ${step++}. ${colors.cyan}npm run db:push${colors.reset} - Push database schema`);
    }

    console.log(`  ${step++}. ${colors.cyan}npm run dev${colors.reset} - Start development server`);

    console.log('\nDocumentation:');
    console.log(`  • Astro: ${colors.cyan}https://astro.build${colors.reset}`);
    console.log(`  • Drizzle ORM: ${colors.cyan}https://orm.drizzle.team${colors.reset}`);
    console.log(`  • Clerk: ${colors.cyan}https://clerk.com/docs${colors.reset}`);
    console.log(`  • Vercel AI SDK: ${colors.cyan}https://sdk.vercel.ai${colors.reset}`);
    console.log(`  • Exa Search: ${colors.cyan}https://docs.exa.ai${colors.reset}`);

    console.log('\nNew utilities added:');
    console.log(`  • Cheerio - DOM manipulation in ${colors.cyan}src/lib/dom-utils.ts${colors.reset}`);
    console.log(`  • Marked/Turndown - Content conversion in ${colors.cyan}src/lib/content-converter.ts${colors.reset}`);
    console.log(`  • Exa - AI search in ${colors.cyan}src/lib/exa-search.ts${colors.reset}`);

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

// Check for help or version flags first
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
${colors.bright}${colors.cyan}AZ-DCTS Stack CLI${colors.reset}

${colors.bright}Usage:${colors.reset}
  npx az-dcts-stack [project-name] [options]

  ${colors.yellow}Interactive Mode:${colors.reset} If any options are omitted, you will be prompted for them.

${colors.bright}Options:${colors.reset}
  --install, -i    Install dependencies after creating project
  --setup-db, --db Setup database after installation (requires --install)
  --help, -h       Show this help message
  --version, -v    Show version number

${colors.bright}Examples:${colors.reset}
  npx az-dcts-stack                          # Fully interactive mode
  npx az-dcts-stack my-app                   # Interactive for options
  npx az-dcts-stack my-blog --install        # Install, prompt for DB setup
  npx az-dcts-stack my-app --install --setup-db  # Full automatic setup

${colors.bright}Stack includes:${colors.reset}
  • Astro          - Modern web framework
  • TypeScript     - Type-safe development
  • Drizzle ORM    - Type-safe database operations
  • Clerk          - Authentication & user management
  • SCSS           - Advanced styling (data attributes preferred)
  • Zod            - Runtime validation
  • Vercel AI SDK  - AI integration
  • NanoID         - Unique ID generation
  • Vite PWA       - Progressive Web App
  • Cheerio        - Virtual DOM manipulation
  • Marked         - Markdown to HTML conversion
  • Turndown       - HTML to Markdown conversion
  • Exa            - AI-powered search
`);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  const packageJson = JSON.parse(
    await readFile(join(templateDir, 'package.json'), 'utf-8')
  );
  console.log(packageJson.version);
  process.exit(0);
}

// Check if flags were explicitly passed
const installFlagPassed = args.includes('--install') || args.includes('-i');
const setupDbFlagPassed = args.includes('--setup-db') || args.includes('--db');

// Get project name (first argument that's not a flag)
let projectName = args.find(arg => !arg.startsWith('-'));

// Interactive mode setup
const needsInteractive = !projectName || !installFlagPassed || (!setupDbFlagPassed && installFlagPassed);

if (needsInteractive && !projectName) {
  log('\n' + '='.repeat(60), 'bright');
  log('Welcome to AZ-DCTS Stack!', 'cyan');
  log('='.repeat(60), 'bright');
  console.log();
}

// Prompt for project name if not provided
if (!projectName) {
  projectName = await promptUser('What would you like to name your project?');

  if (!projectName) {
    logError('Project name is required');
    process.exit(1);
  }

  // Validate project name (basic validation)
  if (!/^[a-z0-9-_]+$/i.test(projectName)) {
    logError('Project name can only contain letters, numbers, hyphens, and underscores');
    process.exit(1);
  }
  console.log();
}

// Prompt for install flag if not provided
let shouldInstall = installFlagPassed;
if (!installFlagPassed) {
  shouldInstall = await promptYesNo('Would you like to install dependencies now?', true);
  console.log();
}

// Prompt for setup-db flag if not provided (only if installing)
let shouldSetupDb = setupDbFlagPassed;
if (shouldInstall && !setupDbFlagPassed) {
  shouldSetupDb = await promptYesNo('Would you like to set up the database now?', false);
  console.log();
}

// Build flags object
const flags = {
  install: shouldInstall,
  setupDb: shouldSetupDb,
};

log(`\n${colors.bright}${colors.cyan}Creating AZ-DCTS Stack project...${colors.reset}\n`);
await createProject(projectName, flags);
