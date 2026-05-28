import { z } from 'zod';

import {
  ctaSchema,
  motionConfigSchema,
} from '../_shared/schema-helpers.js';

export const BANNER_VARIANTS = [
  'announcement-bar',
  'promo-strip',
  'countdown',
  'cookie-consent',
  'warning-alert',
  'launch-takeover',
] as const;

export type BannerVariant = (typeof BANNER_VARIANTS)[number];

export const bannerSchema = z.object({
  variant: z.enum(BANNER_VARIANTS).default('announcement-bar'),
  message: z.string().min(1).max(280),
  cta: ctaSchema.optional(),
  /** countdown 用：截止時間 ISO 字串。 */
  endsAt: z.string().optional(),
  dismissible: z.boolean().default(true),
  tone: z.enum(['neutral', 'primary', 'success', 'warning', 'danger']).default('primary'),
  motion: motionConfigSchema,
});

export type BannerProps = z.infer<typeof bannerSchema>;

export const bannerDefaults: BannerProps = {
  variant: 'announcement-bar',
  message: '新功能上線：AI 文案自動產生器，立即試用',
  cta: { label: '了解詳情', href: '#feature', variant: 'link', primary: false },
  endsAt: undefined,
  dismissible: true,
  tone: 'primary',
  motion: { variant: 'fadeIn', delay: 0 },
};
