import { describe, expect, it } from 'vitest';

import { buildMotionVariants, motionVariants } from '../motion-variants.js';

import type { Variants } from 'framer-motion';

type Frame = Record<string, unknown>;

function getHidden(variants: Variants): Frame {
  return variants.hidden as Frame;
}

describe('motionVariants', () => {
  it('Level 1-5 都產出四種 variant', () => {
    const levels = [1, 2, 3, 4, 5] as const;
    const names = ['fadeIn', 'slideUp', 'slideRight', 'scale'] as const;
    for (const level of levels) {
      for (const name of names) {
        const v = motionVariants[level][name];
        expect(v).toBeDefined();
        expect(v.hidden).toBeDefined();
        expect(v.visible).toBeDefined();
      }
    }
  });

  it('Level 1 fadeIn 僅有 opacity（無位移、scale、rotate）', () => {
    const hidden = getHidden(motionVariants[1].fadeIn);
    expect(hidden.opacity).toBe(0);
    expect(hidden.y).toBeUndefined();
    expect(hidden.x).toBeUndefined();
    expect(hidden.scale).toBeUndefined();
    expect(hidden.rotate).toBeUndefined();
  });

  it('Level 2 slideUp 帶 8px 位移、無 scale', () => {
    const hidden = getHidden(motionVariants[2].slideUp);
    expect(hidden.y).toBe(8);
    expect(hidden.scale).toBeUndefined();
  });

  it('Level 3 slideUp 帶 16px + 微 scale 0.95', () => {
    const hidden = getHidden(motionVariants[3].slideUp);
    expect(hidden.y).toBe(16);
    expect(hidden.scale).toBe(0.95);
  });

  it('Level 4 slideUp 帶 24px + scale + rotate', () => {
    const hidden = getHidden(motionVariants[4].slideUp);
    expect(hidden.y).toBe(24);
    expect(hidden.scale).toBeDefined();
    expect(hidden.rotate).toBeDefined();
  });

  it('Level 5 slideUp 帶 32px 且 transition 為 spring', () => {
    const v = motionVariants[5].slideUp;
    const hidden = getHidden(v);
    expect(hidden.y).toBe(32);
    const visible = v.visible as Frame;
    const transition = visible.transition as Frame;
    expect(transition.type).toBe('spring');
  });

  it('buildMotionVariants 與 motionVariants 表查一致', () => {
    const built = buildMotionVariants(3);
    expect(built.fadeIn).toEqual(motionVariants[3].fadeIn);
    expect(built.scale).toEqual(motionVariants[3].scale);
  });
});
