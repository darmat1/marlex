import { describe, it, expect } from 'vitest';
import { parseModelJson, extractSlideCount } from './llm-client';

describe('parseModelJson', () => {
  it('parses a clean JSON object', () => {
    expect(parseModelJson('{"title":"Hi","slides":[]}')).toEqual({ title: 'Hi', slides: [] });
  });

  it('extracts the JSON object from surrounding prose', () => {
    const raw = 'Конечно! Вот ваш JSON:\n\n{"title":"Hi"}\n\nНадеюсь, помогло!';
    expect(parseModelJson(raw)).toEqual({ title: 'Hi' });
  });

  it('extracts JSON wrapped in a markdown code fence', () => {
    const raw = '```json\n{"title":"Fenced"}\n```';
    expect(parseModelJson(raw)).toEqual({ title: 'Fenced' });
  });

  it('returns null for malformed JSON instead of throwing', () => {
    expect(parseModelJson('{"title": "unterminated')).toBeNull();
  });

  it('returns null for empty or non-JSON text', () => {
    expect(parseModelJson('')).toBeNull();
    expect(parseModelJson('Sorry, I cannot help with that.')).toBeNull();
  });

  it('returns null when braces are present but out of order', () => {
    expect(parseModelJson('} not json {')).toBeNull();
  });

  it('handles nested braces inside the JSON correctly', () => {
    const raw = '{"slides":[{"headline":"a"},{"headline":"b"}]}';
    expect(parseModelJson(raw)).toEqual({ slides: [{ headline: 'a' }, { headline: 'b' }] });
  });
});

describe('extractSlideCount', () => {
  it('reads an explicit slide count from the prompt', () => {
    expect(extractSlideCount('Сделай карусель из 9 слайдов про AI')).toBe(9);
    expect(extractSlideCount('6 slides about growth')).toBe(6);
  });

  it('falls back to a default when no count is mentioned', () => {
    expect(extractSlideCount('Просто расскажи про AI')).toBeGreaterThan(0);
  });
});
