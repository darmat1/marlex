/** Minimal semver comparator for GitHub release tags: returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal. */
export function compareSemver(v1: string, v2: string): number {
  const parse = (v: string) => {
    const clean = v.replace(/^v/, '');
    const [core, ...preParts] = clean.split('-');
    const nums = core.split('.').map((n) => parseInt(n, 10) || 0);
    const pre = preParts.join('-') || null;
    return { nums, pre };
  };
  const a = parse(v1);
  const b = parse(v2);

  for (let i = 0; i < Math.max(a.nums.length, b.nums.length); i++) {
    const num1 = a.nums[i] || 0;
    const num2 = b.nums[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  // Same numeric core: per semver, a pre-release (e.g. "-beta") is lower
  // precedence than the same version without one.
  if (a.pre && !b.pre) return -1;
  if (!a.pre && b.pre) return 1;
  if (a.pre && b.pre) return a.pre < b.pre ? -1 : a.pre > b.pre ? 1 : 0;
  return 0;
}
