#!/usr/bin/env node

/**
 * ATSDC Stack CLI
 * Command-line utility for scaffolding new projects with the ATSDC Stack
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
${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════════════╗
║                       ATSDC Stack CLI v1.0                         ║
║          Production-Ready Full-Stack Application Generator        ║
╚════════════════════════════════════════════════════════════════════╝${colors.reset}

${colors.bright}${colors.green}USAGE${colors.reset}
  ${colors.cyan}npx create-atsdc-stack${colors.reset} ${colors.yellow}[project-name]${colors.reset} ${colors.yellow}[options]${colors.reset}

${colors.bright}${colors.green}DESCRIPTION${colors.reset}
  The ATSDC Stack CLI scaffolds production-ready full-stack applications
  with best-in-class technologies. Create modern web apps with type safety,
  authentication, database operations, and AI integration out of the box.

  ${colors.yellow}🤖 Interactive Mode:${colors.reset}
  This CLI features intelligent interactive prompts. Any option not provided
  as a command-line argument will trigger an interactive prompt, making it
  easy for both beginners and power users.

${colors.bright}${colors.green}ARGUMENTS${colors.reset}
  ${colors.cyan}project-name${colors.reset}
      The name of your new project directory. If omitted, you will be
      prompted to enter it interactively.

      ${colors.yellow}Validation:${colors.reset} Only letters, numbers, hyphens, and underscores
      ${colors.yellow}Example:${colors.reset} my-app, my_blog, myapp123

${colors.bright}${colors.green}OPTIONS${colors.reset}
  ${colors.cyan}--install, -i${colors.reset}
      Automatically install npm dependencies after creating the project.
      If omitted, you will be prompted (default: ${colors.green}Yes${colors.reset})

      ${colors.yellow}What it does:${colors.reset}
      • Runs 'npm install' in the project directory
      • Installs all dependencies from package.json
      • Required for --setup-db to work

  ${colors.cyan}--setup-db, --db${colors.reset}
      Set up the database schema after installation.
      If omitted, you will be prompted (default: ${colors.red}No${colors.reset})
      ${colors.yellow}Requires: --install${colors.reset}

      ${colors.yellow}What it does:${colors.reset}
      • Runs 'npm run db:push' to sync schema with database
      • Requires DATABASE_URL to be configured in .env
      • Creates tables defined in src/db/schema.ts

      ${colors.red}Note:${colors.reset} You must configure your DATABASE_URL in .env before
      this will work. If not configured, this step will be skipped with
      a warning.

  ${colors.cyan}--help, -h${colors.reset}
      Display this help message and exit.

  ${colors.cyan}--version, -v${colors.reset}
      Display the CLI version number and exit.

${colors.bright}${colors.green}EXAMPLES${colors.reset}
  ${colors.yellow}# Fully interactive - prompts for everything${colors.reset}
  npx create-atsdc-stack

  ${colors.yellow}# Provide name, get prompted for install/setup options${colors.reset}
  npx create-atsdc-stack my-awesome-app

  ${colors.yellow}# Auto-install dependencies, prompt for database setup${colors.reset}
  npx create-atsdc-stack my-blog --install

  ${colors.yellow}# Full automatic setup (recommended for experienced users)${colors.reset}
  npx create-atsdc-stack my-app --install --setup-db

  ${colors.yellow}# Short flags work too${colors.reset}
  npx create-atsdc-stack my-app -i --db

${colors.bright}${colors.green}WHAT GETS CREATED${colors.reset}
  ${colors.cyan}Project Structure:${colors.reset}
  • src/               - Source code directory
    ├── components/    - Reusable Astro components
    ├── db/           - Database schema and client
    ├── layouts/      - Page layouts
    ├── lib/          - Utility libraries
    ├── pages/        - Routes and API endpoints
    └── styles/       - SCSS stylesheets
  • public/           - Static assets
  • .env              - Environment variables (with examples)
  • package.json      - Dependencies and scripts
  • astro.config.mjs  - Astro configuration
  • drizzle.config.ts - Database ORM configuration
  • tsconfig.json     - TypeScript configuration

${colors.bright}${colors.green}TECHNOLOGY STACK${colors.reset}
  ${colors.bright}Core Framework:${colors.reset}
  ${colors.cyan}• Astro 4.x${colors.reset}          - Modern web framework with zero-JS by default
                       Perfect for content sites and dynamic apps

  ${colors.bright}Type Safety & Validation:${colors.reset}
  ${colors.cyan}• TypeScript 5.x${colors.reset}    - Full type safety across your entire stack
  ${colors.cyan}• Zod 3.x${colors.reset}           - Runtime validation with TypeScript integration

  ${colors.bright}Database:${colors.reset}
  ${colors.cyan}• Drizzle ORM${colors.reset}       - Type-safe database operations
  ${colors.cyan}• PostgreSQL${colors.reset}        - Powerful relational database (via Vercel/Neon)
  ${colors.cyan}• NanoID${colors.reset}            - Secure unique ID generation for records

  ${colors.bright}Authentication:${colors.reset}
  ${colors.cyan}• Clerk${colors.reset}             - Complete user management and authentication
                       Includes social logins, 2FA, user profiles

  ${colors.bright}Styling:${colors.reset}
  ${colors.cyan}• SCSS${colors.reset}              - Advanced CSS with variables, mixins, nesting
                       Data attributes preferred over BEM classes

  ${colors.bright}AI & Content:${colors.reset}
  ${colors.cyan}• Vercel AI SDK${colors.reset}     - Seamless LLM integration (OpenAI, Anthropic, etc.)
  ${colors.cyan}• Exa${colors.reset}               - AI-powered semantic search
  ${colors.cyan}• Cheerio${colors.reset}           - Server-side DOM manipulation
  ${colors.cyan}• Marked${colors.reset}            - Markdown to HTML conversion
  ${colors.cyan}• Turndown${colors.reset}          - HTML to Markdown conversion

  ${colors.bright}Progressive Web App:${colors.reset}
  ${colors.cyan}• Vite PWA${colors.reset}          - Offline support, installable apps, service workers

${colors.bright}${colors.green}NEXT STEPS AFTER CREATION${colors.reset}
  ${colors.yellow}1.${colors.reset} ${colors.cyan}cd your-project-name${colors.reset}

  ${colors.yellow}2.${colors.reset} Configure environment variables in ${colors.cyan}.env${colors.reset}:
     • DATABASE_URL              - PostgreSQL connection string
     • PUBLIC_CLERK_PUBLISHABLE_KEY - Get from clerk.com
     • CLERK_SECRET_KEY          - Get from clerk.com
     • OPENAI_API_KEY            - Get from platform.openai.com
     • EXA_API_KEY               - Get from exa.ai (optional)

  ${colors.yellow}3.${colors.reset} Push database schema: ${colors.cyan}npm run db:push${colors.reset}

  ${colors.yellow}4.${colors.reset} Start development server: ${colors.cyan}npm run dev${colors.reset}

  ${colors.yellow}5.${colors.reset} Open ${colors.cyan}http://localhost:4321${colors.reset}

${colors.bright}${colors.green}AVAILABLE SCRIPTS${colors.reset}
  ${colors.cyan}npm run dev${colors.reset}         - Start development server (port 4321)
  ${colors.cyan}npm run build${colors.reset}       - Build for production
  ${colors.cyan}npm run preview${colors.reset}     - Preview production build locally
  ${colors.cyan}npm run db:push${colors.reset}     - Push schema changes to database
  ${colors.cyan}npm run db:generate${colors.reset} - Generate migration files
  ${colors.cyan}npm run db:studio${colors.reset}   - Open Drizzle Studio (database GUI)

${colors.bright}${colors.green}RESOURCES${colors.reset}
  ${colors.cyan}Documentation:${colors.reset}
  • Astro:        https://docs.astro.build
  • Drizzle ORM:  https://orm.drizzle.team
  • Clerk:        https://clerk.com/docs
  • Zod:          https://zod.dev
  • Vercel AI:    https://sdk.vercel.ai/docs
  • Exa Search:   https://docs.exa.ai

  ${colors.cyan}GitHub:${colors.reset}
  • Repository:   https://github.com/yourusername/atsdc-stack
  • Issues:       https://github.com/yourusername/atsdc-stack/issues

${colors.bright}${colors.green}TIPS${colors.reset}
  ${colors.yellow}•${colors.reset} Use ${colors.cyan}--install${colors.reset} flag to save time on dependency installation
  ${colors.yellow}•${colors.reset} Set up database credentials before using ${colors.cyan}--setup-db${colors.reset}
  ${colors.yellow}•${colors.reset} Check ${colors.cyan}.env.example${colors.reset} for all required environment variables
  ${colors.yellow}•${colors.reset} Use ${colors.cyan}npm run db:studio${colors.reset} to visually manage your database
  ${colors.yellow}•${colors.reset} Data attributes are preferred over BEM for SCSS modifiers

${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════════════════${colors.reset}
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
  log('Welcome to ATSDC Stack!', 'cyan');
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
  shouldInstall = await promptYesNo('Install dependencies now?', true);
  console.log();
}

// Prompt for setup-db flag if not provided (only if installing)
let shouldSetupDb = setupDbFlagPassed;
if (shouldInstall && !setupDbFlagPassed) {
  shouldSetupDb = await promptYesNo('Set up the database now?', false);
  console.log();
}

// Build flags object
const flags = {
  install: shouldInstall,
  setupDb: shouldSetupDb,
};

log(`\n${colors.bright}${colors.cyan}Creating ATSDC Stack project...${colors.reset}\n`);
await createProject(projectName, flags);
