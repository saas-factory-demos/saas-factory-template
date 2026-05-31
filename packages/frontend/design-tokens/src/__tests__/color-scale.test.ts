import { describe, expect, it } from 'vitest';

import { generateColorScale, shiftColorScale } from '../color-scale.js';

describe('generateColorScale', () => {
  it('生成 11 階 HSL 字串', () => {
    const scale = generateColorScale('#3b82f6');
    const keys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
    for (const key of keys) {
      const value = scale[key];
      expect(value).toMatch(/^\d+ \d+% \d+%$/);
    }
  });

  it('50 階近白、950 階近黑', () => {
    const scale = generateColorScale('#3b82f6');
    const [, , l50] = scale[50].split(' ');
    const [, , l950] = scale[950].split(' ');
    expect(Number.parseInt(l50 ?? '0', 10)).toBeGreaterThan(90);
    expect(Number.parseInt(l950 ?? '100', 10)).toBeLessThan(15);
  });

  it('500 階亮度落在中段', () => {
    const scale = generateColorScale('#3b82f6');
    const [, , l500] = scale[500].split(' ');
    const lit = Number.parseInt(l500 ?? '0', 10);
    expect(lit).toBeGreaterThan(35);
    expect(lit).toBeLessThan(75);
  });

  it('無效色值 throw', () => {
    expect(() => generateColorScale('not-a-color')).toThrow(/invalid color/);
  });

  it('shiftColorScale 改變色相但保留 S/L', () => {
    const scale = generateColorScale('#3b82f6');
    const shifted = shiftColorScale(scale, 90);
    const [h1, s1, l1] = scale[500].split(' ');
    const [h2, s2, l2] = shifted[500].split(' ');
    expect(s2).toBe(s1);
    expect(l2).toBe(l1);
    expect(Number.parseInt(h2 ?? '0', 10)).toBe((Number.parseInt(h1 ?? '0', 10) + 90) % 360);
  });
});
