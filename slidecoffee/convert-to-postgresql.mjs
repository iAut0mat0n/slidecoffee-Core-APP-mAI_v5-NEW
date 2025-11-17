import { readFileSync, writeFileSync } from 'fs';

console.log('Converting schema from MySQL to PostgreSQL...');

// Read schema
let schema = readFileSync('drizzle/schema.ts', 'utf8');

// Convert imports
schema = schema.replace(
  /from "drizzle-orm\/mysql-core"/g,
  'from "drizzle-orm/pg-core"'
);

// Convert table definitions
schema = schema.replace(/mysqlTable/g, 'pgTable');
schema = schema.replace(/mysqlEnum/g, 'varchar');

// Convert types
schema = schema.replace(/\bint\(/g, 'serial(');
schema = schema.replace(/\.autoincrement\(\)/g, '');

// Write back
writeFileSync('drizzle/schema.ts', schema);
console.log('✅ Schema converted');

// Convert db.ts
let db = readFileSync('server/db.ts', 'utf8');
db = db.replace(
  /from "drizzle-orm\/mysql2"/g,
  'from "drizzle-orm/node-postgres"'
);
db = db.replace(
  /_db = drizzle\(process\.env\.DATABASE_URL\);/g,
  `import pkg from 'pg';\nconst { Pool } = pkg;\nconst pool = new Pool({ connectionString: process.env.DATABASE_URL });\n_db = drizzle(pool);`
);

writeFileSync('server/db.ts', db);
console.log('✅ db.ts converted');

console.log('✅ Conversion complete!');
