/**
 * Extracts dominant palette from an HTML image element or data URL
 */
export async function extractPaletteFromImage(
  imageSrc: string
): Promise<{ bgColor: string; accentColor: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({ bgColor: '#9B6140', accentColor: '#D1B852' });
        }
        ctx.drawImage(img, 0, 0, 100, 100);
        const imgData = ctx.getImageData(0, 0, 100, 100).data;

        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        for (let i = 0; i < imgData.length; i += 16) {
          rSum += imgData[i];
          gSum += imgData[i + 1];
          bSum += imgData[i + 2];
          count++;
        }

        const avgR = Math.round(rSum / count);
        const avgG = Math.round(gSum / count);
        const avgB = Math.round(bSum / count);

        // Darken for good background contrast
        const bgR = Math.max(20, Math.round(avgR * 0.75));
        const bgG = Math.max(20, Math.round(avgG * 0.75));
        const bgB = Math.max(20, Math.round(avgB * 0.75));
        const bgColor = `#${bgR.toString(16).padStart(2, '0')}${bgG.toString(16).padStart(2, '0')}${bgB.toString(16).padStart(2, '0')}`;

        // Create warm golden/yellow or complementary accent
        const accentColor = '#D1B852';

        resolve({ bgColor, accentColor });
      } catch (e) {
        resolve({ bgColor: '#9B6140', accentColor: '#D1B852' });
      }
    };
    img.onerror = () => {
      resolve({ bgColor: '#9B6140', accentColor: '#D1B852' });
    };
    img.src = imageSrc;
  });
}
