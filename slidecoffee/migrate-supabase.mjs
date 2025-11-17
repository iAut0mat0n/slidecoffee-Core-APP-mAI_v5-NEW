import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;

const DATABASE_URL = 'postgresql://postgres.oguffkeepedzwydqvqnp:I3u1Q3uno#cP70RUAh75fP@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

console.log('🔄 Connecting to Supabase PostgreSQL...');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool);

console.log('✅ Connected! Running migrations...');

// Test connection
try {
  const result = await pool.query('SELECT NOW()');
  console.log('✅ Database connection successful:', result.rows[0]);
  
  // Check if tables exist
  const tables = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);
  
  console.log('\n📊 Existing tables:', tables.rows.map(r => r.table_name));
  
  await pool.end();
  console.log('\n✅ Migration check complete!');
} catch (error) {
  console.error('❌ Error:', error);
  await pool.end();
  process.exit(1);
}
