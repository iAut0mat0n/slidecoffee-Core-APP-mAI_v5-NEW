import { getDb, getUser } from './server/db.ts';

async function testConnection() {
  console.log('Testing database connection...');
  try {
    const db = await getDb();
    if (!db) {
      console.error('❌ Failed to get database connection');
      process.exit(1);
    }
    console.log('✅ Database connection established');
    
    // Try a simple query
    const user = await getUser('test-user-id');
    console.log('✅ Query executed successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testConnection();
