/**
 * Database Migration Runner
 * 
 * Automatically runs database migrations on server startup.
 * This ensures tables exist before the app starts accepting requests.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  // Only run migrations in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Migrations] Skipping in development mode');
    return;
  }

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.warn('[Migrations] DATABASE_URL not set, skipping migrations');
    return;
  }

  let migrationClient: postgres.Sql | null = null;

  try {
    console.log('[Migrations] Starting database migrations...');
    
    // Create a migration-specific connection
    migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
    
    const db = drizzle(migrationClient);
    
    // Run migrations from the migrations folder
    const migrationsFolder = path.join(__dirname, '../../drizzle/migrations');
    
    await migrate(db, { migrationsFolder });
    
    console.log('[Migrations] ✅ Database migrations completed successfully');
  } catch (error) {
    console.error('[Migrations] ❌ Failed to run migrations:', error);
    // Don't crash the server, just log the error
    // Tables might already exist or migrations might have already run
  } finally {
    // Close the migration connection
    if (migrationClient) {
      await migrationClient.end();
    }
  }
}

