import { z } from 'zod';

import {
  imageAssetSchema,
  motionConfigSchema,
} from '../_shared/schema-helpers.js';

export const FEATURES_GRID_VARIANTS = [
  'grid-2-text',
  'grid-3-icon',
  'grid-3-illustration',
  'grid-4-compact',
  'alternating-rows',
  'bento-mixed',
] as const;

export type FeaturesGridVariant = (typeof FEATURES_GRID_VARIANTS)[number];

const featureItemSchema = z.object({
  title: z.string().min(1).max(80),
  description: z.string().max(280),
  /** Lucide / 自製 icon 名稱，由客戶站 BlockRenderer 解析。 */
  icon: z.string().optional(),
  image: imageAssetSchema.optional(),
});

export const featuresGridSchema = z.object({
  variant: z.enum(FEATURES_GRID_VARIANTS).default('grid-3-icon'),
  eyebrow: z.string().max(80).optional(),
  headline: z.string().max(160).optional(),
  subheadline: z.string().max(320).optional(),
  items: z.array(featureItemSchema).min(2).max(12),
  motion: motionConfigSchema,
});

export type FeaturesGridItem = z.infer<typeof featureItemSchema>;
export type FeaturesGridProps = z.infer<typeof featuresGridSchema>;

const sampleItems: FeaturesGridItem[] = [
  { title: '即時部署', description: '一鍵推上 Vercel，分鐘級上線。', icon: 'zap' },
  { title: '完整型別', description: 'TypeScript strict，從 schema 到 UI 一條龍。', icon: 'shield' },
  { title: '動畫分級', description: 'Level 1-5 動畫，自動降級 reduce-motion。', icon: 'sparkles' },
];

export const featuresGridDefaults: FeaturesGridProps = {
  variant: 'grid-3-icon',
  eyebrow: 'Features',
  headline: '為什麼選擇我們',
  subheadline: '一句話總結核心價值，再用三個重點補強說服力。',
  items: sampleItems,
  motion: { variant: 'slideUp', delay: 0 },
};
