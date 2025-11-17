import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = readFileSync('./supabase/migrations/001_vector_memory_setup.sql', 'utf8');

console.log('🚀 Running vector memory migration...\n');
console.log('SQL:', sql.substring(0, 200) + '...\n');

// Execute SQL (note: this requires service role key for DDL operations)
console.log('⚠️  Note: This migration requires running in Supabase SQL Editor');
console.log('📋 Copy the SQL from: supabase/migrations/001_vector_memory_setup.sql');
console.log('🔗 Run at: https://supabase.com/dashboard/project/oguffkeepedzwydqvqnp/sql/new');

process.exit(0);
