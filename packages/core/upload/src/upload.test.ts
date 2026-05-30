import { describe, expect, it } from 'vitest';

import {
  IMAGE_SIZES,
  deriveVariantKey,
  getVariantWidth,
  listVariants,
} from './index.js';

describe('image helpers', () => {
  it('deriveVariantKey 拼出 .thumbnail.jpg', () => {
    expect(deriveVariantKey('a/b/c.jpg', 'thumbnail')).toBe(
      'a/b/c.thumbnail.jpg',
    );
  });

  it('deriveVariantKey 可指定 webp 副檔名', () => {
    expect(deriveVariantKey('a/b/c.jpg', 'medium', 'webp')).toBe(
      'a/b/c.medium.webp',
    );
  });

  it('deriveVariantKey 處理無副檔名 key', () => {
    expect(deriveVariantKey('a/b/c', 'small')).toBe('a/b/c.small');
  });

  it('getVariantWidth 對應 IMAGE_SIZES', () => {
    expect(getVariantWidth('thumbnail')).toBe(IMAGE_SIZES.thumbnail);
    expect(getVariantWidth('large')).toBe(IMAGE_SIZES.large);
    expect(getVariantWidth('original')).toBe(0);
  });

  it('listVariants 預設 5 種', () => {
    expect(listVariants()).toEqual([
      'thumbnail',
      'small',
      'medium',
      'large',
      'original',
    ]);
  });

  it('listVariants 可自訂', () => {
    expect(listVariants({ sizes: ['thumbnail', 'medium'] })).toEqual([
      'thumbnail',
      'medium',
    ]);
  });
});
