import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

async function searchInDir(dir, regex) {
  const files = await readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = join(dir, file.name);
    if (file.isDirectory()) {
      await searchInDir(fullPath, regex);
    } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
      const content = await readFile(fullPath, 'utf8');
      const matches = content.match(regex);
      if (matches) {
        console.log(`\x1b[33m${fullPath}\x1b[0m`);
        matches.forEach(m => console.log('   ', m));
      }
    }
  }
}

searchInDir('src', /masterdashboard/gi);
