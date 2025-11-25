import { generateAllTemplates } from '../server/utils/pptx-generator.js';
import path from 'path';

const TEMPLATES_DIR = path.join(process.cwd(), 'public', 'templates');

async function main() {
  console.log('🚀 Generating PowerPoint templates...');
  console.log(`📁 Output directory: ${TEMPLATES_DIR}`);
  
  try {
    const files = await generateAllTemplates(TEMPLATES_DIR);
    console.log(`\n✅ Successfully generated ${files.length} templates:`);
    files.forEach(file => console.log(`   - ${file}`));
  } catch (error) {
    console.error('❌ Failed to generate templates:', error);
    process.exit(1);
  }
}

main();
