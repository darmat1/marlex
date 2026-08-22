import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import sharp from 'sharp';

async function buildIcns() {
  const svgPath = path.resolve('public/icon.svg');
  const iconsetDir = path.resolve('build/icon.iconset');
  const buildDir = path.resolve('build');

  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  if (!fs.existsSync(iconsetDir)) {
    fs.mkdirSync(iconsetDir, { recursive: true });
  }

  const svgBuffer = fs.readFileSync(svgPath);

  // Standard macOS iconset sizes
  const sizes = [
    { name: 'icon_16x16.png', size: 16 },
    { name: 'icon_16x16@2x.png', size: 32 },
    { name: 'icon_32x32.png', size: 32 },
    { name: 'icon_32x32@2x.png', size: 64 },
    { name: 'icon_128x128.png', size: 128 },
    { name: 'icon_128x128@2x.png', size: 256 },
    { name: 'icon_256x256.png', size: 256 },
    { name: 'icon_256x256@2x.png', size: 512 },
    { name: 'icon_512x512.png', size: 512 },
    { name: 'icon_512x512@2x.png', size: 1024 },
  ];

  for (const item of sizes) {
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(path.join(iconsetDir, item.name));
  }

  // Generate 1024x1024 icon.png
  await sharp(svgBuffer)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(buildDir, 'icon.png'));

  await sharp(svgBuffer)
    .resize(1024, 1024)
    .png()
    .toFile(path.resolve('public/icon.png'));

  // Run native macOS iconutil
  try {
    execSync(`iconutil -c icns "${iconsetDir}" -o "${path.join(buildDir, 'icon.icns')}"`);
    console.log('✅ Successfully created native Apple build/icon.icns!');
  } catch (err) {
    console.error('iconutil failed:', err.message);
  }
}

buildIcns().catch(console.error);
