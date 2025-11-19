import { existsSync, copyFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildDir = path.join(__dirname, '..', 'build');
const indexFile = path.join(buildDir, 'index.html');
const fallbackFile = path.join(buildDir, '200.html');

if (!existsSync(indexFile)) {
  console.error('Error: index.html not found. Did the build succeed?');
  process.exit(1);
}

try {
  copyFileSync(indexFile, fallbackFile);
  console.log('✅ 200.html created from build/index.html');
} catch (err) {
  console.error('Failed to copy index.html to 200.html:', err);
  process.exit(1);
}
