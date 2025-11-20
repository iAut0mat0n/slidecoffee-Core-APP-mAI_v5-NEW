import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oguffkeepedzwydqvqnp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ndWZma2VlcGVkend5ZHF2cW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5NjQ2NzEsImV4cCI6MjA0NzU0MDY3MX0.hDqFuEtGZJOPz7bwLx3XMpPBPQPJLSFJCPZjJKaVMCE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('Checking v2_users table structure...\n')
  
  // Try to insert a test record to see what columns are accepted
  const testId = '00000000-0000-0000-0000-000000000001'
  
  const { data, error } = await supabase
    .from('v2_users')
    .select('*')
    .limit(1)
  
  if (error) {
    console.log('Error querying v2_users:', error.message)
    console.log('Error details:', error)
  } else {
    console.log('✅ v2_users table exists')
    console.log('Sample data:', data)
    if (data.length > 0) {
      console.log('Columns:', Object.keys(data[0]))
    }
  }
}

checkSchema()
