import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist-electron');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(
  path.join(distDir, 'package.json'),
  JSON.stringify({ type: 'commonjs' }, null, 2)
);

console.log('dist-electron/package.json created successfully');
