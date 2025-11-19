// scripts/copy-200.js
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const indexFile = path.join(buildDir, 'index.html');
const fallbackFile = path.join(buildDir, '200.html');

if (!fs.existsSync(indexFile)) {
  console.error('Error: index.html not found. Did the build succeed?');
  process.exit(1);
}

try {
  fs.copyFileSync(indexFile, fallbackFile);
  console.log('✅ 200.html created from build/index.html');
} catch (err) {
  console.error('Failed to copy index.html to 200.html:', err);
  process.exit(1);
}
