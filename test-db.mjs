import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oguffkeepedzwydqvqnp.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ndWZma2VlcGVkend5ZHF2cW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5NjQ2NzEsImV4cCI6MjA0NzU0MDY3MX0.hDqFuEtGZJOPz7bwLx3XMpPBPQPJLSFJCPZjJKaVMCE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testTables() {
  console.log('Testing Supabase connection...\n')
  
  // Test v2_workspaces table
  const { data, error } = await supabase
    .from('v2_workspaces')
    .select('*')
    .limit(1)
  
  if (error) {
    console.log('❌ v2_workspaces table error:', error.message)
    console.log('Error code:', error.code)
    console.log('Error details:', error.details)
  } else {
    console.log('✅ v2_workspaces table exists!')
    console.log('Data:', data)
  }
}

testTables()
