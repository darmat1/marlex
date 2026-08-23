import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';

describe('cli-discovery (macOS)', () => {
  const originalPlatform = process.platform;

  beforeEach(() => {
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    vi.resetModules();
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', { value: originalPlatform });
    vi.restoreAllMocks();
  });

  it('getSearchPaths includes the standard macOS locations plus PATH', async () => {
    const { getSearchPaths } = await import('./cli-discovery');
    const paths = getSearchPaths();
    expect(paths).toContain('/opt/homebrew/bin');
    expect(paths).toContain('/usr/local/bin');
    expect(paths.every((p) => p.length > 0)).toBe(true);
  });

  it('findBinary returns the first matching path and stops looking', async () => {
    const { findBinary } = await import('./cli-discovery');
    const spy = vi.spyOn(fs, 'existsSync').mockImplementation((p) => String(p) === '/usr/local/bin/claude');
    const result = findBinary('claude');
    expect(result).toBe('/usr/local/bin/claude');
    spy.mockRestore();
  });

  it('findBinary returns null when nothing on the search path matches', async () => {
    const { findBinary } = await import('./cli-discovery');
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    expect(findBinary('does-not-exist')).toBeNull();
  });

  it('hasApp checks both the system and user Applications folders on macOS', async () => {
    const { hasApp } = await import('./cli-discovery');
    const spy = vi.spyOn(fs, 'existsSync').mockImplementation((p) => String(p).includes('/Applications/ChatGPT.app'));
    expect(hasApp('ChatGPT')).toBe(true);
    spy.mockRestore();
  });

  it('hasApp returns false when the app is not installed anywhere', async () => {
    const { hasApp } = await import('./cli-discovery');
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    expect(hasApp('NotInstalledApp')).toBe(false);
  });
});
