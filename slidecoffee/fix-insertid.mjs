import { readFileSync, writeFileSync } from 'fs';

const file = 'server/db.ts';
let content = readFileSync(file, 'utf8');

// Find all functions that use insertId and fix them
const fixes = [
  // createWorkspace
  {
    find: /const result = await db\.insert\(workspaces\)\.values\({[\s\S]*?}\);[\s\n]*return result\[0\]\.insertId;/,
    replace: (match) => match.replace('});', '}).returning({ id: workspaces.id });').replace('result[0].insertId', 'result[0].id')
  },
  // createBrand
  {
    find: /const result = await db\.insert\(brands\)\.values\({[\s\S]*?}\);[\s\n]*return result\[0\]\.insertId;/g,
    replace: (match) => match.replace('});', '}).returning({ id: brands.id });').replace('result[0].insertId', 'result[0].id')
  },
  // createPresentation  
  {
    find: /const result = await db\.insert\(presentations\)\.values\({[\s\S]*?}\);[\s\n]*return result\[0\]\.insertId;/g,
    replace: (match) => match.replace('});', '}).returning({ id: presentations.id });').replace('result[0].insertId', 'result[0].id')
  },
];

// Apply simple replacements for remaining cases
content = content.replace(/\.insert\(([a-zA-Z]+)\)\.values\(([^)]+)\)\;[\s\n]+return result\[0\]\.insertId;/g, 
  (match, table) => {
    return match
      .replace('});', `}).returning({ id: ${table}.id });`)
      .replace('result[0].insertId', 'result[0].id');
  });

writeFileSync(file, content);
console.log('✅ Fixed all insertId usages');
