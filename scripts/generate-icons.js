import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateIcons() {
  const svgPath = path.resolve('public/icon.svg');
  if (!fs.existsSync(svgPath)) {
    console.error('public/icon.svg not found');
    return;
  }

  const svgBuffer = fs.readFileSync(svgPath);

  // Generate 1024x1024 icon.png (standard for electron-builder macOS/Win icon conversion)
  await sharp(svgBuffer)
    .resize(1024, 1024)
    .png()
    .toFile(path.resolve('public/icon.png'));

  // Ensure build/ dir has icon.png as well
  if (!fs.existsSync(path.resolve('build'))) {
    fs.mkdirSync(path.resolve('build'), { recursive: true });
  }
  await sharp(svgBuffer)
    .resize(1024, 1024)
    .png()
    .toFile(path.resolve('build/icon.png'));

  console.log('✅ Generated 1024x1024 icon.png for macOS & Windows installers!');
}

generateIcons().catch(console.error);
