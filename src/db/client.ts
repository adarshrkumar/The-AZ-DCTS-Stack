import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

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
