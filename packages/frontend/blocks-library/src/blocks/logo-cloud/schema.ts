import { z } from 'zod';

import {
  imageAssetSchema,
  motionConfigSchema,
} from '../_shared/schema-helpers.js';

export const LOGO_CLOUD_VARIANTS = [
  'inline-row',
  'grid-4-mono',
  'grid-6-color',
  'marquee-row',
  'with-headline-stack',
  'bordered-cells',
] as const;

export type LogoCloudVariant = (typeof LOGO_CLOUD_VARIANTS)[number];

const logoItemSchema = z.object({
  name: z.string().min(1),
  image: imageAssetSchema,
  href: z.string().optional(),
});

export const logoCloudSchema = z.object({
  variant: z.enum(LOGO_CLOUD_VARIANTS).default('grid-6-color'),
  headline: z.string().max(160).optional(),
  items: z.array(logoItemSchema).min(2).max(24),
  motion: motionConfigSchema,
});

export type LogoCloudItem = z.infer<typeof logoItemSchema>;
export type LogoCloudProps = z.infer<typeof logoCloudSchema>;

export const logoCloudDefaults: LogoCloudProps = {
  variant: 'grid-6-color',
  headline: '深受品牌信任',
  items: [
    { name: 'Brand A', image: { src: '/logos/a.svg', alt: 'Brand A' } },
    { name: 'Brand B', image: { src: '/logos/b.svg', alt: 'Brand B' } },
    { name: 'Brand C', image: { src: '/logos/c.svg', alt: 'Brand C' } },
    { name: 'Brand D', image: { src: '/logos/d.svg', alt: 'Brand D' } },
    { name: 'Brand E', image: { src: '/logos/e.svg', alt: 'Brand E' } },
    { name: 'Brand F', image: { src: '/logos/f.svg', alt: 'Brand F' } },
  ],
  motion: { variant: 'fadeIn', delay: 0 },
};
