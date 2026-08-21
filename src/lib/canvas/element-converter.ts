import { CanvasElement, SlideItem, ClientProfile } from '../../types';

export function getSlideElements(
  slide: SlideItem,
  profile: ClientProfile,
  totalSlides: number,
  globalBgPhotoUrl: string | null
): CanvasElement[] {
  // If slide has custom elements AND the text matches the current slide data, preserve user's manual positions
  if (slide.elements && slide.elements.length > 0) {
    const headlineEl = slide.elements.find((e) => e.id === 'headline');
    const subheadlineEl = slide.elements.find((e) => e.id === 'subheadline');
    
    const isHeadlineSynced = !slide.headline || headlineEl?.text === slide.headline;
    const isSubheadlineSynced = !slide.subheadline || subheadlineEl?.text === slide.subheadline;

    if (isHeadlineSynced && isSubheadlineSynced) {
      return slide.elements;
    }
  }

  // Otherwise, automatically generate a clean, harmoniously spaced layout
  const elements: CanvasElement[] = [];
  const isCover = slide.type === 'cover';
  const textColor = profile.defaultTextColor || '#FFFFFF';
  const accentColor = slide.slideAccentColor || profile.defaultAccentColor || '#D1B852';

  const hasPhoto = !!(slide.photoUrl || (isCover && globalBgPhotoUrl));
  const textPosition = slide.textPosition || (hasPhoto ? 'bottom' : (isCover ? 'center' : 'top'));

  // 1. Header Handle (Top Left)
  elements.push({
    id: 'header_handle',
    type: 'text',
    x: 80,
    y: 80,
    width: 500,
    text: profile.instagramHandle,
    fontSize: 34,
    fontWeight: 700,
    color: textColor,
    textAlign: 'left',
    zIndex: 30,
  });

  // 2. Header Slide Number (Top Right)
  elements.push({
    id: 'header_counter',
    type: 'text',
    x: 820,
    y: 80,
    width: 180,
    text: `${slide.slideNumber.toString().padStart(2, '0')} / ${totalSlides.toString().padStart(2, '0')}`,
    fontSize: 28,
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
    zIndex: 30,
  });

  // 3. Header Accent Bar
  elements.push({
    id: 'header_bar',
    type: 'shape',
    shapeType: 'pill',
    x: 80,
    y: 125,
    width: 70,
    height: 5,
    bgColor: accentColor,
    zIndex: 30,
  });

  // Dynamic Vertical Layout Calculation based on Image / Text Position
  let currentY = 220;

  if (textPosition === 'bottom') {
    // When photo occupies top/middle (e.g. face/diagram), shift text to lower 45% of slide
    currentY = isCover ? 620 : 580;
  } else if (textPosition === 'center' || isCover) {
    currentY = 440;
  } else {
    currentY = 220;
  }

  // 4. Headline
  if (slide.headline) {
    const headlineFontSize = isCover ? 62 : 50;
    const charsPerLine = isCover ? 24 : 28;
    const headlineLines = Math.max(1, Math.ceil(slide.headline.length / charsPerLine));
    const headlineHeight = headlineLines * (headlineFontSize * 1.3) + 20;

    elements.push({
      id: 'headline',
      type: 'text',
      x: 80,
      y: currentY,
      width: 920,
      text: slide.headline,
      fontSize: headlineFontSize,
      fontWeight: 800,
      color: textColor,
      accentWords: slide.accentWords || [],
      textAlign: 'left',
      zIndex: 30,
    });

    currentY += headlineHeight + (isCover ? 36 : 24);
  }

  // 5. Subheadline
  if (slide.subheadline) {
    const subFontSize = isCover ? 42 : 36;
    const charsPerLine = isCover ? 34 : 38;
    const subLines = Math.max(1, Math.ceil(slide.subheadline.length / charsPerLine));
    const subHeight = subLines * (subFontSize * 1.35) + 16;

    elements.push({
      id: 'subheadline',
      type: 'text',
      x: 80,
      y: currentY,
      width: 920,
      text: slide.subheadline,
      fontSize: subFontSize,
      fontWeight: 500,
      color: 'rgba(255, 255, 255, 0.95)',
      accentWords: slide.accentWords || [],
      textAlign: 'left',
      zIndex: 30,
    });

    currentY += subHeight + 28;
  }

  // 6. Body Paragraphs (Content Cards)
  if (slide.bodyParagraphs && slide.bodyParagraphs.length > 0) {
    slide.bodyParagraphs.forEach((para, idx) => {
      const paraLines = Math.max(1, Math.ceil(para.length / 40));
      const cardHeight = Math.max(86, paraLines * 50 + 44);

      elements.push({
        id: `paragraph_${idx}`,
        type: 'text',
        x: 80,
        y: currentY,
        width: 920,
        height: cardHeight,
        text: para,
        fontSize: 36,
        fontWeight: 400,
        color: textColor,
        accentWords: slide.accentWords || [],
        textAlign: 'left',
        bgColor: hasPhoto ? 'rgba(0, 0, 0, 0.55)' : 'rgba(255, 255, 255, 0.08)',
        borderRadius: 18,
        zIndex: 30,
      });

      currentY += cardHeight + 20;
    });
  }

  // 7. Footer Profile Name
  elements.push({
    id: 'footer_name',
    type: 'text',
    x: 80,
    y: 1240,
    width: 400,
    text: profile.name,
    fontSize: 26,
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'left',
    zIndex: 30,
  });

  // 8. Footer Swipe Arrow / Final CTA Badge
  if (slide.showArrow) {
    elements.push({
      id: 'footer_arrow',
      type: 'badge',
      x: 780,
      y: 1220,
      width: 220,
      height: 60,
      text: 'листай  →',
      fontSize: 32,
      fontWeight: 800,
      color: accentColor,
      bgColor: 'rgba(0, 0, 0, 0.65)',
      borderRadius: 999,
      zIndex: 30,
    });
  } else if (slide.type === 'final') {
    elements.push({
      id: 'footer_arrow',
      type: 'badge',
      x: 760,
      y: 1220,
      width: 240,
      height: 60,
      text: 'сохрани  🏷️',
      fontSize: 32,
      fontWeight: 800,
      color: accentColor,
      bgColor: 'rgba(0, 0, 0, 0.65)',
      borderRadius: 999,
      zIndex: 30,
    });
  }

  return elements;
}
