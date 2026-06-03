import { z } from 'zod';

import {
  ctaSchema,
  imageAssetSchema,
  motionConfigSchema,
} from '../_shared/schema-helpers.js';

/** Hero 支援的 variant slug 清單（6 個）。 */
export const HERO_VARIANTS = [
  'centered',
  'split-left-image',
  'split-right-image',
  'full-bleed-image',
  'video-bg',
  'gradient-stack',
] as const;

export type HeroVariant = (typeof HERO_VARIANTS)[number];

export const heroSchema = z.object({
  variant: z.enum(HERO_VARIANTS).default('centered'),
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(160),
  subheadline: z.string().max(320).optional(),
  ctas: z.array(ctaSchema).max(3).default([]),
  image: imageAssetSchema.optional(),
  /** 影片 URL，僅在 video-bg variant 生效。 */
  videoUrl: z.string().optional(),
  motion: motionConfigSchema,
});

export type HeroProps = z.infer<typeof heroSchema>;

export const heroDefaults: HeroProps = {
  variant: 'centered',
  eyebrow: undefined,
  headline: '在這裡寫下品牌標語',
  subheadline: '一句話傳達你的核心價值',
  ctas: [
    { label: '開始使用', href: '#start', variant: 'default', primary: true },
    { label: '了解更多', href: '#learn', variant: 'outline', primary: false },
  ],
  image: undefined,
  videoUrl: undefined,
  motion: { variant: 'slideUp', delay: 0 },
};
