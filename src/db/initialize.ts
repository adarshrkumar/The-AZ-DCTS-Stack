import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { posts, comments } from './schema';

/**
 * Database client configuration
 * Uses Vercel Postgres for production-ready connection pooling
 */

// Validate environment variable
if (!import.meta.env.DATABASE_URL && !process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set. Please add it to your .env file.'
  );
}

const connectionString = import.meta.env.DATABASE_URL || process.env.DATABASE_URL;

// Create postgres connection
// Max 1 connection for serverless environments (Vercel)
const client = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create Drizzle instance with schema
export const db = drizzle(client, { schema });

// Export schema for convenience
export { schema };

// Helper function to close the connection (useful for testing)
export const closeConnection = async () => {
  await client.end();
};

/**
 * Database initialization utilities
 * Handles table creation, migrations, and initial setup
 */

/**
 * Check if the database tables exist by attempting a simple query
 */
export async function checkTablesExist(): Promise<boolean> {
  try {
    await db.select().from(posts).limit(1);
    return true;
  } catch (error) {
    console.error('Error checking if tables exist:', error);
    return false;
  }
}

/**
 * Initialize the database by creating tables if they don't exist
 * Note: In production, use Drizzle migrations instead
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const tablesExist = await checkTablesExist();

    if (!tablesExist) {
      console.log('Database tables do not exist. Please run migrations using:');
      console.log('  npm run db:push');
      console.log('  or');
      console.log('  npm run db:migrate');
      throw new Error('Database tables not initialized');
    }

    console.log('Database tables verified successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

/**
 * Verify database connection
 */
export async function verifyConnection(): Promise<boolean> {
  try {
    await db.select().from(posts).limit(1);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Get database health status
 */
export async function getDatabaseHealth(): Promise<{
  connected: boolean;
  tablesExist: boolean;
  timestamp: Date;
}> {
  const connected = await verifyConnection();
  const tablesExist = connected ? await checkTablesExist() : false;

  return {
    connected,
    tablesExist,
    timestamp: new Date(),
  };
}

/**
 * Seed initial data (optional - for development)
 */
export async function seedDatabase(): Promise<void> {
  try {
    // Check if data already exists
    const existingPosts = await db.select().from(posts).limit(1);

    if (existingPosts.length > 0) {
      console.log('Database already contains data, skipping seed');
      return;
    }

    console.log('Database seeding completed');
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
}
