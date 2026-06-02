import chroma from 'chroma-js';

import type { ColorScale } from './types.js';

const SCALE_KEYS: (keyof ColorScale)[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

/**
 * 將 chroma 色物件轉成 `'H S% L%'` 三段字串（不含 hsl() 包裹）。
 * CSS 端用 `hsl(var(--color-primary-500))` 或 `hsl(var(--color-primary-500) / 0.5)` 套用。
 */
function toHslString(color: chroma.Color): string {
  const [h, s, l] = color.hsl();
  // chroma 在 achromatic（黑、白、灰）會回 NaN hue
  const hue = Number.isNaN(h) ? 0 : Math.round(h);
  const sat = Math.round(s * 100);
  const lit = Math.round(l * 100);
  return `${hue} ${sat}% ${lit}%`;
}

/**
 * 從單一品牌色（hex / rgb / hsl 皆可）生成 11 階 ColorScale。
 *
 * 採 LCH 色彩空間插值，輸出較 RGB 線性插值更符合視覺感受。
 * 50 為近白、500 為原色、950 為近黑。
 */
export function generateColorScale(baseColor: string): ColorScale {
  if (!chroma.valid(baseColor)) {
    throw new Error(`generateColorScale: invalid color "${baseColor}"`);
  }
  const colors = chroma.scale(['#ffffff', baseColor, '#000000']).mode('lch').colors(11, null);
  const entries = SCALE_KEYS.map((key, i) => [key, toHslString(colors[i]!)] as const);
  return Object.fromEntries(entries) as unknown as ColorScale;
}

/**
 * 將既有 ColorScale 套用色相位移（hueShift），常用於生成 dark mode 色階。
 */
export function shiftColorScale(scale: ColorScale, hueShiftDeg: number): ColorScale {
  const shifted: Partial<Record<keyof ColorScale, string>> = {};
  for (const key of SCALE_KEYS) {
    const value = scale[key];
    const [h, s, l] = value.split(' ');
    const hue = (Number.parseInt(h ?? '0', 10) + hueShiftDeg + 360) % 360;
    shifted[key] = `${hue} ${s} ${l}`;
  }
  return shifted as ColorScale;
}
