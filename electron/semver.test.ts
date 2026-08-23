import { describe, it, expect } from 'vitest';
import { compareSemver } from './semver';

describe('compareSemver', () => {
  it('orders plain releases numerically', () => {
    expect(compareSemver('1.2.3', '1.2.2')).toBe(1);
    expect(compareSemver('1.2.2', '1.2.3')).toBe(-1);
    expect(compareSemver('1.2.3', '1.2.3')).toBe(0);
  });

  it('strips a leading v', () => {
    expect(compareSemver('v1.2.3', '1.2.2')).toBe(1);
  });

  it('handles a different number of version segments', () => {
    expect(compareSemver('1.2', '1.2.0')).toBe(0);
    expect(compareSemver('1.2.1', '1.2')).toBe(1);
    expect(compareSemver('1.2', '1.2.1')).toBe(-1);
  });

  it('ranks a pre-release below the same plain release', () => {
    expect(compareSemver('0.1.4', '0.1.4-beta')).toBe(1);
    expect(compareSemver('0.1.4-beta', '0.1.4')).toBe(-1);
  });

  it('does not treat a pre-release suffix as extra version weight', () => {
    // Regression: naive parseInt('4-beta') === 4, so this used to compare
    // equal to a later release with a higher patch number.
    expect(compareSemver('0.1.4-beta', '0.1.5')).toBe(-1);
  });

  it('orders two pre-releases of the same core lexically', () => {
    expect(compareSemver('1.0.0-alpha', '1.0.0-beta')).toBe(-1);
    expect(compareSemver('1.0.0-beta', '1.0.0-alpha')).toBe(1);
  });

  it('treats malformed/non-numeric segments as 0 rather than throwing', () => {
    expect(() => compareSemver('not-a-version', '1.0.0')).not.toThrow();
    expect(compareSemver('', '1.0.0')).toBe(-1);
  });
});
