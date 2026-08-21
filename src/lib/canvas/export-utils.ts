import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { SlideItem, ClientProfile, CanvasElement } from '../../types';
import { getSlideElements } from './element-converter';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img); // soft-fail to avoid blocking export
    img.src = src;
  });
}

/**
 * Draws a single 1080x1350 slide on an HTML5 Canvas with pixel-perfect precision
 */
export async function renderSlideToCanvas(
  slide: SlideItem,
  profile: ClientProfile,
  totalSlides: number,
  globalBgImageElement?: HTMLImageElement | null
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get 2d context');

  const bgColor = slide.slideBgColor || profile.defaultBgColor || '#1c1917';
  const accentColor = slide.slideAccentColor || profile.defaultAccentColor || '#D1B852';
  const fontName = profile.defaultFont || 'Source Sans 3';
  const isCover = slide.type === 'cover';

  // Determine slide image
  let slideImg: HTMLImageElement | null = null;
  if (slide.photoUrl) {
    try {
      slideImg = await loadImage(slide.photoUrl);
    } catch {
      slideImg = null;
    }
  } else if (isCover && globalBgImageElement) {
    slideImg = globalBgImageElement;
  }

  // 1. Base Fill
  ctx.fillStyle = slideImg ? '#09090b' : bgColor;
  ctx.fillRect(0, 0, 1080, 1350);

  // 2. Draw Slide Photo with High-Contrast Gradient Protection
  if (slideImg && slideImg.complete && slideImg.naturalWidth > 0) {
    ctx.save();
    const opacity = (slide.photoOpacity !== undefined ? slide.photoOpacity : 90) / 100;
    ctx.globalAlpha = opacity;

    const imgRatio = slideImg.width / slideImg.height;
    const canvasRatio = 1080 / 1350;
    let renderW = 1080;
    let renderH = 1350;
    let renderX = 0;
    let renderY = 0;

    if (imgRatio > canvasRatio) {
      renderW = 1350 * imgRatio;
      renderX = (1080 - renderW) / 2;
    } else {
      renderH = 1080 / imgRatio;
      renderY = (1350 - renderH) / 2;
    }

    ctx.drawImage(slideImg, renderX, renderY, renderW, renderH);
    ctx.restore();

    // Apply high-contrast smooth dark gradient to protect text legibility
    const grad = ctx.createLinearGradient(0, 0, 0, 1350);
    grad.addColorStop(0, 'rgba(9, 9, 11, 0.55)');
    grad.addColorStop(0.35, 'rgba(9, 9, 11, 0.25)');
    grad.addColorStop(0.65, 'rgba(9, 9, 11, 0.85)');
    grad.addColorStop(1, 'rgba(9, 9, 11, 0.96)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1350);
  }

  // 3. Render Canvas Elements (Sorted by Z-Index)
  const elements = getSlideElements(slide, profile, totalSlides, slide.photoUrl || (isCover ? profile.instagramHandle : null));
  const sorted = [...elements].sort((a, b) => (a.zIndex || 10) - (b.zIndex || 10));

  for (const el of sorted) {
    if (el.type === 'shape') {
      ctx.save();
      if (el.shapeType === 'glow_orb') {
        const radGrad = ctx.createRadialGradient(
          el.x + el.width / 2, el.y + (el.height || el.width) / 2, 0,
          el.x + el.width / 2, el.y + (el.height || el.width) / 2, el.width / 2
        );
        radGrad.addColorStop(0, el.bgColor || `${accentColor}50`);
        radGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = radGrad;
        ctx.fillRect(el.x, el.y, el.width, el.height || el.width);
      } else if (el.shapeType === 'vignette_bottom') {
        const vGrad = ctx.createLinearGradient(0, el.y, 0, el.y + (el.height || 600));
        vGrad.addColorStop(0, 'transparent');
        vGrad.addColorStop(0.5, 'rgba(0,0,0,0.6)');
        vGrad.addColorStop(1, 'rgba(0,0,0,0.92)');
        ctx.fillStyle = vGrad;
        ctx.fillRect(el.x, el.y, el.width, el.height || 600);
      } else {
        ctx.fillStyle = el.bgColor || accentColor;
        const rad = el.borderRadius !== undefined ? el.borderRadius : (el.shapeType === 'circle' ? el.width / 2 : 18);
        roundRect(ctx, el.x, el.y, el.width, el.height || 6, rad);
        ctx.fill();
        if (el.borderWidth) {
          ctx.lineWidth = el.borderWidth;
          ctx.strokeStyle = el.borderColor || accentColor;
          ctx.stroke();
        }
      }
      ctx.restore();
    } else if (el.type === 'text' || el.type === 'badge') {
      const fontSize = el.fontSize || 40;
      const fontWeight = el.fontWeight || 500;
      const color = el.color || '#FFFFFF';
      const fontSpec = `${fontWeight} ${fontSize}px "${fontName}", sans-serif`;

      if (el.type === 'badge') {
        // Draw centered pill badge
        ctx.fillStyle = el.bgColor || 'rgba(0,0,0,0.65)';
        roundRect(ctx, el.x, el.y, el.width, el.height || 60, el.borderRadius || 999);
        ctx.fill();

        if (el.borderWidth || el.borderColor) {
          ctx.lineWidth = el.borderWidth || 1.5;
          ctx.strokeStyle = el.borderColor || `${accentColor}50`;
          ctx.stroke();
        }

        ctx.font = `800 ${fontSize}px "${fontName}", sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(el.text || '', el.x + el.width / 2, el.y + (el.height || 60) / 2);
      } else {
        // Draw Text Element
        if (el.bgColor && el.bgColor !== 'transparent') {
          ctx.fillStyle = el.bgColor;
          roundRect(ctx, el.x, el.y, el.width, el.height || 80, el.borderRadius || 18);
          ctx.fill();

          if (el.borderWidth) {
            ctx.lineWidth = el.borderWidth;
            ctx.strokeStyle = el.borderColor || accentColor;
            ctx.stroke();
          }
        }

        ctx.font = fontSpec;
        ctx.fillStyle = color;
        ctx.textAlign = (el.textAlign as CanvasTextAlign) || 'left';
        ctx.textBaseline = 'top';

        const paddingX = el.bgColor && el.bgColor !== 'transparent' ? 24 : 0;
        const paddingY = el.bgColor && el.bgColor !== 'transparent' ? 20 : 0;
        const textX = el.textAlign === 'center' ? el.x + el.width / 2 : el.x + paddingX;
        const maxTextWidth = el.width - paddingX * 2;

        drawWrappedTextWithAccents(
          ctx,
          el.text || '',
          textX,
          el.y + paddingY,
          maxTextWidth,
          fontSize * 1.35,
          el.accentWords || slide.accentWords || [],
          accentColor,
          color,
          fontName,
          fontSize,
          fontWeight
        );
      }
    }
  }

  return canvas;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawWrappedTextWithAccents(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  accentWords: string[],
  accentColor: string,
  defaultTextColor: string,
  fontName: string,
  fontSize: number,
  fontWeight: string | number
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      drawLineWithAccents(ctx, line.trim(), x, currentY, accentWords, accentColor, defaultTextColor, fontName, fontSize, fontWeight);
      line = words[i] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  drawLineWithAccents(ctx, line.trim(), x, currentY, accentWords, accentColor, defaultTextColor, fontName, fontSize, fontWeight);
}

function drawLineWithAccents(
  ctx: CanvasRenderingContext2D,
  lineText: string,
  x: number,
  y: number,
  accentWords: string[],
  accentColor: string,
  defaultTextColor: string,
  fontName: string,
  fontSize: number,
  fontWeight: string | number
) {
  const words = lineText.split(' ');
  let currentX = x;

  for (const word of words) {
    const isAccent = accentWords && accentWords.some(
      (acc) => acc && word.toLowerCase().includes(acc.toLowerCase().trim())
    );
    const wordText = word + ' ';
    const wordWidth = ctx.measureText(wordText).width;

    if (isAccent) {
      ctx.save();
      ctx.fillStyle = accentColor;
      roundRect(ctx, currentX - 4, y - 4, wordWidth + 4, fontSize + 8, 6);
      ctx.fill();
      ctx.fillStyle = '#09090B';
      ctx.font = `800 ${fontSize}px "${fontName}", sans-serif`;
      ctx.fillText(wordText, currentX, y);
      ctx.restore();
    } else {
      ctx.fillStyle = defaultTextColor;
      ctx.fillText(wordText, currentX, y);
    }
    currentX += wordWidth;
  }
}

export async function exportSlidesToZip(
  slides: SlideItem[],
  profile: ClientProfile,
  projectName: string,
  bgImg?: HTMLImageElement | null
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(projectName || 'carousel_slides');

  for (let i = 0; i < slides.length; i++) {
    const canvas = await renderSlideToCanvas(slides[i], profile, slides.length, bgImg);
    const dataUrl = canvas.toDataURL('image/png');
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    folder?.file(`slide_${(i + 1).toString().padStart(2, '0')}.png`, base64Data, { base64: true });
  }

  return zip.generateAsync({ type: 'blob' });
}

export async function exportSlidesToPdf(
  slides: SlideItem[],
  profile: ClientProfile,
  bgImg?: HTMLImageElement | null
): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [1080, 1350]
  });

  for (let i = 0; i < slides.length; i++) {
    if (i > 0) pdf.addPage([1080, 1350], 'portrait');
    const canvas = await renderSlideToCanvas(slides[i], profile, slides.length, bgImg);
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, 1080, 1350);
  }

  return pdf.output('blob');
}
