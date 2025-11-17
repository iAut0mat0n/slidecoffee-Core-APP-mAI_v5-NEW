#!/bin/bash
# Convert MySQL schema to PostgreSQL

sed -i 's/from "drizzle-orm\/mysql-core"/from "drizzle-orm\/pg-core"/g' drizzle/schema.ts
sed -i 's/mysqlTable/pgTable/g' drizzle/schema.ts
sed -i 's/mysqlEnum/varchar/g' drizzle/schema.ts
sed -i 's/int(/serial(/g' drizzle/schema.ts | sed -i 's/\.autoincrement()//g' drizzle/schema.ts
sed -i 's/varchar(/varchar(/g' drizzle/schema.ts
sed -i 's/text(/text(/g' drizzle/schema.ts
sed -i 's/timestamp(/timestamp(/g' drizzle/schema.ts
sed -i 's/boolean(/boolean(/g' drizzle/schema.ts

echo "Schema converted to PostgreSQL"
