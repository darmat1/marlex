import { describe, it, expect, beforeAll } from 'vitest';
import { renderSlideToCanvas, exportSlidesToZip, exportSlidesToPdf } from './export-utils';
import type { SlideItem, ClientProfile } from '../../types';

// vitest-canvas-mock's toDataURL() output isn't valid base64-encoded image bytes,
// which trips up JSZip/jsPDF's own base64 decoding once more than one slide is
// packed. A real 1x1 PNG keeps the export pipeline itself under test.
const ONE_PIXEL_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

beforeAll(() => {
  HTMLCanvasElement.prototype.toDataURL = () => ONE_PIXEL_PNG;
});

const profile: ClientProfile = {
  id: 'p1',
  name: 'Test',
  instagramHandle: '@test',
  telegramChannel: '@test',
  linkedInUrl: 'https://linkedin.com/in/test',
  threadsHandle: '@test',
  defaultBgColor: '#9B6140',
  defaultAccentColor: '#D1B852',
  defaultTextColor: '#FFFFFF',
  defaultFont: 'Source Sans 3',
  photoOpacity: 15,
};

function makeSlide(overrides: Partial<SlideItem> = {}): SlideItem {
  return {
    id: 's1',
    slideNumber: 1,
    type: 'cover',
    headline: 'Test headline',
    subheadline: 'Test subheadline',
    bodyParagraphs: [],
    accentWords: [],
    showArrow: true,
    ...overrides,
  };
}

describe('renderSlideToCanvas', () => {
  it('renders a slide with no background image without throwing', async () => {
    const canvas = await renderSlideToCanvas(makeSlide(), profile, 1, null);
    expect(canvas.width).toBeGreaterThan(0);
    expect(canvas.height).toBeGreaterThan(0);
  });

  it('renders a slide with an anomalously long headline/body without throwing', async () => {
    const longText = 'Слово '.repeat(200).trim();
    const canvas = await renderSlideToCanvas(
      makeSlide({
        headline: longText,
        subheadline: longText,
        bodyParagraphs: [longText, longText, longText],
        accentWords: ['Слово'],
      }),
      profile,
      1,
      null
    );
    expect(canvas.width).toBeGreaterThan(0);
  });

  it('renders a final-type slide (different layout branch) without throwing', async () => {
    const canvas = await renderSlideToCanvas(makeSlide({ type: 'final', showArrow: false }), profile, 3, null);
    expect(canvas.width).toBeGreaterThan(0);
  });
});

describe('exportSlidesToZip', () => {
  it('produces an (empty) zip for zero slides without throwing', async () => {
    const blob = await exportSlidesToZip([], profile, 'empty-project', null);
    expect(blob.size).toBeGreaterThan(0); // a valid empty zip archive is still a few bytes
  });

  it('produces a zip for a normal slide set', async () => {
    const blob = await exportSlidesToZip([makeSlide(), makeSlide({ id: 's2', slideNumber: 2, type: 'content' })], profile, 'project', null);
    expect(blob.size).toBeGreaterThan(0);
  });
});

describe('exportSlidesToPdf', () => {
  it('produces a PDF for zero slides without throwing', async () => {
    const blob = await exportSlidesToPdf([], profile, null);
    expect(blob.size).toBeGreaterThan(0);
  });
});
